import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, Target, BookOpen, FileText, Gamepad2, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { toast } = useToast();

  const resetAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('strategySession');
    localStorage.removeItem('projects');
    localStorage.removeItem('timeLogs');
    localStorage.removeItem('weeklyTasks');
    localStorage.removeItem('leisureActivities');
    localStorage.removeItem('writingNotes');
    localStorage.removeItem('readingList');
    
    toast({
      title: "Success",
      description: "All data has been reset. You can now start fresh!"
    });
    
    // Reload the page to reflect changes
    window.location.reload();
  };

  // Mock data for demonstration
  const weeklyProgress = {
    totalHours: 28.5,
    investedHours: 22.3,
    spentHours: 6.2,
  };

  const projectSummary = [
    { name: 'Fitness App', hours: 8.5, category: 'Startup', progress: 65 },
    { name: 'Learn React', hours: 6.2, category: 'Work', progress: 40 },
    { name: 'Blog Writing', hours: 4.1, category: 'Personal', progress: 80 },
  ];

  const upcomingReminders = [
    { type: 'Strategy Session', due: 'Tomorrow', urgent: true },
    { type: 'Weekly Review', due: 'Sunday', urgent: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to your personal development operating system</p>
      </div>

      {/* Reset Data Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="h-5 w-5" />
            Reset All Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Clear all your data and start fresh. This will remove all projects, tasks, time logs, notes, and other data.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All Data
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
        </CardContent>
      </Card>

      {/* Weekly Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-xs text-slate-500">78% of total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent Time</CardTitle>
            <Timer className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{weeklyProgress.spentHours}h</div>
            <p className="text-xs text-slate-500">22% of total time</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectSummary.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.name}</span>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <span className="text-sm text-slate-500">{project.hours}h</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <div className="text-lg font-semibold">3 books in progress</div>
              <div className="text-sm text-slate-500">12 articles read</div>
              <div className="text-sm text-slate-500">5 hours of podcasts</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes & Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold">8 new notes</div>
              <div className="text-sm text-slate-500">3 voice memos</div>
              <div className="text-sm text-slate-500">2 ready for cleanup</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingReminders.map((reminder, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <div>
                  <span className="font-medium">{reminder.type}</span>
                  {reminder.urgent && <Badge className="ml-2" variant="destructive">Urgent</Badge>}
                </div>
                <span className="text-sm text-slate-500">{reminder.due}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
