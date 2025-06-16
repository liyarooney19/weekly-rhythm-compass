import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Timer, Target, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  lifeArea: string;
  tasks: Task[];
  investedHours?: number;
  spentHours?: number;
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
  project: string;
  task?: string;
  duration: number;
  type: 'invested' | 'spent';
  timestamp: string;
  projectId?: number;
  taskId?: number;
}

export const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [timeType, setTimeType] = useState<'invested' | 'spent'>('invested');
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentLogs, setRecentLogs] = useState<TimeLog[]>([]);
  const { toast } = useToast();

  console.log('TimeTracker render - selectedProject:', selectedProject, 'projects length:', projects.length);

  // Load projects and check for current timer task
  useEffect(() => {
    console.log('Loading projects and recent logs...');
    loadProjects();
    loadRecentLogs();
    
    // Check if there's a current timer task from projects view
    const currentTask = localStorage.getItem('currentTimerTask');
    if (currentTask) {
      try {
        const taskData = JSON.parse(currentTask);
        console.log('Found current timer task:', taskData);
        setSelectedProject(taskData.projectId.toString());
        setSelectedTask(taskData.taskId.toString());
        localStorage.removeItem('currentTimerTask'); // Clear after setting
        
        toast({
          title: "Timer Set",
          description: `Ready to track time for "${taskData.taskName}"`
        });
      } catch (error) {
        console.error('Error loading current task:', error);
      }
    }
  }, []);

  const loadProjects = () => {
    console.log('loadProjects called');
    const savedStrategy = localStorage.getItem('strategySession');
    const savedProjects = localStorage.getItem('projects');
    let allProjects: Project[] = [];
    
    // Load from saved projects first (these have tasks)
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        allProjects = [...projects];
        console.log('Loaded saved projects:', projects);
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }

    // Load from strategy session (these typically don't have tasks yet)
    if (savedStrategy) {
      try {
        const data = JSON.parse(savedStrategy);
        if (data.projects) {
          const existingNames = new Set(allProjects.map(p => p.name.toLowerCase().trim()));
          const strategyProjects = data.projects
            .filter((p: any) => p.name && p.name.trim() !== '')
            .filter((p: any) => !existingNames.has(p.name.toLowerCase().trim()))
            .map((p: any, index: number) => ({
              id: Date.now() + index,
              name: p.name,
              lifeArea: p.lifeArea || 'Personal Growth',
              tasks: [],
              investedHours: 0,
              spentHours: 0
            }));
          allProjects = [...allProjects, ...strategyProjects];
          console.log('Added strategy projects:', strategyProjects);
        }
      } catch (error) {
        console.error('Error loading strategy projects:', error);
      }
    }

    console.log('Final projects array:', allProjects);
    setProjects(allProjects);
  };

  const loadRecentLogs = () => {
    const savedLogs = localStorage.getItem('timeLogs');
    if (savedLogs) {
      try {
        const logs = JSON.parse(savedLogs);
        const today = new Date().toDateString();
        const todayLogs = logs.filter((log: TimeLog) => {
          const logDate = new Date(log.timestamp).toDateString();
          return logDate === today;
        });
        setRecentLogs(todayLogs.slice(-10)); // Show last 10 logs
      } catch (error) {
        console.error('Error loading time logs:', error);
      }
    }
  };

  const saveTimeLog = (duration: number) => {
    const project = projects.find(p => p.id.toString() === selectedProject);
    const task = project?.tasks.find(t => t.id.toString() === selectedTask);
    
    if (!project) return;

    const timeLog: TimeLog = {
      project: project.name,
      task: task?.name || 'General project work',
      duration: Math.round(duration / 60), // Convert seconds to minutes
      type: timeType,
      timestamp: new Date().toISOString(),
      projectId: project.id,
      taskId: task?.id
    };

    // Save to logs
    const savedLogs = localStorage.getItem('timeLogs');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    logs.push(timeLog);
    localStorage.setItem('timeLogs', JSON.stringify(logs));

    // Update project/task hours
    if (task && project) {
      updateTaskHours(project.id, task.id, timeLog.duration, timeType);
    } else {
      // Handle general project work
      updateProjectHours(project.id, timeLog.duration, timeType);
    }

    setRecentLogs(prev => [...prev, timeLog].slice(-10));
    
    toast({
      title: "Time Logged",
      description: `${timeLog.duration} minutes ${timeType} time logged for ${project.name}${task ? ` - ${task.name}` : ''}`
    });
  };

  const updateTaskHours = (projectId: number, taskId: number, minutes: number, type: 'invested' | 'spent') => {
    const savedProjects = localStorage.getItem('projects');
    if (!savedProjects) return;

    try {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map((project: any) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task: any) => {
            if (task.id === taskId) {
              const hours = minutes / 60;
              return {
                ...task,
                [type === 'invested' ? 'investedHours' : 'spentHours']: 
                  (task[type === 'invested' ? 'investedHours' : 'spentHours'] || 0) + hours
              };
            }
            return task;
          });
          return { ...project, tasks: updatedTasks };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      loadProjects(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating task hours:', error);
    }
  };

  const updateProjectHours = (projectId: number, minutes: number, type: 'invested' | 'spent') => {
    const savedProjects = localStorage.getItem('projects');
    if (!savedProjects) return;

    try {
      const projects = JSON.parse(savedProjects);
      const updatedProjects = projects.map((project: any) => {
        if (project.id === projectId) {
          const hours = minutes / 60;
          return {
            ...project,
            [type === 'invested' ? 'investedHours' : 'spentHours']: 
              (project[type === 'invested' ? 'investedHours' : 'spentHours'] || 0) + hours
          };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      loadProjects();
    } catch (error) {
      console.error('Error updating project hours:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
      const sessionLength = 25 * 60;
      saveTimeLog(sessionLength);
      
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LvwGwyBz2Y3PLEfzMELYPL8dySQAkTYrfr5Z5PFAg+ltryy38yBC+Cy/HdjkMJEnTHmdhwOH');
      audio.play().catch(() => console.log('Audio notification failed'));
      
      toast({
        title: "Time's Up!",
        description: "Your Pomodoro session has ended",
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (selectedProject) {
      setIsRunning(true);
    } else {
      toast({
        title: "Select Project",
        description: "Please select a project before starting the timer",
        variant: "destructive"
      });
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (isRunning || seconds < 25 * 60) {
      const elapsed = (25 * 60) - seconds;
      if (elapsed > 60) { // Only log if more than 1 minute
        saveTimeLog(elapsed);
      }
    }
    setIsRunning(false);
    setSeconds(25 * 60);
  };

  const resetTimer = (minutes: number) => {
    setIsRunning(false);
    setSeconds(minutes * 60);
  };

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);
  const availableTasks = selectedProjectData?.tasks || [];

  // Handle project change - clear task when project changes
  const handleProjectChange = (projectId: string) => {
    console.log('handleProjectChange called with:', projectId);
    setSelectedProject(projectId);
    setSelectedTask(''); // Clear task when project changes
  };

  const handleTaskChange = (taskId: string) => {
    console.log('handleTaskChange called with:', taskId);
    setSelectedTask(taskId);
  };

  console.log('About to render, selectedProjectData:', selectedProjectData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Time Tracker</h1>
        <p className="text-slate-600">Pomodoro timer with invested/spent tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Pomodoro Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-slate-800 mb-4">
                {formatTime(seconds)}
              </div>
              <div className="flex justify-center gap-2 mb-4">
                <Button size="sm" variant="outline" onClick={() => resetTimer(25)}>
                  25min
                </Button>
                <Button size="sm" variant="outline" onClick={() => resetTimer(15)}>
                  15min
                </Button>
                <Button size="sm" variant="outline" onClick={() => resetTimer(5)}>
                  5min
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project</label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} ({project.lifeArea})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectData && (
                <div>
                  <label className="block text-sm font-medium mb-2">Task</label>
                  <Select value={selectedTask} onValueChange={handleTaskChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General project work</SelectItem>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Time Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={timeType === 'invested' ? 'default' : 'outline'}
                    onClick={() => setTimeType('invested')}
                    className="flex-1"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Invested
                  </Button>
                  <Button
                    variant={timeType === 'spent' ? 'default' : 'outline'}
                    onClick={() => setTimeType('spent')}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Spent
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <Button onClick={startTimer} disabled={!selectedProject} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} variant="secondary" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={stopTimer} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No sessions logged today</p>
              ) : (
                recentLogs.map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">{log.project}</div>
                      {log.task && <div className="text-sm text-slate-600">{log.task}</div>}
                      <div className="text-sm text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{log.duration}min</span>
                      <Badge variant={log.type === 'invested' ? 'default' : 'secondary'}>
                        {log.type}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Time Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => {
              // Calculate totals from both tasks and direct project time
              const taskInvested = project.tasks?.reduce((sum, task) => sum + (task.investedHours || 0), 0) || 0;
              const taskSpent = project.tasks?.reduce((sum, task) => sum + (task.spentHours || 0), 0) || 0;
              const projectInvested = project.investedHours || 0;
              const projectSpent = project.spentHours || 0;
              const totalInvested = taskInvested + projectInvested;
              const totalSpent = taskSpent + projectSpent;
              
              return (
                <div key={project.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="font-medium mb-2">{project.name}</div>
                  <div className="text-sm text-slate-500 mb-3">{project.lifeArea}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Invested:</span>
                      <span className="font-mono text-green-600">{totalInvested.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Spent:</span>
                      <span className="font-mono text-amber-600">{totalSpent.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
