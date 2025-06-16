
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CheckCircle2, Clock, ChevronDown, ChevronRight, Target, FileText, Timer, Settings2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklySession {
  id: string;
  date: string;
  completed: boolean;
  completedItems: string[];
  notes: Record<string, string>;
}

interface AgendaItem {
  id: string;
  title: string;
  icon: any;
  description: string;
}

export const WeeklyStrategyHub = () => {
  const { toast } = useToast();
  const [strategyDay, setStrategyDay] = useState('Sunday');
  const [currentSession, setCurrentSession] = useState<WeeklySession>({
    id: '',
    date: '',
    completed: false,
    completedItems: [],
    notes: {}
  });
  const [sessionHistory, setSessionHistory] = useState<WeeklySession[]>([]);
  const [openSections, setOpenSections] = useState<string[]>(['notesReview']);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [editAgendaDialog, setEditAgendaDialog] = useState(false);
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const defaultAgendaItems = [
    {
      id: 'notesReview',
      title: 'Review and clean up notes and drafts',
      icon: FileText,
      description: 'Go through your notes, organize thoughts, clean up drafts'
    },
    {
      id: 'dissatisfactionsUpdate',
      title: 'Update list of dissatisfactions',
      icon: Target,
      description: 'Reflect on current dissatisfactions, add new ones, resolve completed ones'
    },
    {
      id: 'prioritiesAdjustment',
      title: 'Adjust priorities of current projects',
      icon: Settings2,
      description: 'Review project priorities based on recent progress and changing circumstances'
    },
    {
      id: 'timeReflection',
      title: 'Reflect on time spent/invested last week',
      icon: Clock,
      description: 'Analyze how time was allocated, identify patterns and improvements'
    },
    {
      id: 'tasksPlanning',
      title: 'Adjust project tasks for coming week',
      icon: CheckCircle2,
      description: 'Plan specific tasks and deliverables for the upcoming week'
    },
    {
      id: 'pomodoroPlanning',
      title: 'Plan in Pomodoro tracker and assign time estimates',
      icon: Timer,
      description: 'Allocate time blocks and estimate effort for planned tasks'
    }
  ];

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        await loadData();
        initializeCurrentSession();
      } catch (error) {
        console.error('Error initializing WeeklyStrategyHub:', error);
        // Set default values on error
        setAgendaItems(defaultAgendaItems);
        initializeCurrentSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Save progress whenever session changes
  useEffect(() => {
    if (currentSession.id && !isLoading) {
      try {
        localStorage.setItem('currentWeeklySession', JSON.stringify(currentSession));
      } catch (error) {
        console.error('Error saving current session:', error);
      }
    }
  }, [currentSession, isLoading]);

  const loadData = async () => {
    try {
      const savedStrategyDay = localStorage.getItem('weeklyStrategyDay');
      if (savedStrategyDay) {
        setStrategyDay(savedStrategyDay);
      }

      const savedHistory = localStorage.getItem('weeklyStrategyHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setSessionHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      }

      const savedAgenda = localStorage.getItem('weeklyAgendaItems');
      if (savedAgenda) {
        const parsedAgenda = JSON.parse(savedAgenda);
        setAgendaItems(Array.isArray(parsedAgenda) ? parsedAgenda : defaultAgendaItems);
      } else {
        setAgendaItems(defaultAgendaItems);
      }

      const savedCurrentSession = localStorage.getItem('currentWeeklySession');
      if (savedCurrentSession) {
        const parsed = JSON.parse(savedCurrentSession);
        const currentWeek = getWeekId(new Date());
        if (parsed.id === currentWeek && !parsed.completed) {
          setCurrentSession({
            ...parsed,
            completedItems: Array.isArray(parsed.completedItems) ? parsed.completedItems : [],
            notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {}
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAgendaItems(defaultAgendaItems);
    }
  };

  const initializeCurrentSession = () => {
    try {
      const today = new Date();
      const currentWeek = getWeekId(today);
      
      const newSession = {
        id: currentWeek,
        date: today.toISOString(),
        completed: false,
        completedItems: [],
        notes: {}
      };

      setCurrentSession(newSession);
      localStorage.setItem('currentWeeklySession', JSON.stringify(newSession));
    } catch (error) {
      console.error('Error initializing current session:', error);
    }
  };

  const getWeekId = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber}`;
  };

  const isSessionDue = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const targetDayIndex = days.indexOf(strategyDay);
    return dayIndex === targetDayIndex;
  };

  const getNextSessionDate = () => {
    const today = new Date();
    const targetDayIndex = days.indexOf(strategyDay);
    const todayIndex = today.getDay();
    const daysUntil = (targetDayIndex - todayIndex + 7) % 7;
    const nextSession = new Date(today);
    nextSession.setDate(today.getDate() + (daysUntil === 0 ? 7 : daysUntil));
    return nextSession.toLocaleDateString();
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateNote = (noteType: string, value: string) => {
    const updatedSession = {
      ...currentSession,
      notes: {
        ...currentSession.notes,
        [noteType]: value
      }
    };
    setCurrentSession(updatedSession);
  };

  const toggleItemCompletion = (itemId: string) => {
    const updatedSession = {
      ...currentSession,
      completedItems: currentSession.completedItems.includes(itemId)
        ? currentSession.completedItems.filter(id => id !== itemId)
        : [...currentSession.completedItems, itemId]
    };
    setCurrentSession(updatedSession);
  };

  const saveStrategyDay = (day: string) => {
    setStrategyDay(day);
    localStorage.setItem('weeklyStrategyDay', day);
    toast({
      title: "Strategy Day Updated",
      description: `Your weekly strategy session is now scheduled for ${day}s`
    });
  };

  const completeSession = () => {
    const completedSession = {
      ...currentSession,
      completed: true,
      date: new Date().toISOString()
    };

    const updatedHistory = [completedSession, ...sessionHistory];
    setSessionHistory(updatedHistory);
    localStorage.setItem('weeklyStrategyHistory', JSON.stringify(updatedHistory));
    localStorage.removeItem('currentWeeklySession');

    toast({
      title: "Weekly Strategy Session Completed",
      description: "Great job! Your session has been saved to history."
    });

    // Reset for next session
    initializeCurrentSession();
    setOpenSections(['notesReview']);
  };

  const getCompletionPercentage = () => {
    if (!agendaItems || agendaItems.length === 0) return 0;
    return Math.round((currentSession.completedItems.length / agendaItems.length) * 100);
  };

  const allItemsCompleted = () => {
    return agendaItems && agendaItems.length > 0 && currentSession.completedItems.length === agendaItems.length;
  };

  const saveAgendaItems = (items: AgendaItem[]) => {
    setAgendaItems(items);
    localStorage.setItem('weeklyAgendaItems', JSON.stringify(items));
  };

  const addAgendaItem = () => {
    if (!newAgendaItem.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an agenda item title",
        variant: "destructive"
      });
      return;
    }

    const newItem: AgendaItem = {
      id: `custom_${Date.now()}`,
      title: newAgendaItem.title.trim(),
      description: newAgendaItem.description.trim(),
      icon: Target
    };

    const updatedItems = [...agendaItems, newItem];
    saveAgendaItems(updatedItems);

    setNewAgendaItem({ title: '', description: '' });
    toast({
      title: "Agenda Item Added",
      description: "New item has been added to your weekly agenda"
    });
  };

  const deleteAgendaItem = (itemId: string) => {
    const updatedItems = agendaItems.filter(item => item.id !== itemId);
    saveAgendaItems(updatedItems);

    // Remove from current session if it exists
    const updatedSession = {
      ...currentSession,
      completedItems: currentSession.completedItems.filter(id => id !== itemId),
      notes: Object.fromEntries(
        Object.entries(currentSession.notes).filter(([key]) => key !== itemId)
      )
    };
    setCurrentSession(updatedSession);

    toast({
      title: "Agenda Item Deleted",
      description: "Item has been removed from your weekly agenda"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Strategy Hub</h1>
            <p className="text-slate-600">Loading your weekly strategy session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agendaItems || agendaItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Strategy Hub</h1>
            <p className="text-slate-600">Setting up your weekly strategy session...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600">Initializing your weekly strategy agenda...</p>
            <Button 
              onClick={() => {
                setAgendaItems(defaultAgendaItems);
                initializeCurrentSession();
              }}
              className="mt-4"
            >
              Initialize Default Agenda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Strategy Hub</h1>
          <p className="text-slate-600">Your recurring weekly strategy and planning session</p>
        </div>
        {isSessionDue() && (
          <Badge variant="default" className="bg-green-600">
            <Calendar className="h-4 w-4 mr-1" />
            Session Due Today
          </Badge>
        )}
      </div>

      {/* Strategy Day Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Strategy Day Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Weekly Strategy Day:</span>
              <Select value={strategyDay} onValueChange={saveStrategyDay}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isSessionDue() && (
              <div className="text-sm text-slate-500">
                Next session: {getNextSessionDate()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manage Agenda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manage Weekly Agenda</span>
            <Dialog open={editAgendaDialog} onOpenChange={setEditAgendaDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Agenda
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Weekly Strategy Agenda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {agendaItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.description}</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteAgendaItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add New Agenda Item</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Agenda item title..."
                        value={newAgendaItem.title}
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, title: e.target.value})}
                      />
                      <Textarea
                        placeholder="Description..."
                        value={newAgendaItem.description}
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, description: e.target.value})}
                      />
                      <Button onClick={addAgendaItem} disabled={!newAgendaItem.title.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Session Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Session Progress</span>
            <span className="text-lg font-bold">{getCompletionPercentage()}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={getCompletionPercentage()} className="mb-4" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {currentSession.completedItems.length} of {agendaItems.length} items completed
            </span>
            <Button 
              onClick={completeSession}
              disabled={!allItemsCompleted()}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Strategy Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Strategy Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agendaItems.map(item => {
            const Icon = item.icon;
            const isOpen = openSections.includes(item.id);
            const isCompleted = currentSession.completedItems.includes(item.id);

            return (
              <div key={item.id} className="border rounded-lg">
                <div className="flex items-center gap-3 p-4">
                  <Checkbox 
                    checked={isCompleted}
                    onCheckedChange={() => toggleItemCompletion(item.id)}
                  />
                  <Collapsible open={isOpen} onOpenChange={() => toggleSection(item.id)} className="flex-1">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                          <div className="text-left">
                            <div className={`font-medium ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                              {item.title}
                            </div>
                            <div className="text-sm text-slate-500">{item.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-0 pb-4">
                      <Textarea
                        placeholder={`Notes for: ${item.title}`}
                        value={currentSession.notes[item.id] || ''}
                        onChange={(e) => updateNote(item.id, e.target.value)}
                        className="min-h-[120px] mt-3"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            );
          })}
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
              {sessionHistory.slice(0, 5).map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Week {session.id}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              ))}
              {sessionHistory.length > 5 && (
                <div className="text-sm text-slate-500 text-center pt-2">
                  ... and {sessionHistory.length - 5} more sessions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
