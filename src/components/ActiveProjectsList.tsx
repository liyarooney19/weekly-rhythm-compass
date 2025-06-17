
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Timer } from 'lucide-react';

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

export const ActiveProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load projects
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const activeProjects = parsedProjects.filter((p: Project) => p.status === 'active' || !p.status);
      console.log('ActiveProjectsList - Active projects:', activeProjects.map(p => p.name));
      setProjects(activeProjects);
    }

    // Load time logs
    const savedTimeLogs = localStorage.getItem('timeLogs');
    if (savedTimeLogs) {
      const parsedTimeLogs = JSON.parse(savedTimeLogs);
      console.log('ActiveProjectsList - Unique project names in timeLogs:', [...new Set(parsedTimeLogs.map(log => log.project))]);
      console.log('ActiveProjectsList - All time logs:', parsedTimeLogs.map(log => ({ 
        project: log.project, 
        task: log.task, 
        timestamp: log.timestamp,
        projectLength: log.project ? log.project.length : 0,
        projectBytes: log.project && typeof log.project === 'string' ? Array.from(log.project).map(c => c.charCodeAt(0)) : []
      })));
      setTimeLogs(parsedTimeLogs);
    }
  };

  const getThisWeekHours = (projectName: string) => {
    const now = new Date();
    // Get Monday of this week
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    console.log('ActiveProjectsList - Getting hours for project:', projectName);
    console.log('ActiveProjectsList - Project name length:', projectName.length);
    console.log('ActiveProjectsList - Project name bytes:', Array.from(projectName).map(c => c.charCodeAt(0)));
    console.log('ActiveProjectsList - Week starts Monday:', startOfWeek.toLocaleDateString());

    // Filter time logs for this week and this project
    const thisWeekLogs = timeLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const isThisWeek = logDate >= startOfWeek;
      
      // Match by project name in the log with detailed comparison
      const logProject = log.project || '';
      const exactMatch = logProject === projectName;
      const trimmedMatch = logProject.trim() === projectName.trim();
      const lowerCaseMatch = logProject.toLowerCase() === projectName.toLowerCase();
      
      console.log('ActiveProjectsList - Detailed matching for project "' + projectName + '":', {
        logProject: logProject,
        logProjectLength: logProject.length,
        logProjectBytes: Array.from(logProject).map(c => c.charCodeAt(0)),
        projectName: projectName,
        projectNameLength: projectName.length,
        projectNameBytes: Array.from(projectName).map(c => c.charCodeAt(0)),
        exactMatch: exactMatch,
        trimmedMatch: trimmedMatch,
        lowerCaseMatch: lowerCaseMatch,
        logDate: logDate.toLocaleDateString(),
        isThisWeek: isThisWeek,
        logDuration: log.duration,
        logType: log.type,
        logTask: log.task
      });
      
      return isThisWeek && (exactMatch || trimmedMatch || lowerCaseMatch);
    });

    console.log('ActiveProjectsList - This week logs for "' + projectName + '":', thisWeekLogs);

    const invested = thisWeekLogs
      .filter(log => log.type === 'invested')
      .reduce((sum, log) => sum + log.duration, 0) / 60;

    const spent = thisWeekLogs
      .filter(log => log.type === 'spent')
      .reduce((sum, log) => sum + log.duration, 0) / 60;

    console.log('ActiveProjectsList - Final hours for "' + projectName + '":', { invested, spent, total: invested + spent });

    return { invested, spent, total: invested + spent };
  };

  const getLifeAreaColor = (lifeArea: string) => {
    const colors = {
      'Work / Career': 'bg-purple-100 text-purple-800 border-purple-200',
      'Personal Growth': 'bg-blue-100 text-blue-800 border-blue-200',
      'Creative Projects': 'bg-orange-100 text-orange-800 border-orange-200',
      'Health & Routines': 'bg-red-100 text-red-800 border-red-200',
      'Relationships / Family': 'bg-pink-100 text-pink-800 border-pink-200',
      'Leisure/Hobby': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[lifeArea as keyof typeof colors] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Projects - This Week (Mon-Sun)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No active projects found.</p>
            <p className="text-sm">Create projects to start tracking time!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              console.log('ActiveProjectsList - Processing project:', project.name);
              const weeklyHours = getThisWeekHours(project.name);
              const completedTasks = project.tasks.filter(t => t.completed).length;
              const totalTasks = project.tasks.length;

              return (
                <div 
                  key={project.id} 
                  className={`p-4 rounded-lg border-2 ${getLifeAreaColor(project.lifeArea)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{project.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {project.lifeArea}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">
                        {formatHours(weeklyHours.total)}
                      </div>
                      <div className="text-xs text-slate-500">this week</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <Target className="h-3 w-3" />
                        <span className="font-medium">{formatHours(weeklyHours.invested)}</span>
                      </div>
                      <div className="text-xs text-slate-500">invested</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <Timer className="h-3 w-3" />
                        <span className="font-medium">{formatHours(weeklyHours.spent)}</span>
                      </div>
                      <div className="text-xs text-slate-500">spent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-700">
                        {completedTasks}/{totalTasks}
                      </div>
                      <div className="text-xs text-slate-500">tasks</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
