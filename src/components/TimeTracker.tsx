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
  actualStartTime: number;
  currentProjectName: string; // Add this to store the project name
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
  const [actualStartTime, setActualStartTime] = useState(0);
  const [currentProjectName, setCurrentProjectName] = useState(''); // Add this state

  useEffect(() => {
    console.log('TimeTracker - Initial load');
    loadData();
    restoreTimerState();
  }, []);

  useEffect(() => {
    saveTimerState();
  }, [isRunning, isPaused, timeLeft, currentTask, selectedProject, selectedTaskId, timeType, customDuration, startTime, actualStartTime, currentProjectName]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          if (newTime <= 0) {
            console.log('TimeTracker - Timer reached zero, completing session');
            completeSession();
            return 0;
          }
          return newTime;
        });
      }, 1000);
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
      startTime,
      actualStartTime,
      currentProjectName
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  };

  const restoreTimerState = () => {
    const savedState = localStorage.getItem('timerState');
    console.log('TimeTracker - Restoring timer state:', savedState);
    if (savedState) {
      try {
        const timerState: TimerState = JSON.parse(savedState);
        
        // If timer was running, calculate elapsed time and adjust timeLeft
        if (timerState.isRunning && !timerState.isPaused && timerState.actualStartTime) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - timerState.actualStartTime) / 1000);
          const adjustedTimeLeft = Math.max(0, (timerState.timeLeft || 0) - elapsedSeconds);
          
          console.log('TimeTracker - Timer was running, adjusting time:', { elapsedSeconds, adjustedTimeLeft });
          
          setTimeLeft(adjustedTimeLeft);
          setActualStartTime(timerState.actualStartTime);
          
          // If time ran out while away, complete the session
          if (adjustedTimeLeft === 0) {
            console.log('TimeTracker - Time ran out while away, completing session');
            setIsRunning(false);
            setIsPaused(false);
            completeSessionWithState(timerState);
          } else {
            setIsRunning(true);
            setIsPaused(false);
          }
        } else {
          setIsRunning(timerState.isRunning || false);
          setIsPaused(timerState.isPaused || false);
          setTimeLeft(timerState.timeLeft || 25 * 60);
          setActualStartTime(timerState.actualStartTime || 0);
        }
        
        setCurrentTask(timerState.currentTask || '');
        setSelectedProject(timerState.selectedProject || '');
        setSelectedTaskId(timerState.selectedTaskId || '');
        setTimeType(timerState.timeType || 'invested');
        setCustomDuration(timerState.customDuration || 25);
        setStartTime(timerState.startTime || 0);
        setCurrentProjectName(timerState.currentProjectName || '');
      } catch (error) {
        console.error('TimeTracker - Error restoring timer state:', error);
      }
    }
  };

  const loadData = () => {
    console.log('TimeTracker - Loading data...');
    
    // Load projects with tasks
    const savedProjects = localStorage.getItem('projects');
    console.log('TimeTracker - Raw saved projects:', savedProjects);
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        console.log('TimeTracker - Parsed projects:', parsedProjects);
        
        // Ensure we filter active projects and convert IDs to strings
        const activeProjects = parsedProjects
          .filter((p: Project) => p.status === 'active' || !p.status)
          .map((p: Project) => ({
            ...p,
            id: p.id.toString(), // Ensure ID is string
            tasks: (p.tasks || []).map((t: Task) => ({
              ...t,
              estimatedHours: t.estimatedHours || 0,
              investedHours: t.investedHours || 0,
              spentHours: t.spentHours || 0
            }))
          }));
        console.log('TimeTracker - Active projects after filtering:', activeProjects);
        setProjects(activeProjects);
      } catch (error) {
        console.error('TimeTracker - Error parsing projects:', error);
        setProjects([]);
      }
    } else {
      console.log('TimeTracker - No saved projects found');
      setProjects([]);
    }

    // Load time logs
    const savedTimeLogs = localStorage.getItem('timeLogs');
    console.log('TimeTracker - Raw saved time logs:', savedTimeLogs);
    
    if (savedTimeLogs) {
      try {
        const parsedTimeLogs = JSON.parse(savedTimeLogs);
        console.log('TimeTracker - Parsed time logs:', parsedTimeLogs);
        setTimeLogs(parsedTimeLogs);
      } catch (error) {
        console.error('TimeTracker - Error parsing time logs:', error);
        setTimeLogs([]);
      }
    } else {
      console.log('TimeTracker - No saved time logs found');
      setTimeLogs([]);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSelectedProject = () => {
    const project = projects.find(p => p.id === selectedProject);
    console.log('TimeTracker - getSelectedProject:', selectedProject, 'found:', project);
    return project;
  };

  const getAvailableTasks = () => {
    const project = getSelectedProject();
    const tasks = project?.tasks || [];
    console.log('TimeTracker - getAvailableTasks for project:', selectedProject, 'tasks:', tasks);
    return tasks;
  };

  const getSelectedTask = () => {
    const tasks = getAvailableTasks();
    const task = tasks.find(t => t.id.toString() === selectedTaskId);
    console.log('TimeTracker - getSelectedTask:', selectedTaskId, 'found:', task);
    return task;
  };

  const startTimer = () => {
    console.log('TimeTracker - startTimer called with state:', { 
      selectedProject, 
      selectedTaskId, 
      projectsAvailable: projects.length,
      selectedProjectObject: getSelectedProject(),
      selectedTaskObject: getSelectedTask()
    });
    
    if (!selectedProject) {
      console.log('TimeTracker - No project selected');
      toast({
        title: "Error",
        description: "Please select a project before starting the timer",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTaskId) {
      console.log('TimeTracker - No task selected');
      toast({
        title: "Error",
        description: "Please select a task before starting the timer",
        variant: "destructive"
      });
      return;
    }

    const selectedTask = getSelectedTask();
    const selectedProjectData = getSelectedProject();
    
    if (selectedTask && selectedProjectData) {
      setCurrentTask(selectedTask.name);
      setCurrentProjectName(selectedProjectData.name); // Store the project name
      console.log('TimeTracker - Set current task to:', selectedTask.name);
      console.log('TimeTracker - Set current project name to:', selectedProjectData.name);
    } else {
      console.log('TimeTracker - Could not find selected task or project!');
    }

    const now = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(now);
    setActualStartTime(now);
    
    console.log('TimeTracker - Timer started at:', new Date(now).toISOString());
    
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
    const now = Date.now();
    const elapsedBeforePause = customDuration * 60 - timeLeft;
    setActualStartTime(now - (elapsedBeforePause * 1000));
    setIsPaused(false);
    
    toast({
      title: "Timer Resumed",
      description: "Timer has been resumed"
    });
  };

  const stopTimer = () => {
    console.log('TimeTracker - stopTimer called, timer state:', { isRunning, timeLeft, customDuration });
    if (isRunning && timeLeft < customDuration * 60) {
      completeSession();
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    console.log('TimeTracker - resetTimer called');
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setStartTime(0);
    setActualStartTime(0);
    setCurrentProjectName(''); // Reset project name
    localStorage.removeItem('timerState');
    
    toast({
      title: "Timer Reset",
      description: "Timer has been reset"
    });
  };

  const completeSessionWithState = (timerState: TimerState) => {
    console.log('TimeTracker - completeSessionWithState called with:', timerState);
    
    const duration = timerState.customDuration * 60 - timerState.timeLeft;
    const durationInMinutes = Math.round(duration / 60);
    
    console.log('TimeTracker - Session duration calculated:', { duration, durationInMinutes });
    
    if (durationInMinutes < 1) {
      console.log('TimeTracker - Duration less than 1 minute, resetting timer');
      resetTimer();
      return;
    }

    // Use the stored project name from timer state
    const projectName = timerState.currentProjectName;
    
    const newLog: TimeLog = {
      id: Date.now().toString(),
      task: timerState.currentTask,
      duration: durationInMinutes,
      type: timerState.timeType,
      timestamp: new Date().toISOString(),
      project: projectName, // Use the stored project name
      taskId: timerState.selectedTaskId || undefined
    };

    console.log('TimeTracker - Creating new log entry:', newLog);

    const savedTimeLogs = localStorage.getItem('timeLogs');
    const currentLogs = savedTimeLogs ? JSON.parse(savedTimeLogs) : [];
    const updatedLogs = [...currentLogs, newLog];
    
    console.log('TimeTracker - Saving updated logs:', updatedLogs);
    localStorage.setItem('timeLogs', JSON.stringify(updatedLogs));

    updateProjectHours(timerState.selectedProject, timerState.selectedTaskId, durationInMinutes, timerState.timeType);
    resetTimer();
  };

  const completeSession = () => {
    console.log('TimeTracker - completeSession called');
    
    const duration = customDuration * 60 - timeLeft;
    const durationInMinutes = Math.round(duration / 60);
    
    console.log('TimeTracker - Session duration calculated:', { duration, durationInMinutes });
    
    if (durationInMinutes < 1) {
      console.log('TimeTracker - Duration less than 1 minute, resetting timer');
      resetTimer();
      return;
    }

    const selectedTask = getSelectedTask();

    console.log('TimeTracker - Selected data for completion:', { selectedTask, currentProjectName });

    const newLog: TimeLog = {
      id: Date.now().toString(),
      task: selectedTask?.name || currentTask,
      duration: durationInMinutes,
      type: timeType,
      timestamp: new Date().toISOString(),
      project: currentProjectName, // Use the stored project name instead of looking it up
      taskId: selectedTaskId || undefined
    };

    console.log('TimeTracker - Creating new log entry:', newLog);

    const updatedLogs = [...timeLogs, newLog];
    setTimeLogs(updatedLogs);
    
    console.log('TimeTracker - Saving updated logs to localStorage:', updatedLogs);
    localStorage.setItem('timeLogs', JSON.stringify(updatedLogs));

    updateProjectHours(selectedProject, selectedTaskId, durationInMinutes, timeType);

    toast({
      title: "Session Completed!",
      description: `Logged ${durationInMinutes} minutes of ${timeType} time for: ${selectedTask?.name || currentTask}`
    });

    resetTimer();
  };

  const updateProjectHours = (projectId: string, taskId: string, minutes: number, type: 'invested' | 'spent') => {
    console.log('TimeTracker - updateProjectHours called:', { projectId, taskId, minutes, type });
    
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const allProjects = JSON.parse(savedProjects);
      console.log('TimeTracker - All projects before update:', allProjects);
      
      const updatedProjects = allProjects.map((project: Project) => {
        if (project.id.toString() === projectId) {
          console.log('TimeTracker - Updating project:', project.name);
          
          const updatedTasks = (project.tasks || []).map((task: Task) => {
            if (task.id.toString() === taskId) {
              console.log('TimeTracker - Updating task:', task.name, 'adding', minutes/60, 'hours of', type);
              return {
                ...task,
                [type === 'invested' ? 'investedHours' : 'spentHours']: 
                  ((task[type === 'invested' ? 'investedHours' : 'spentHours'] as number) || 0) + (minutes / 60)
              };
            }
            return {
              ...task,
              estimatedHours: task.estimatedHours || 0,
              investedHours: task.investedHours || 0,
              spentHours: task.spentHours || 0
            };
          });

          return {
            ...project,
            tasks: updatedTasks,
            [type === 'invested' ? 'investedHours' : 'spentHours']: 
              ((project[type === 'invested' ? 'investedHours' : 'spentHours'] as number) || 0) + (minutes / 60)
          };
        }
        return project;
      });
      
      console.log('TimeTracker - Updated projects:', updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      // Reload data to update the projects state
      loadData();
    }
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
    console.log('TimeTracker - handleProjectChange:', projectId);
    setSelectedProject(projectId);
    setSelectedTaskId('');
  };

  console.log('TimeTracker - Current render state:', { 
    selectedProject, 
    selectedTaskId, 
    projectsCount: projects.length,
    projects: projects.map(p => ({ id: p.id, name: p.name, tasksCount: p.tasks.length })),
    timeLogsCount: timeLogs.length,
    currentProjectName
  });

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
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Task</label>
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
                            {((task.investedHours || 0)).toFixed(1)}h / {(task.estimatedHours || 0)}h
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time Type</label>
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
                {currentProjectName && (
                  <div className="text-sm text-blue-600">
                    Project: {currentProjectName}
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
