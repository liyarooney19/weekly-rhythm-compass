import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, CheckCircle2, AlertCircle, CalendarDays, TrendingUp, Trash2, PlayCircle, StopCircle } from 'lucide-react';
import { ActiveProjectsList } from './ActiveProjectsList';
import { useToast } from '@/hooks/use-toast';
import { generateDemoProjects, generateDemoTimeLogs, generateDemoReadingItems, generateDemoStrategySession } from '@/utils/demoData';

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
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    toast({
      title: isDemoMode ? "Demo Mode Disabled" : "Demo Mode Enabled",
      description: isDemoMode ? "Switched back to your real data" : "Switched to demo data for presentation"
    });
  };

  const clearTimeTrackingData = () => {
    // Clear only time tracking related data
    localStorage.removeItem('timeLogs');
    localStorage.removeItem('timerState');
    
    // Reload data to refresh the dashboard
    loadData();
    
    toast({
      title: "Time Tracking Data Cleared",
      description: "All time logs and timer state have been cleared for testing"
    });
  };

  const loadData = () => {
    if (isDemoMode) {
      // Load demo data
      setProjects(generateDemoProjects());
      setTimeLogs(generateDemoTimeLogs());
      
      // Set demo data in localStorage temporarily for other components
      localStorage.setItem('demoProjects', JSON.stringify(generateDemoProjects()));
      localStorage.setItem('demoTimeLogs', JSON.stringify(generateDemoTimeLogs()));
      localStorage.setItem('demoReadingItems', JSON.stringify(generateDemoReadingItems()));
      
      // Set demo strategy session data
      const demoStrategy = generateDemoStrategySession();
      localStorage.setItem('demoStrategyDay', demoStrategy.strategyDay);
      localStorage.setItem('demoStrategySessionHistory', JSON.stringify(demoStrategy.strategySessionHistory));
    } else {
      // Load real data
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }

      const savedTimeLogs = localStorage.getItem('timeLogs');
      if (savedTimeLogs) {
        setTimeLogs(JSON.parse(savedTimeLogs));
      }
      
      // Clear demo data from localStorage
      localStorage.removeItem('demoProjects');
      localStorage.removeItem('demoTimeLogs');
      localStorage.removeItem('demoReadingItems');
      localStorage.removeItem('demoStrategyDay');
      localStorage.removeItem('demoStrategySessionHistory');
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
      const strategyDay = isDemoMode 
        ? localStorage.getItem('demoStrategyDay') || 'Sunday'
        : localStorage.getItem('strategyDay') || 'Sunday';
      const sessionHistoryString = isDemoMode
        ? localStorage.getItem('demoStrategySessionHistory')
        : localStorage.getItem('strategySessionHistory');
      const sessionHistory: StrategySession[] = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
      const currentSessionString = isDemoMode
        ? null  // Demo mode doesn't have current sessions
        : localStorage.getItem('currentStrategySession');
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
      const strategyDay = isDemoMode 
        ? localStorage.getItem('demoStrategyDay') || 'Sunday'
        : localStorage.getItem('strategyDay') || 'Sunday';
      const sessionHistoryString = isDemoMode
        ? localStorage.getItem('demoStrategySessionHistory')
        : localStorage.getItem('strategySessionHistory');
      const sessionHistory: StrategySession[] = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
      const currentSessionString = isDemoMode
        ? null
        : localStorage.getItem('currentStrategySession');
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

  const formatActivityDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
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
        <div className="flex gap-2">
          <Button 
            variant={isDemoMode ? "default" : "outline"}
            onClick={toggleDemoMode}
            className={isDemoMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isDemoMode ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Exit Demo
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Demo Mode
              </>
            )}
          </Button>
          {!isDemoMode && (
            <Button 
              variant="outline" 
              onClick={clearTimeTrackingData}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Time Logs
            </Button>
          )}
        </div>
      </div>

      {isDemoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Demo Mode Active</p>
              <p className="text-sm text-blue-700">Showing sample data for presentation purposes</p>
            </div>
          </div>
        </div>
      )}

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
        <ActiveProjectsList isDemoMode={isDemoMode} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getRecentActivity().length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-slate-400" />
              <p>No recent activity found.</p>
              <p className="text-sm">Start logging time to see your activity here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getRecentActivity().map((activity: any) => (
                <div key={activity.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800 truncate">{activity.task}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            activity.type === 'invested' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {activity.type === 'invested' ? 'Invested' : 'Spent'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {activity.project && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="truncate">{activity.project}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatActivityDate(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-slate-800">
                        {formatTime(activity.duration)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
