import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, CheckCircle2, AlertCircle, CalendarDays, TrendingUp, Trash2 } from 'lucide-react';
import { ActiveProjectsList } from './ActiveProjectsList';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  lifeArea: string;
  status: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
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

export const Dashboard = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const clearAllTrackingData = () => {
    // Clear all tracking related data
    localStorage.removeItem('timeLogs');
    localStorage.removeItem('weeklyTasks');
    localStorage.removeItem('strategySessionHistory');
    localStorage.removeItem('currentStrategySession');
    localStorage.removeItem('readingEntries');
    localStorage.removeItem('writingEntries');
    localStorage.removeItem('leisureEntries');
    
    // Reload data to refresh the dashboard
    loadData();
    
    toast({
      title: "Data Cleared",
      description: "All tracking data has been cleared for testing"
    });
  };

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
    // Get Monday of this week
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get time from time logs - Monday to Sunday
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
    // Get recent time logs
    const sortedLogs = timeLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    return sortedLogs.map(log => ({
      id: log.id,
      task: log.task,
      project: log.project,
      duration: log.duration,
      type: log.type,
      timestamp: log.timestamp,
      source: 'timeLog'
    }));
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Your productivity overview and quick actions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={clearAllTrackingData}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Data
        </Button>
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
