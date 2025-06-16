
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
}

interface TimeLog {
  id: string;
  task: string;
  duration: number;
  type: 'invested' | 'spent';
  timestamp: string;
  project?: string;
}

export const TimeTracker = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentTask, setCurrentTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [timeType, setTimeType] = useState<'invested' | 'spent'>('invested');
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [customDuration, setCustomDuration] = useState(25);

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = () => {
    // Load projects
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

  const startTimer = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name before starting the timer",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    toast({
      title: "Timer Started",
      description: `Working on: ${currentTask}`
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
    toast({
      title: "Timer Reset",
      description: "Timer has been reset"
    });
  };

  const completeSession = () => {
    const duration = customDuration * 60 - timeLeft; // Duration in seconds
    const durationInMinutes = Math.round(duration / 60);
    
    if (durationInMinutes < 1) {
      resetTimer();
      return;
    }

    const newLog: TimeLog = {
      id: Date.now().toString(),
      task: currentTask,
      duration: durationInMinutes,
      type: timeType,
      timestamp: new Date().toISOString(),
      project: selectedProject || undefined
    };

    const updatedLogs = [...timeLogs, newLog];
    setTimeLogs(updatedLogs);
    localStorage.setItem('timeLogs', JSON.stringify(updatedLogs));

    // Update project invested hours if applicable
    if (selectedProject && timeType === 'invested') {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          return {
            ...project,
            investedHours: (project.investedHours || 0) + (durationInMinutes / 60)
          };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects.filter(p => p.status === 'active' || !p.status));
    }

    toast({
      title: "Session Completed!",
      description: `Logged ${durationInMinutes} minutes of ${timeType} time for: ${currentTask}`
    });

    // Reset for next session
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setCurrentTask('');
    setSelectedProject('');
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

            {/* Task Input */}
            <div className="space-y-4">
              <Input
                placeholder="What are you working on?"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                disabled={isRunning}
              />

              <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.lifeArea}
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
                <Button onClick={startTimer} className="flex items-center gap-2">
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
                <div className="font-medium text-blue-800">{currentTask}</div>
                {selectedProject && (
                  <div className="text-sm text-blue-600">
                    Project: {projects.find(p => p.id === selectedProject)?.name}
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

