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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  const getNextStrategyDate = () => {
    try {
      // Get strategy day preference (default to Sunday)
      const strategyDay = localStorage.getItem('strategyDay') || 'Sunday';
      
      // Get session history
      const sessionHistoryString = localStorage.getItem('strategySessionHistory');
      const sessionHistory: StrategySession[] = sessionHistoryString ? JSON.parse(sessionHistoryString) : [];
      
      // Check if there's a current active session
      const currentSessionString = localStorage.getItem('currentStrategySession');
      const currentSession = currentSessionString ? JSON.parse(currentSessionString) : null;
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = days.indexOf(strategyDay);
      const today = new Date();
      
      // If there's an active session today, show when it's due
      if (currentSession && !currentSession.completed) {
        const sessionDate = new Date(currentSession.date);
        const isToday = sessionDate.toDateString() === today.toDateString();
        if (isToday) {
          return `Due Today (${strategyDay})`;
        }
      }
      
      // Find the most recent completed session
      const completedSessions = sessionHistory.filter(session => session.completed);
      
      if (completedSessions.length > 0) {
        // Sort by date descending to get the most recent
        completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastSession = completedSessions[0];
        const lastSessionDate = new Date(lastSession.date);
        
        // Calculate next strategy date from the last completed session
        let nextDate = new Date(lastSessionDate);
        nextDate.setDate(lastSessionDate.getDate() + 7); // Add 7 days for next week
        
        // Ensure it's on the correct day of the week
        while (nextDate.getDay() !== targetDayIndex) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        return nextDate.toLocaleDateString();
      } else {
        // No completed sessions, calculate next occurrence of strategy day
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
      
      // If there's an active session today
      if (currentSession && !currentSession.completed) {
        const sessionDate = new Date(currentSession.date);
        const isToday = sessionDate.toDateString() === today.toDateString();
        if (isToday) {
          return '0';
        }
      }
      
      // Find the most recent completed session
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

  const getLifeAreaIcon = (area: string) => {
    const icons: { [key: string]: any } = {
      'Work / Career': PenTool,
      'Personal Growth': Brain,
      'Creative Projects': PenTool,
      'Health & Routines': Heart,
      'Relationships / Family': Users,
      'Leisure/Hobby': Coffee
    };
    return icons[area] || BookOpen;
  };

  const getLifeAreaColor = (lifeArea: string) => {
    const colors = {
      'Work / Career': 'bg-purple-100 text-purple-800',
      'Personal Growth': 'bg-blue-100 text-blue-800',
      'Creative Projects': 'bg-orange-100 text-orange-800',
      'Health & Routines': 'bg-red-100 text-red-800',
      'Relationships / Family': 'bg-pink-100 text-pink-800',
      'Leisure/Hobby': 'bg-green-100 text-green-800'
    };
    return colors[lifeArea as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getRecentActivity = () => {
    const timeLogsString = localStorage.getItem('timeLogs');
    if (!timeLogsString) return [];
  
    try {
      const timeLogs = JSON.parse(timeLogsString);
      const sortedLogs = timeLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return sortedLogs.slice(0, 5);
    } catch (error) {
      console.error("Error parsing timeLogs from localStorage:", error);
      return [];
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Your productivity overview and quick actions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Weekly Focus Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8.2</div>
            <p className="text-sm text-slate-500">Based on time allocation and goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18</div>
            <p className="text-sm text-slate-500">This week's accomplishments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">45h 30m</div>
            <p className="text-sm text-slate-500">Total time on projects this week</p>
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
            <Progress value={65} className="h-2 mt-2" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress towards weekly goals</span>
              <span>65%</span>
            </div>
            <Button variant="secondary" className="w-full">
              Review Strategy
            </Button>
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
              {getRecentActivity().map((log: any) => (
                <li key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">{log.task}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()} - {log.duration} minutes
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {log.type === 'invested' ? 'Invested' : 'Spent'}
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
