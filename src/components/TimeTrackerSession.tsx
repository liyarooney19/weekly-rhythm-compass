
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Timer } from 'lucide-react';

interface TimeLog {
  id: string;
  task: string;
  duration: number;
  type: 'invested' | 'spent';
  timestamp: string;
  project?: string;
}

interface CombinedTask {
  task: string;
  totalDuration: number;
  type: 'invested' | 'spent';
  count: number;
  project?: string;
}

interface TimeTrackerSessionProps {
  timeLogs: TimeLog[];
}

export const TimeTrackerSession = ({ timeLogs }: TimeTrackerSessionProps) => {
  const getTodaysLogs = () => {
    const today = new Date().toDateString();
    return timeLogs.filter(log => new Date(log.timestamp).toDateString() === today);
  };

  const combineTasks = (logs: TimeLog[]): CombinedTask[] => {
    const taskMap = new Map<string, CombinedTask>();
    
    logs.forEach(log => {
      // Create a unique key based on task name and type (but not project to combine across projects)
      const key = `${log.task}-${log.type}`;
      
      if (taskMap.has(key)) {
        const existing = taskMap.get(key)!;
        existing.totalDuration += log.duration;
        existing.count += 1;
        // If projects differ, don't show a specific project
        if (existing.project !== log.project) {
          existing.project = undefined;
        }
      } else {
        taskMap.set(key, {
          task: log.task,
          totalDuration: log.duration,
          type: log.type,
          count: 1,
          project: log.project
        });
      }
    });
    
    return Array.from(taskMap.values()).sort((a, b) => b.totalDuration - a.totalDuration);
  };

  const todaysLogs = getTodaysLogs();
  const combinedTasks = combineTasks(todaysLogs);
  
  const todayStats = {
    totalMinutes: todaysLogs.reduce((sum, log) => sum + log.duration, 0),
    investedMinutes: todaysLogs.filter(log => log.type === 'invested').reduce((sum, log) => sum + log.duration, 0),
    spentMinutes: todaysLogs.filter(log => log.type === 'spent').reduce((sum, log) => sum + log.duration, 0)
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today's Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-700">{formatDuration(todayStats.totalMinutes)}</div>
            <div className="text-sm text-slate-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatDuration(todayStats.investedMinutes)}</div>
            <div className="text-sm text-slate-500">Invested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{formatDuration(todayStats.spentMinutes)}</div>
            <div className="text-sm text-slate-500">Spent</div>
          </div>
        </div>

        {/* Combined Tasks */}
        <div className="space-y-2">
          {combinedTasks.length > 0 ? (
            combinedTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 flex-1">
                  {task.type === 'invested' ? (
                    <Target className="h-4 w-4 text-green-500" />
                  ) : (
                    <Timer className="h-4 w-4 text-amber-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{task.task}</div>
                    {task.project && (
                      <div className="text-sm text-slate-500">{task.project}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.count > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {task.count}x
                    </Badge>
                  )}
                  <Badge variant={task.type === 'invested' ? 'default' : 'secondary'} className={task.type === 'invested' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {formatDuration(task.totalDuration)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No sessions logged today yet.</p>
              <p className="text-sm">Start a Pomodoro session to track your time!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
