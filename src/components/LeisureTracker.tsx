import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gamepad2, Plus, Calendar, Target, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  duration: number; // in minutes
  notes?: string;
}

export const LeisureTracker = () => {
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [newActivity, setNewActivity] = useState({
    name: '',
    frequency: 'weekly',
    intention: '',
    category: 'exercise'
  });
  const [sessionDialog, setSessionDialog] = useState<{open: boolean, activityId: number | null}>({
    open: false,
    activityId: null
  });
  const [sessionData, setSessionData] = useState({
    duration: '',
    notes: ''
  });
  const { toast } = useToast();

  const categories = ['exercise', 'creative', 'social', 'outdoor', 'intellectual', 'relaxation'];
  const frequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const savedActivities = localStorage.getItem('leisureActivities');
    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch (error) {
        console.error('Error loading leisure activities:', error);
        setActivities([]);
      }
    } else {
      // Check if this is the first time loading (no data exists)
      // Only show default items if there's no indication of a reset
      const hasBeenReset = localStorage.getItem('strategySession') === null && 
                          localStorage.getItem('projects') === null;
      
      if (!hasBeenReset) {
        // First time user - show default activities
        initializeDefaultActivities();
      } else {
        // Data has been reset - start with empty list
        setActivities([]);
      }
    }
  };

  const initializeDefaultActivities = () => {
    const defaultActivities: LeisureActivity[] = [
      {
        id: 1,
        name: 'Swimming',
        category: 'exercise',
        frequency: 'weekly',
        intention: 'Improve cardiovascular health and reduce stress',
        targetSessions: 2,
        completedSessions: 1,
        lastSession: '2 days ago',
        totalHours: 4.5,
        sessions: []
      },
      {
        id: 2,
        name: 'Golf',
        category: 'outdoor',
        frequency: 'bi-weekly',
        intention: 'Social connection and mental relaxation',
        targetSessions: 1,
        completedSessions: 1,
        lastSession: '1 week ago',
        totalHours: 8.0,
        sessions: []
      },
      {
        id: 3,
        name: 'Reading Fiction',
        category: 'intellectual',
        frequency: 'daily',
        intention: 'Escape and mental stimulation',
        targetSessions: 7,
        completedSessions: 5,
        lastSession: 'Yesterday',
        totalHours: 6.2,
        sessions: []
      },
      {
        id: 4,
        name: 'Cooking',
        category: 'creative',
        frequency: 'weekly',
        intention: 'Creative expression and mindful practice',
        targetSessions: 3,
        completedSessions: 2,
        lastSession: '3 days ago',
        totalHours: 5.5,
        sessions: []
      },
    ];
    setActivities(defaultActivities);
    localStorage.setItem('leisureActivities', JSON.stringify(defaultActivities));
  };

  const saveActivities = (updatedActivities: LeisureActivity[]) => {
    setActivities(updatedActivities);
    localStorage.setItem('leisureActivities', JSON.stringify(updatedActivities));
  };

  const getTargetSessionsForFrequency = (frequency: string): number => {
    switch (frequency) {
      case 'daily': return 7;
      case 'weekly': return 2;
      case 'bi-weekly': return 1;
      case 'monthly': return 1;
      default: return 1;
    }
  };

  const addNewActivity = () => {
    if (!newActivity.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an activity name",
        variant: "destructive"
      });
      return;
    }

    const activity: LeisureActivity = {
      id: Date.now(),
      name: newActivity.name.trim(),
      category: newActivity.category,
      frequency: newActivity.frequency,
      intention: newActivity.intention.trim(),
      targetSessions: getTargetSessionsForFrequency(newActivity.frequency),
      completedSessions: 0,
      lastSession: 'Never',
      totalHours: 0,
      sessions: []
    };

    const updatedActivities = [...activities, activity];
    saveActivities(updatedActivities);

    // Also add to projects for time tracking integration
    addToProjects(activity);

    setNewActivity({
      name: '',
      frequency: 'weekly',
      intention: '',
      category: 'exercise'
    });

    toast({
      title: "Activity Added",
      description: `${activity.name} has been added to your leisure activities`
    });
  };

  const addToProjects = (activity: LeisureActivity) => {
    const savedProjects = localStorage.getItem('projects');
    let projects = savedProjects ? JSON.parse(savedProjects) : [];

    // Check if activity already exists as project
    const existingProject = projects.find((p: any) => 
      p.name.toLowerCase() === activity.name.toLowerCase() && p.lifeArea === 'Leisure/Hobby'
    );

    if (!existingProject) {
      const leisureProject = {
        id: Date.now() + Math.random(),
        name: activity.name,
        lifeArea: 'Leisure/Hobby',
        description: activity.intention,
        status: 'active',
        progress: 0,
        totalHours: 0,
        investedHours: 0,
        spentHours: 0,
        tasks: [{
          id: 1,
          name: `${activity.name} Session`,
          completed: false,
          estimatedHours: 1,
          investedHours: 0,
          spentHours: 0
        }]
      };
      projects.push(leisureProject);
      localStorage.setItem('projects', JSON.stringify(projects));
      console.log('Created leisure project:', leisureProject);
    }
  };

  const logSession = () => {
    if (!sessionData.duration || sessionDialog.activityId === null) {
      toast({
        title: "Error",
        description: "Please enter session duration",
        variant: "destructive"
      });
      return;
    }

    const duration = parseInt(sessionData.duration);
    if (isNaN(duration) || duration <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration in minutes",
        variant: "destructive"
      });
      return;
    }

    const session: ActivitySession = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: duration,
      notes: sessionData.notes.trim()
    };

    const updatedActivities = activities.map(activity => {
      if (activity.id === sessionDialog.activityId) {
        const updatedSessions = [...activity.sessions, session];
        const newTotalHours = activity.totalHours + (duration / 60);
        const newCompletedSessions = activity.completedSessions + 1;
        
        return {
          ...activity,
          sessions: updatedSessions,
          totalHours: newTotalHours,
          completedSessions: newCompletedSessions,
          lastSession: 'Today'
        };
      }
      return activity;
    });

    saveActivities(updatedActivities);

    // Log time to time tracker
    logTimeToTracker(sessionDialog.activityId, duration);

    setSessionDialog({open: false, activityId: null});
    setSessionData({duration: '', notes: ''});

    toast({
      title: "Session Logged",
      description: `${duration} minutes logged successfully`
    });
  };

  const logTimeToTracker = (activityId: number, duration: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const timeLog = {
      id: Date.now() + Math.random(),
      project: activity.name,
      task: `${activity.name} Session`,
      duration: duration,
      type: 'invested' as const,
      timestamp: new Date().toISOString()
    };

    const savedLogs = localStorage.getItem('timeLogs');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    logs.push(timeLog);
    localStorage.setItem('timeLogs', JSON.stringify(logs));
    console.log('Created timeLog entry:', timeLog);

    // Update the project hours in the projects list
    updateLeisureProjectHours(activity.name, duration);
  };

  const updateLeisureProjectHours = (activityName: string, durationMinutes: number) => {
    const savedProjects = localStorage.getItem('projects');
    if (!savedProjects) return;

    try {
      const projects = JSON.parse(savedProjects);
      const hours = durationMinutes / 60;
      
      const updatedProjects = projects.map((project: any) => {
        if (project.name.toLowerCase() === activityName.toLowerCase() && project.lifeArea === 'Leisure/Hobby') {
          return {
            ...project,
            investedHours: (project.investedHours || 0) + hours,
            totalHours: (project.totalHours || 0) + hours
          };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      console.log('Updated leisure project hours for:', activityName);
    } catch (error) {
      console.error('Error updating leisure project hours:', error);
    }
  };

  const openSessionDialog = (activityId: number) => {
    setSessionDialog({open: true, activityId});
    setSessionData({duration: '', notes: ''});
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      exercise: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
      outdoor: 'bg-emerald-100 text-emerald-800',
      intellectual: 'bg-orange-100 text-orange-800',
      relaxation: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getWeeklyTotal = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return activities.reduce((total, activity) => {
      const weeklyHours = activity.sessions
        .filter(session => new Date(session.date) >= oneWeekAgo)
        .reduce((sum, session) => sum + (session.duration / 60), 0);
      return total + weeklyHours;
    }, 0);
  };

  const getCurrentWeekProgress = () => {
    const totalCompleted = activities.reduce((sum, activity) => sum + activity.completedSessions, 0);
    const totalTarget = activities.reduce((sum, activity) => sum + activity.targetSessions, 0);
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
  };

  const deleteActivity = (id: number) => {
    const activityToDelete = activities.find(a => a.id === id);
    const updatedActivities = activities.filter(activity => activity.id !== id);
    saveActivities(updatedActivities);

    // Also remove from projects if it exists
    if (activityToDelete) {
      removeFromProjects(activityToDelete.name);
    }

    toast({
      title: "Activity Deleted",
      description: "Leisure activity has been removed"
    });
  };

  const removeFromProjects = (activityName: string) => {
    const savedProjects = localStorage.getItem('projects');
    if (!savedProjects) return;

    try {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.filter((project: any) => 
        !(project.name.toLowerCase() === activityName.toLowerCase() && project.lifeArea === 'Leisure/Hobby')
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Error removing leisure project:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Leisure Tracker</h1>
        <p className="text-slate-600">Track recurring activities with frequencies and intentions</p>
      </div>

      {/* Add New Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Leisure Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Activity name..."
              value={newActivity.name}
              onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
            />
            <select
              value={newActivity.category}
              onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={newActivity.frequency}
              onChange={(e) => setNewActivity({...newActivity, frequency: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {frequencies.map(frequency => (
                <option key={frequency} value={frequency}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </option>
              ))}
            </select>
            <Button onClick={addNewActivity} disabled={!newActivity.name.trim()}>
              Add Activity
            </Button>
          </div>
          <Textarea
            placeholder="What's your intention for this activity? (e.g., stress relief, social connection, skill building...)"
            value={newActivity.intention}
            onChange={(e) => setNewActivity({...newActivity, intention: e.target.value})}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No leisure activities yet</h3>
            <p className="text-slate-500 mb-4">Start tracking activities that bring you joy and fulfillment!</p>
            <p className="text-sm text-slate-400">Add your first activity above to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{activity.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getCategoryColor(activity.category)}>
                          {activity.category}
                        </Badge>
                        <Badge variant="outline">{activity.frequency}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-slate-500">
                        <div>{activity.totalHours.toFixed(1)}h total</div>
                        <div>{activity.lastSession}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-700 italic">"{activity.intention}"</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This period progress</span>
                      <span>{activity.completedSessions}/{activity.targetSessions} sessions</span>
                    </div>
                    <Progress 
                      value={(activity.completedSessions / activity.targetSessions) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => openSessionDialog(activity.id)}>
                      <Target className="h-4 w-4 mr-1" />
                      Log Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Week's Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 border border-slate-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
                  <div className="text-sm text-slate-600">Active Activities</div>
                </div>
                <div className="text-center p-4 border border-slate-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getWeeklyTotal().toFixed(1)}h</div>
                  <div className="text-sm text-slate-600">This Week</div>
                </div>
                <div className="text-center p-4 border border-slate-200 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{getCurrentWeekProgress()}%</div>
                  <div className="text-sm text-slate-600">Goals Met</div>
                </div>
                <div className="text-center p-4 border border-slate-200 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                  <div className="text-sm text-slate-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Session Logging Dialog */}
      <Dialog open={sessionDialog.open} onOpenChange={(open) => setSessionDialog({open, activityId: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="Enter duration in minutes..."
                value={sessionData.duration}
                onChange={(e) => setSessionData({...sessionData, duration: e.target.value})}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <Textarea
                placeholder="How did it go? Any observations..."
                value={sessionData.notes}
                onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={logSession} disabled={!sessionData.duration}>
                <Clock className="h-4 w-4 mr-2" />
                Log Session
              </Button>
              <Button variant="outline" onClick={() => setSessionDialog({open: false, activityId: null})}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
