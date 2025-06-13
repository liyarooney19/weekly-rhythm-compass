
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Timer, Target, Clock } from 'lucide-react';

export const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes default
  const [selectedProject, setSelectedProject] = useState('');
  const [timeType, setTimeType] = useState<'invested' | 'spent'>('invested');

  // Mock projects
  const projects = [
    { id: '1', name: 'Fitness App', lifeArea: 'startup' },
    { id: '2', name: 'Learn React', lifeArea: 'work' },
    { id: '3', name: 'Blog Writing', lifeArea: 'personal' },
  ];

  // Recent time logs (mock data)
  const recentLogs = [
    { project: 'Fitness App', duration: 25, type: 'invested', timestamp: '10:30 AM' },
    { project: 'Learn React', duration: 25, type: 'invested', timestamp: '9:00 AM' },
    { project: 'Social Media', duration: 15, type: 'spent', timestamp: '8:45 AM' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
      // Here you would typically log the completed session
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
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setSeconds(25 * 60);
    // Here you would log the session
  };

  const resetTimer = (minutes: number) => {
    setIsRunning(false);
    setSeconds(minutes * 60);
  };

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
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.lifeArea})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
              {recentLogs.map((log, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{log.project}</div>
                    <div className="text-sm text-slate-500">{log.timestamp}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{log.duration}min</span>
                    <Badge variant={log.type === 'invested' ? 'default' : 'secondary'}>
                      {log.type}
                    </Badge>
                  </div>
                </div>
              ))}
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
            {projects.map((project) => (
              <div key={project.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="font-medium mb-2">{project.name}</div>
                <div className="text-sm text-slate-500 mb-3">{project.lifeArea}</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Invested:</span>
                    <span className="font-mono text-green-600">8.5h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Spent:</span>
                    <span className="font-mono text-amber-600">1.2h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
