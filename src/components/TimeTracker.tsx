import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Square, Clock, Target, Timer, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimeTrackerSession } from './TimeTrackerSession';

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

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentTask: string;
  selectedProject: string;
  selectedTaskId: string;
  timeType: 'invested' | 'spent';
  customDuration: number;
  startTime: number;
}

export const TimeTracker = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [timeType, setTimeType] = useState<'invested' | 'spent'>('invested');
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [customDuration, setCustomDuration] = useState(25);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    loadData();
    restoreTimerState();
  }, []);

  useEffect(() => {
    saveTimerState();
  }, [isRunning, isPaused, timeLeft, currentTask, selectedProject, selectedTaskId, timeType, customDuration, startTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }
    
    if (timeLeft === 0 && isRunning) {
      completeSession();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  const saveTimerState = () => {
    const timerState: TimerState = {
      isRunning,
      isPaused,
      timeLeft,
      currentTask,
      selectedProject,
      selectedTaskId,
      timeType,
      customDuration,
      startTime
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  };

  const restoreTimerState = () => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const timerState: TimerState = JSON.parse(savedState);
        
        // If timer was running, calculate elapsed time and adjust timeLeft
        if (timerState.isRunning && !timerState.isPaused && timerState.startTime) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);
          const adjustedTimeLeft = Math.max(0, timerState.timeLeft - elapsedSeconds);
          
          setTimeLeft(adjustedTimeLeft);
          
          // If time ran out while away, complete the session
          if (adjustedTimeLeft === 0) {
            setIsRunning(false);
            setIsPaused(false);
            // Don't auto-complete here, just reset
          } else {
            setIsRunning(timerState.isRunning);
            setIsPaused(timerState.isPaused);
          }
        } else {
          setIsRunning(timerState.isRunning);
          setIsPaused(timerState.isPaused);
          setTimeLeft(timerState.timeLeft);
        }
        
        setCurrentTask(timerState.currentTask);
        setSelectedProject(timerState.selectedProject);
        setSelectedTaskId(timerState.selectedTaskId);
        setTimeType(timerState.timeType);
        setCustomDuration(timerState.customDuration);
        setStartTime(timerState.startTime);
      } catch (error) {
        console.error('Error restoring timer state:', error);
      }
    }
  };

  const loadData = () => {
    // Load projects with tasks
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects.filter((p: Project) => p.status === 'active' || !p.status));
    }

    // Load time logs
    const savedTimeLogs = localStorage.getItem('timeLogs');
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === selectedProject);
  };

  const getAvailableTasks = () => {
    const project = getSelectedProject();
    return project?.tasks || [];
  };

  const getSelectedTask = () => {
    const tasks = getAvailableTasks();
    return tasks.find(t => t.id.toString() === selectedTaskId);
  };

  const startTimer = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project before starting the timer",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTaskId) {
      toast({
        title: "Error",
        description: "Please select a task before starting the timer",
        variant: "destructive"
      });
      return;
    }

    const selectedTask = getSelectedTask();
    if (selectedTask) {
      setCurrentTask(selectedTask.name);
    }

    setIsRunning(true);
    setIsPaused(false);
    setStartTime(Date.now());
    toast({
      title: "Timer Started",
      description: `Working on: ${selectedTask?.name}`
    });
  };

  const pauseTimer = () => {
    setIsPaused(true);
    toast({
      title: "Timer Paused",
      description: "Timer has been paused"
    });
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setStartTime(Date.now() - ((customDuration * 60 - timeLeft) * 1000)); // Adjust start time
    toast({
      title: "Timer Resumed",
      description: "Timer has been resumed"
    });
  };

  const stopTimer = () => {
    if (isRunning && timeLeft < customDuration * 60) {
      completeSession();
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setStartTime(0);
    // Clear timer state from localStorage
    localStorage.removeItem('timerState');
    toast({
      title: "Timer Reset",
      description: "Timer has been reset"
    });
  };

  const completeSession = () => {
    const duration = customDuration * 60 - timeLeft;
    const durationInMinutes = Math.round(duration / 60);
    
    if (durationInMinutes < 1) {
      resetTimer();
      return;
    }

    const selectedTask = getSelectedTask();
    const selectedProjectData = getSelectedProject();

    const newLog: TimeLog = {
      id: Date.now().toString(),
      task: selectedTask?.name || currentTask,
      duration: durationInMinutes,
      type: timeType,
      timestamp: new Date().toISOString(),
      project: selectedProjectData?.name || undefined,
      taskId: selectedTaskId || undefined
    };

    const updatedLogs = [...timeLogs, newLog];
    setTimeLogs(updatedLogs);
    localStorage.setItem('timeLogs', JSON.stringify(updatedLogs));

    // Update task and project hours
    if (selectedProject && selectedTaskId) {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          const updatedTasks = project.tasks.map(task => {
            if (task.id.toString() === selectedTaskId) {
              return {
                ...task,
                [timeType === 'invested' ? 'investedHours' : 'spentHours']: 
                  (task[timeType === 'invested' ? 'investedHours' : 'spentHours'] || 0) + (durationInMinutes / 60)
              };
            }
            return task;
          });

          return {
            ...project,
            tasks: updatedTasks,
            [timeType === 'invested' ? 'investedHours' : 'spentHours']: 
              (project[timeType === 'invested' ? 'investedHours' : 'spentHours'] || 0) + (durationInMinutes / 60)
          };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects.filter(p => p.status === 'active' || !p.status));
    }

    toast({
      title: "Session Completed!",
      description: `Logged ${durationInMinutes} minutes of ${timeType} time for: ${selectedTask?.name || currentTask}`
    });

    // Reset for next session
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setCurrentTask('');
    setSelectedProject('');
    setSelectedTaskId('');
    setStartTime(0);
    // Clear timer state from localStorage
    localStorage.removeItem('timerState');
  };

  const setCustomTime = (minutes: number) => {
    if (!isRunning) {
      setCustomDuration(minutes);
      setTimeLeft(minutes * 60);
    }
  };

  const getProgressPercentage = () => {
    return ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100;
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedTaskId('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Pomodoro Timer</h1>
        <p className="text-slate-600">Track your time with focused work sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-slate-800 mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Time Presets */}
            {!isRunning && (
              <div className="flex gap-2 justify-center">
                <Button 
                  variant={customDuration === 15 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCustomTime(15)}
                >
                  15m
                </Button>
                <Button 
                  variant={customDuration === 25 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCustomTime(25)}
                >
                  25m
                </Button>
                <Button 
                  variant={customDuration === 45 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCustomTime(45)}
                >
                  45m
                </Button>
                <Button 
                  variant={customDuration === 60 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCustomTime(60)}
                >
                  60m
                </Button>
              </div>
            )}

            {/* Project and Task Selection */}
            <div className="space-y-4">
              <Select value={selectedProject} onValueChange={handleProjectChange} disabled={isRunning}>
                <SelectTrigger className={!selectedProject && !isRunning ? "border-red-300 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select project (required)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.lifeArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning || !selectedProject}>
                <SelectTrigger className={!selectedTaskId && !isRunning ? "border-red-300 focus:border-red-500" : ""}>
                  <SelectValue placeholder={selectedProject ? "Select task (required)" : "Select project first"} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTasks().map(task => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{task.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          {task.investedHours.toFixed(1)}h / {task.estimatedHours}h
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeType} onValueChange={(value: 'invested' | 'spent') => setTimeType(value)} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invested">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Invested Time
                    </div>
                  </SelectItem>
                  <SelectItem value="spent">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-amber-500" />
                      Spent Time
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2 justify-center">
              {!isRunning ? (
                <Button onClick={startTimer} className="flex items-center gap-2" disabled={!selectedProject || !selectedTaskId}>
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <>
                  {!isPaused ? (
                    <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeTimer} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={stopTimer} variant="outline" className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            {/* Current Session Info */}
            {isRunning && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Current Session</div>
                <div className="font-medium text-blue-800">{getSelectedTask()?.name}</div>
                {selectedProject && (
                  <div className="text-sm text-blue-600">
                    Project: {getSelectedProject()?.name}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={timeType === 'invested' ? 'default' : 'secondary'} 
                         className={timeType === 'invested' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {timeType === 'invested' ? 'Invested' : 'Spent'} Time
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <div className="lg:col-span-1">
          <TimeTrackerSession timeLogs={timeLogs} />
        </div>
      </div>
    </div>
  );
};
