
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, Plus, Edit, Save, X, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgendaItem {
  id: string;
  title: string;
  completed: boolean;
  isExpanded: boolean;
}

interface StrategySession {
  date: string;
  completed: boolean;
  completedItems: string[];
}

const defaultAgendaItems: AgendaItem[] = [
  { id: '1', title: 'Review and clean up notes and drafts', completed: false, isExpanded: false },
  { id: '2', title: 'Update list of dissatisfactions', completed: false, isExpanded: false },
  { id: '3', title: 'Adjust priorities of current projects', completed: false, isExpanded: false },
  { id: '4', title: 'Reflect on time spent/invested last week', completed: false, isExpanded: false },
  { id: '5', title: 'Adjust project tasks for coming week', completed: false, isExpanded: false },
  { id: '6', title: 'Plan in Pomodoro tracker and assign time estimates', completed: false, isExpanded: false }
];

export const WeeklyStrategyHub = () => {
  const { toast } = useToast();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(defaultAgendaItems);
  const [strategyDay, setStrategyDay] = useState('Sunday');
  const [sessionHistory, setSessionHistory] = useState<StrategySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StrategySession | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedAgenda = localStorage.getItem('weeklyStrategyAgenda');
      if (savedAgenda) {
        const parsed = JSON.parse(savedAgenda);
        if (Array.isArray(parsed)) {
          setAgendaItems(parsed);
        }
      }

      const savedStrategyDay = localStorage.getItem('strategyDay');
      if (savedStrategyDay) {
        setStrategyDay(savedStrategyDay);
      }

      const savedHistory = localStorage.getItem('strategySessionHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setSessionHistory(parsed);
        }
      }

      const savedCurrentSession = localStorage.getItem('currentStrategySession');
      if (savedCurrentSession) {
        const parsed = JSON.parse(savedCurrentSession);
        setCurrentSession(parsed);
      }
    } catch (error) {
      console.error('Error loading strategy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAgenda = (items: AgendaItem[]) => {
    setAgendaItems(items);
    localStorage.setItem('weeklyStrategyAgenda', JSON.stringify(items));
  };

  const saveStrategyDay = (day: string) => {
    setStrategyDay(day);
    localStorage.setItem('strategyDay', day);
  };

  const startNewSession = () => {
    const newSession: StrategySession = {
      date: new Date().toISOString().split('T')[0],
      completed: false,
      completedItems: []
    };
    setCurrentSession(newSession);
    localStorage.setItem('currentStrategySession', JSON.stringify(newSession));
    
    // Reset all agenda items
    const resetItems = agendaItems.map(item => ({ ...item, completed: false }));
    saveAgenda(resetItems);

    toast({
      title: "Strategy Session Started",
      description: "Your weekly strategy session has begun"
    });
  };

  const completeSession = () => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      completed: true,
      completedItems: agendaItems.filter(item => item.completed).map(item => item.id)
    };

    const updatedHistory = [...sessionHistory, completedSession];
    setSessionHistory(updatedHistory);
    localStorage.setItem('strategySessionHistory', JSON.stringify(updatedHistory));
    
    setCurrentSession(null);
    localStorage.removeItem('currentStrategySession');

    toast({
      title: "Session Completed",
      description: "Your strategy session has been saved to history"
    });
  };

  const toggleAgendaItem = (itemId: string) => {
    const updatedItems = agendaItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    saveAgenda(updatedItems);
  };

  const toggleExpanded = (itemId: string) => {
    const updatedItems = agendaItems.map(item =>
      item.id === itemId ? { ...item, isExpanded: !item.isExpanded } : item
    );
    saveAgenda(updatedItems);
  };

  const startEditItem = (item: AgendaItem) => {
    setEditingItem(item.id);
    setEditText(item.title);
  };

  const saveEditItem = () => {
    if (!editText.trim() || !editingItem) return;

    const updatedItems = agendaItems.map(item =>
      item.id === editingItem ? { ...item, title: editText.trim() } : item
    );
    saveAgenda(updatedItems);
    setEditingItem(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
  };

  const addNewItem = () => {
    if (!newItemText.trim()) return;

    const newItem: AgendaItem = {
      id: Date.now().toString(),
      title: newItemText.trim(),
      completed: false,
      isExpanded: false
    };

    const updatedItems = [...agendaItems, newItem];
    saveAgenda(updatedItems);
    setNewItemText('');

    toast({
      title: "Agenda Item Added",
      description: "New item added to your strategy agenda"
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = agendaItems.filter(item => item.id !== itemId);
    saveAgenda(updatedItems);
  };

  const getNextStrategyDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const targetDay = days.indexOf(strategyDay);
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toLocaleDateString();
  };

  const getCompletionPercentage = () => {
    if (agendaItems.length === 0) return 0;
    const completed = agendaItems.filter(item => item.completed).length;
    return Math.round((completed / agendaItems.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading weekly strategy hub...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Strategy Hub</h1>
        <p className="text-slate-600">Manage your weekly strategy sessions and agenda</p>
      </div>

      {/* Strategy Day Setting & Session Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Strategy Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={strategyDay}
              onChange={(e) => saveStrategyDay(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <p className="text-sm text-slate-600 mt-2">
              Next session: {getNextStrategyDate()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSession ? (
              <div className="space-y-3">
                <p className="text-sm text-green-600">Session in progress ({currentSession.date})</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                  <div className="text-sm text-slate-600">completed</div>
                </div>
                <Button onClick={completeSession} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">No active session</p>
                <Button onClick={startNewSession} className="w-full">
                  Start New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Strategy Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new agenda item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
            />
            <Button onClick={addNewItem} disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Agenda Items */}
          <div className="space-y-2">
            {agendaItems.map((item) => (
              <Collapsible key={item.id} open={item.isExpanded}>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleAgendaItem(item.id)}
                    />
                    
                    {editingItem === item.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditItem()}
                        />
                        <Button size="sm" onClick={saveEditItem}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CollapsibleTrigger 
                          className="flex-1 flex items-center gap-2 text-left hover:bg-slate-50 p-1 rounded"
                          onClick={() => toggleExpanded(item.id)}
                        >
                          <span className={`flex-1 ${item.completed ? 'line-through text-slate-500' : ''}`}>
                            {item.title}
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${item.isExpanded ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        
                        <Button size="sm" variant="outline" onClick={() => startEditItem(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <CollapsibleContent className="mt-3">
                    <div className="pl-6 text-sm text-slate-600 border-l-2 border-slate-200">
                      <p>Use this space for notes, thoughts, or action items related to: "{item.title}"</p>
                      <p className="text-xs mt-1">Click to expand and add your session notes here.</p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>

          {agendaItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No agenda items yet.</p>
              <p className="text-sm">Add your first agenda item above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionHistory.slice(-5).reverse().map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{new Date(session.date).toLocaleDateString()}</div>
                    <div className="text-sm text-slate-600">
                      {session.completedItems.length} items completed
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
