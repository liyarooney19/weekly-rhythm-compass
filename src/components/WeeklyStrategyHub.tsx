
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckCircle2, Clock, ChevronDown, ChevronRight, Target, FileText, Timer, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklySession {
  id: string;
  date: string;
  completed: boolean;
  completedItems: string[];
  notes: {
    notesReview: string;
    dissatisfactionsUpdate: string;
    prioritiesAdjustment: string;
    timeReflection: string;
    tasksPlanning: string;
    pomodoroPlanning: string;
  };
}

export const WeeklyStrategyHub = () => {
  const { toast } = useToast();
  const [strategyDay, setStrategyDay] = useState('Sunday');
  const [currentSession, setCurrentSession] = useState<WeeklySession>({
    id: '',
    date: '',
    completed: false,
    completedItems: [],
    notes: {
      notesReview: '',
      dissatisfactionsUpdate: '',
      prioritiesAdjustment: '',
      timeReflection: '',
      tasksPlanning: '',
      pomodoroPlanning: ''
    }
  });
  const [sessionHistory, setSessionHistory] = useState<WeeklySession[]>([]);
  const [openSections, setOpenSections] = useState<string[]>(['notesReview']);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const agendaItems = [
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
    loadData();
    initializeCurrentSession();
  }, []);

  const loadData = () => {
    const savedStrategyDay = localStorage.getItem('weeklyStrategyDay');
    if (savedStrategyDay) {
      setStrategyDay(savedStrategyDay);
    }

    const savedHistory = localStorage.getItem('weeklyStrategyHistory');
    if (savedHistory) {
      setSessionHistory(JSON.parse(savedHistory));
    }

    const savedCurrentSession = localStorage.getItem('currentWeeklySession');
    if (savedCurrentSession) {
      const parsed = JSON.parse(savedCurrentSession);
      const currentWeek = getWeekId(new Date());
      if (parsed.id === currentWeek && !parsed.completed) {
        setCurrentSession(parsed);
        return;
      }
    }
  };

  const initializeCurrentSession = () => {
    const today = new Date();
    const currentWeek = getWeekId(today);
    
    const newSession = {
      id: currentWeek,
      date: today.toISOString(),
      completed: false,
      completedItems: [],
      notes: {
        notesReview: '',
        dissatisfactionsUpdate: '',
        prioritiesAdjustment: '',
        timeReflection: '',
        tasksPlanning: '',
        pomodoroPlanning: ''
      }
    };

    setCurrentSession(newSession);
    localStorage.setItem('currentWeeklySession', JSON.stringify(newSession));
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

  const updateNote = (noteType: keyof typeof currentSession.notes, value: string) => {
    const updatedSession = {
      ...currentSession,
      notes: {
        ...currentSession.notes,
        [noteType]: value
      }
    };
    setCurrentSession(updatedSession);
    localStorage.setItem('currentWeeklySession', JSON.stringify(updatedSession));
  };

  const toggleItemCompletion = (itemId: string) => {
    const updatedSession = {
      ...currentSession,
      completedItems: currentSession.completedItems.includes(itemId)
        ? currentSession.completedItems.filter(id => id !== itemId)
        : [...currentSession.completedItems, itemId]
    };
    setCurrentSession(updatedSession);
    localStorage.setItem('currentWeeklySession', JSON.stringify(updatedSession));
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
    return Math.round((currentSession.completedItems.length / agendaItems.length) * 100);
  };

  const allItemsCompleted = () => {
    return currentSession.completedItems.length === agendaItems.length;
  };

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

      {/* Strategy Day Setting */}
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
                        value={currentSession.notes[item.id as keyof typeof currentSession.notes]}
                        onChange={(e) => updateNote(item.id as keyof typeof currentSession.notes, e.target.value)}
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
