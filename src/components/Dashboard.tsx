import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, Target, BookOpen, FileText, Gamepad2, Calendar, Trash2, Settings, FolderOpen, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [readingItems, setReadingItems] = useState<any[]>([]);
  const [leisureActivities, setLeisureActivities] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [strategyDay, setStrategyDay] = useState('Sunday');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load projects
    const savedProjects = localStorage.getItem('projects');
    setProjects(savedProjects ? JSON.parse(savedProjects) : []);

    const savedReadingItems = localStorage.getItem('readingItems');
    setReadingItems(savedReadingItems ? JSON.parse(savedReadingItems) : []);

    const savedLeisureActivities = localStorage.getItem('leisureActivities');
    setLeisureActivities(savedLeisureActivities ? JSON.parse(savedLeisureActivities) : []);

    const savedTimeLogs = localStorage.getItem('timeLogs');
    setTimeLogs(savedTimeLogs ? JSON.parse(savedTimeLogs) : []);

    // Load strategy session data
    const savedStrategyDay = localStorage.getItem('strategyDay') || localStorage.getItem('weeklyStrategyDay');
    if (savedStrategyDay) {
      setStrategyDay(savedStrategyDay);
    }

    const savedCurrentSession = localStorage.getItem('currentStrategySession');
    if (savedCurrentSession) {
      setCurrentSession(JSON.parse(savedCurrentSession));
    }

    // Load session history
    const savedHistory = localStorage.getItem('strategySessionHistory');
    if (savedHistory) {
      setSessionHistory(JSON.parse(savedHistory));
    }
  };

  const resetAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('strategySession');
    localStorage.removeItem('projects');
    localStorage.removeItem('timeLogs');
    localStorage.removeItem('weeklyTasks');
    localStorage.removeItem('leisureActivities');
    localStorage.removeItem('writingNotes');
    localStorage.removeItem('readingList');
    localStorage.removeItem('readingItems');
    localStorage.removeItem('weeklyStrategyDay');
    localStorage.removeItem('weeklyStrategyHistory');
    localStorage.removeItem('strategyDay');
    localStorage.removeItem('currentStrategySession');
    localStorage.removeItem('weeklyStrategyAgenda');
    localStorage.removeItem('strategySessionHistory');
    
    toast({
      title: "Success",
      description: "All data has been reset. You can now start fresh!"
    });
    
    window.location.reload();
  };

  // Calculate weekly progress from actual data
  const calculateWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLogs = timeLogs.filter(log => 
      new Date(log.timestamp) >= oneWeekAgo
    );
    
    const totalHours = weeklyLogs.reduce((sum, log) => sum + (log.duration / 60), 0);
    const investedHours = weeklyLogs
      .filter(log => log.type === 'invested')
      .reduce((sum, log) => sum + (log.duration / 60), 0);
    const spentHours = weeklyLogs
      .filter(log => log.type === 'spent')
      .reduce((sum, log) => sum + (log.duration / 60), 0);

    return {
      totalHours: Math.round(totalHours).toString(),
      investedHours: Math.round(investedHours).toString(),
      spentHours: Math.round(spentHours).toString(),
      investedPercentage: totalHours > 0 ? Math.round((investedHours / totalHours) * 100) : 0,
      spentPercentage: totalHours > 0 ? Math.round((spentHours / totalHours) * 100) : 0
    };
  };

  const weeklyProgress = calculateWeeklyProgress();

  // Get active projects with progress - show ALL active projects, not just 3
  const getActiveProjects = () => {
    return projects
      .filter(project => project.status === 'active' || !project.status)
      .map(project => ({
        name: project.name,
        hours: Math.round(project.investedHours || 0),
        category: project.lifeArea || 'General',
        progress: project.progress || 0
      }));
  };

  const activeProjects = getActiveProjects();
  const activeProjectsCount = projects.filter(project => project.status === 'active' || !project.status).length;

  // Updated strategy session logic with proper next date calculation
  const getLastCompletedSessionDate = () => {
    if (sessionHistory.length === 0) return null;
    const sortedHistory = sessionHistory
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedHistory.length > 0 ? new Date(sortedHistory[0].date) : null;
  };

  const isStrategySessionDue = () => {
    if (currentSession) return false;
    
    const today = new Date();
    const dayIndex = today.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(strategyDay);
    
    // If today is the strategy day
    if (dayIndex === targetDayIndex) {
      const lastCompleted = getLastCompletedSessionDate();
      if (!lastCompleted) return true; // No sessions completed yet
      
      // Check if last session was completed before today
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      return lastCompleted < todayStart;
    }
    
    return false;
  };

  const getNextStrategyDate = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(strategyDay);
    
    const lastCompleted = getLastCompletedSessionDate();
    
    if (lastCompleted) {
      // Calculate next session from last completed date
      const nextSession = new Date(lastCompleted);
      nextSession.setDate(lastCompleted.getDate() + 7); // Add 7 days for weekly interval
      return nextSession.toLocaleDateString();
    } else {
      // No completed sessions yet, calculate from today
      const todayIndex = today.getDay();
      const daysUntil = (targetDayIndex - todayIndex + 7) % 7;
      const nextSession = new Date(today);
      nextSession.setDate(today.getDate() + (daysUntil === 0 ? 7 : daysUntil));
      return nextSession.toLocaleDateString();
    }
  };

  const getStrategySessionStatus = () => {
    if (currentSession) {
      return {
        status: 'in-progress',
        text: `Session in progress (${currentSession.date})`,
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      };
    }
    
    if (isStrategySessionDue()) {
      return {
        status: 'due',
        text: `Your weekly strategy session is due today (${strategyDay})!`,
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }
    
    return {
      status: 'scheduled',
      text: `Next session scheduled for ${getNextStrategyDate()} (${strategyDay})`,
      color: 'bg-slate-50 border-slate-200 text-slate-800'
    };
  };

  const sessionStatus = getStrategySessionStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to your personal development operating system</p>
      </div>

      {/* Strategy Session Status */}
      <Card className={sessionStatus.color}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${sessionStatus.color.includes('text-') ? '' : 'text-slate-800'}`}>
            <Settings className="h-5 w-5" />
            Weekly Strategy Session
            {sessionStatus.status === 'due' && <Badge className="bg-green-600">Due Today</Badge>}
            {sessionStatus.status === 'in-progress' && <Badge className="bg-blue-600">In Progress</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={sessionStatus.color.includes('text-') ? '' : 'text-slate-700'}>
            {sessionStatus.text}
          </p>
        </CardContent>
      </Card>

      {/* Weekly Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-slate-500">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Timer className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProgress.totalHours}h</div>
            <p className="text-xs text-slate-500">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested Time</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{weeklyProgress.investedHours}h</div>
            <p className="text-xs text-slate-500">{weeklyProgress.investedPercentage}% of total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent Time</CardTitle>
            <Timer className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{weeklyProgress.spentHours}h</div>
            <p className="text-xs text-slate-500">{weeklyProgress.spentPercentage}% of total time</p>
          </CardContent>
        </Card>
      </div>

      {/* Beautiful Active Projects Display */}
      {activeProjects.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FolderOpen className="h-5 w-5" />
              Active Projects ({activeProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 leading-tight">
                          {project.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-700 border-blue-200">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Progress</span>
                          <span className="text-lg font-bold text-slate-800">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-3 bg-slate-100" />
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Time invested</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{project.hours}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reading This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readingItems.length > 0 ? (
                <>
                  <div className="text-lg font-semibold">{readingItems.length} items in progress</div>
                  <div className="text-sm text-slate-500">
                    {readingItems.filter(item => item.type === 'book').length} books, {' '}
                    {readingItems.filter(item => item.type === 'article').length} articles, {' '}
                    {readingItems.filter(item => item.type === 'podcast').length} podcasts
                  </div>
                </>
              ) : (
                <div className="text-lg font-semibold text-slate-500">No reading items yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Leisure Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leisureActivities.length > 0 ? (
                <>
                  <div className="text-lg font-semibold">{leisureActivities.length} active activities</div>
                  <div className="text-sm text-slate-500">
                    {leisureActivities.reduce((sum, activity) => sum + activity.totalHours, 0).toFixed(1)} hours total
                  </div>
                </>
              ) : (
                <div className="text-lg font-semibold text-slate-500">No leisure activities yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 && readingItems.length === 0 && leisureActivities.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-2xl">👋 Welcome to SelfDev OS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-6 text-lg">
              Your space to think clearly, act deliberately, and grow on purpose.
            </p>
            <div className="space-y-4">
              <h3 className="text-blue-800 font-semibold text-lg">Let's get you started:</h3>
              
              <div className="space-y-4 text-blue-700">
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-800">1.</span>
                  <div>
                    <div className="font-semibold">Start with a Strategy Session</div>
                    <div className="text-sm">Define key dissatisfactions, turn them into projects, and set your direction.</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-800">2.</span>
                  <div>
                    <div className="font-semibold">Create Your Projects</div>
                    <div className="text-sm">Capture areas like work, health, learning, or creativity. Break them into tasks and set time goals.</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-800">3.</span>
                  <div>
                    <div className="font-semibold">Track Your Time</div>
                    <div className="text-sm">Use the Pomodoro timer to log time as Invested or Spent. See where your energy is going.</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-800">4.</span>
                  <div>
                    <div className="font-semibold">Plan and Reflect Weekly</div>
                    <div className="text-sm">Run a strategy session each week to review progress, refine projects, and plan your next steps.</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="font-semibold text-blue-800">5.</span>
                  <div>
                    <div className="font-semibold">Log What You're Learning and Enjoying</div>
                    <div className="text-sm">Add books, podcasts, or blogs to your reading list. Track leisure activities that recharge you.</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-8 border-t border-slate-200">
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Reset all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your:
                  <br />• Projects and tasks
                  <br />• Time tracking logs
                  <br />• Notes and reading list
                  <br />• Strategy session data
                  <br />• Weekly planning data
                  <br />• Leisure activities
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData} className="bg-red-600 hover:bg-red-700">
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
