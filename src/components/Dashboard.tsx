import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, BookOpen, PenTool, Brain, Users, Heart, Coffee, CheckCircle2, AlertCircle, CalendarDays, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActiveProjectsList } from './ActiveProjectsList';

interface Project {
  id: string;
  name: string;
  lifeArea: string;
  status: string;
  investedHours?: number;
  spentHours?: number;
  tasks: Task[];
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
  estimatedHours: number;
  investedHours: number;
  spentHours: number;
}

interface TimeLog {
  id: string;
  task: string;
  duration: number;
  type: 'invested' | 'spent';
  timestamp: string;
  project?: string;
  taskId?: string;
}

interface StrategySession {
  date: string;
  completed: boolean;
  completedItems: string[];
  agendaItems: any[];
}

interface LeisureActivity {
  id: number;
  name: string;
  category: string;
  frequency: string;
  intention: string;
  targetSessions: number;
  completedSessions: number;
  lastSession: string;
  totalHours: number;
  sessions: ActivitySession[];
}

interface ActivitySession {
  id: number;
  date: string;
  duration: number;
  notes?: string;
}

interface ReadingEntry {
  id: string;
  title: string;
  author: string;
  status: string;
  type: string;
  category: string;
  sessions: ReadingSession[];
}

interface ReadingSession {
  id: string;
  date: string;
  duration: number;
  pages?: number;
  notes?: string;
}

interface WritingEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const Dashboard = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    const savedTimeLogs = localStorage.getItem('timeLogs');
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
  };

  const getWeeklyTimeData = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    console.log('Dashboard - Calculating weekly time from timeLogs only');

    // Get time from time logs ONLY - this is now our single source of truth
    const weeklyLogs = timeLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfWeek;
    });

    const timeLogInvested = weeklyLogs
      .filter(log => log.type === 'invested')
      .reduce((sum, log) => sum + log.duration, 0) / 60;

    const timeLogSpent = weeklyLogs
      .filter(log => log.type === 'spent')
      .reduce((sum, log) => sum + log.duration, 0) / 60;

    console.log('Dashboard - Weekly totals from timeLogs:', { 
      invested: timeLogInvested, 
      spent: timeLogSpent 
    });

    return { 
      invested: timeLogInvested, 
      spent: timeLogSpent 
    };
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const getNextStrategyDate = () => {
    try {
      const strategyDay = localStorage.getItem('strategyDay') || 'Sunday';
      const sessionHistoryString = localStorage.getItem('strategySessionHistory');
      const sessionHistory: StrategySession[] = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
      const currentSessionString = localStorage.getItem('currentStrategySession');
      const currentSession = currentSessionString ? JSON.parse(currentSessionString) : null;
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = days.indexOf(strategyDay);
      const today = new Date();
      
      if (currentSession && !currentSession.completed) {
        const sessionDate = new Date(currentSession.date);
        const isToday = sessionDate.toDateString() === today.toDateString();
        if (isToday) {
          return `Due Today (${strategyDay})`;
        }
      }
      
      const completedSessions = sessionHistory.filter(session => session.completed);
      
      if (completedSessions.length > 0) {
        completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastSession = completedSessions[0];
        const lastSessionDate = new Date(lastSession.date);
        
        let nextDate = new Date(lastSessionDate);
        nextDate.setDate(lastSessionDate.getDate() + 7);
        
        while (nextDate.getDay() !== targetDayIndex) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        return nextDate.toLocaleDateString();
      } else {
        let daysUntil = targetDayIndex - today.getDay();
        if (daysUntil <= 0) daysUntil += 7;
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntil);
        return nextDate.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error calculating next strategy date:', error);
      return 'Not scheduled';
    }
  };

  const getDaysUntilNextStrategy = () => {
    try {
      const strategyDay = localStorage.getItem('strategyDay') || 'Sunday';
      const sessionHistoryString = localStorage.getItem('strategySessionHistory');
      const sessionHistory: StrategySession[] = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
      const currentSessionString = localStorage.getItem('currentStrategySession');
      const currentSession = currentSessionString ? JSON.parse(currentSessionString) : null;
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = days.indexOf(strategyDay);
      const today = new Date();
      
      if (currentSession && !currentSession.completed) {
        const sessionDate = new Date(currentSession.date);
        const isToday = sessionDate.toDateString() === today.toDateString();
        if (isToday) {
          return '0';
        }
      }
      
      const completedSessions = sessionHistory.filter(session => session.completed);
      
      if (completedSessions.length > 0) {
        completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastSession = completedSessions[0];
        const lastSessionDate = new Date(lastSession.date);
        
        let nextDate = new Date(lastSessionDate);
        nextDate.setDate(lastSessionDate.getDate() + 7);
        
        while (nextDate.getDay() !== targetDayIndex) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        const diffInTime = nextDate.getTime() - today.getTime();
        const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
        return diffInDays.toString();
      } else {
        let daysUntil = targetDayIndex - today.getDay();
        if (daysUntil <= 0) daysUntil += 7;
        return daysUntil.toString();
      }
    } catch (error) {
      console.error('Error calculating days until next strategy:', error);
      return 'N/A';
    }
  };

  const getRecentActivity = () => {
    // Only use timeLogs - single source of truth
    const allActivities = timeLogs.map(log => ({
      id: log.id,
      task: log.task,
      project: log.project,
      duration: log.duration * 60, // Convert to seconds for consistency
      type: log.type,
      timestamp: log.timestamp,
      source: 'timeLog'
    }));
    
    // Sort by timestamp
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Consolidate duplicate activities by task name and date
    const consolidatedActivities = [];
    const activityMap = new Map();

    sortedActivities.forEach(activity => {
      const dateKey = new Date(activity.timestamp).toDateString();
      const key = `${activity.task}-${dateKey}`;
      
      if (activityMap.has(key)) {
        // Combine duration with existing activity
        const existing = activityMap.get(key);
        existing.duration += activity.duration;
        existing.combinedSessions = (existing.combinedSessions || 1) + 1;
      } else {
        // Add new activity
        activityMap.set(key, { ...activity, combinedSessions: 1 });
        consolidatedActivities.push(activityMap.get(key));
      }
    });

    return consolidatedActivities.slice(0, 5);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const weeklyTime = getWeeklyTimeData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Your productivity overview and quick actions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-sm text-slate-500">All active and postponed projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatHours(weeklyTime.invested)}</div>
            <p className="text-sm text-slate-500">This week's invested time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatHours(weeklyTime.spent)}</div>
            <p className="text-sm text-slate-500">This week's spent time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Strategy Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Weekly Strategy Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Next Session:</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{getNextStrategyDate()}</div>
            <div className="text-sm text-slate-500">
              {getDaysUntilNextStrategy()} days until your next planning session.
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <ActiveProjectsList />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getRecentActivity().length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-slate-400" />
              <p>No recent activity found.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {getRecentActivity().map((activity: any) => (
                <li key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">
                      {activity.task}
                      {activity.combinedSessions > 1 && (
                        <span className="text-sm text-slate-500 ml-2">
                          ({activity.combinedSessions} sessions)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {activity.project && `${activity.project} - `}
                      {new Date(activity.timestamp).toLocaleDateString()} - {formatTime(activity.duration)}
                    </div>
                  </div>
                  <Badge variant="secondary" className={activity.type === 'invested' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {activity.type === 'invested' ? 'Invested' : 'Spent'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
