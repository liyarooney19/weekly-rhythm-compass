import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Timer } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  lifeArea: string;
  status: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
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

interface ProjectTimeData {
  project: Project;
  totalHours: number;
  investedHours: number;
  spentHours: number;
  taskEntries: {
    taskName: string;
    duration: number;
    type: 'invested' | 'spent';
  }[];
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
      setProjects(activeProjects);
    }

    // Load time logs
    const savedTimeLogs = localStorage.getItem('timeLogs');
    if (savedTimeLogs) {
      const parsedTimeLogs = JSON.parse(savedTimeLogs);
      setTimeLogs(parsedTimeLogs);
    }
  };

  const getThisWeekProjectData = (): ProjectTimeData[] => {
    const now = new Date();
    // Get Monday of this week
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Filter time logs for this week
    const thisWeekLogs = timeLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfWeek;
    });

    console.log('This week logs:', thisWeekLogs);

    // Group logs by project
    const projectDataMap = new Map<string, ProjectTimeData>();

    // Initialize all active projects - this ensures ALL active projects are shown
    projects.forEach(project => {
      projectDataMap.set(project.name, {
        project,
        totalHours: 0,
        investedHours: 0,
        spentHours: 0,
        taskEntries: []
      });
    });

    // Helper function to find matching project for a log
    const findMatchingProject = (logProjectName: string): string | null => {
      // First try exact match
      if (projectDataMap.has(logProjectName)) {
        return logProjectName;
      }
      
      // Then try to find a project that contains the log project name
      for (const projectName of projectDataMap.keys()) {
        if (projectName.toLowerCase().includes(logProjectName.toLowerCase()) || 
            logProjectName.toLowerCase().includes(projectName.toLowerCase())) {
          return projectName;
        }
      }
      
      // Finally, try to match by extracting the base name from parentheses
      for (const projectName of projectDataMap.keys()) {
        // Extract text in parentheses from project name
        const parenthesesMatch = projectName.match(/\(([^)]+)\)/);
        if (parenthesesMatch && parenthesesMatch[1].toLowerCase() === logProjectName.toLowerCase()) {
          return projectName;
        }
        
        // Also check if the log project name matches the base name (before parentheses)
        const baseName = projectName.split('(')[0].trim();
        if (baseName.toLowerCase() === logProjectName.toLowerCase()) {
          return projectName;
        }
      }
      
      return null;
    };

    // Process time logs
    thisWeekLogs.forEach(log => {
      const logProjectName = log.project;
      
      if (logProjectName) {
        const matchingProjectName = findMatchingProject(logProjectName);
        
        if (matchingProjectName && projectDataMap.has(matchingProjectName)) {
          const projectData = projectDataMap.get(matchingProjectName)!;
          const hours = (log.duration || 0) / 60; // Convert minutes to hours, handle undefined
          
          // Add to totals
          projectData.totalHours += hours;
          if (log.type === 'invested') {
            projectData.investedHours += hours;
          } else {
            projectData.spentHours += hours;
          }
          
          // Add task entry
          projectData.taskEntries.push({
            taskName: log.task,
            duration: hours,
            type: log.type
          });
          
          console.log(`Matched log project "${logProjectName}" to project "${matchingProjectName}"`);
          console.log(`Added ${hours}h of ${log.type} time for project "${matchingProjectName}", task "${log.task}"`);
        } else {
          console.log(`Log not matched to any project:`, { 
            logProject: logProjectName, 
            logTask: log.task,
            availableProjects: projects.map(p => p.name)
          });
        }
      }
    });

    // Return ALL active projects, not just those with time logged
    return Array.from(projectDataMap.values());
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

  const formatHours = (hours: number | undefined) => {
    // Handle undefined/null values
    const validHours = hours || 0;
    
    if (validHours < 1) {
      return `${Math.round(validHours * 60)}m`;
    }
    return `${validHours.toFixed(1)}h`;
  };

  const projectsWithTime = getThisWeekProjectData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Projects - This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectsWithTime.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No time logged for active projects this week.</p>
            <p className="text-sm">Complete tasks in Weekly Planning to see time here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectsWithTime.map((projectData) => {
              const { project, totalHours, investedHours, spentHours, taskEntries } = projectData;
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
                        {formatHours(totalHours)}
                      </div>
                      <div className="text-xs text-slate-500">this week</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <Target className="h-3 w-3" />
                        <span className="font-medium">{formatHours(investedHours)}</span>
                      </div>
                      <div className="text-xs text-slate-500">invested</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <Timer className="h-3 w-3" />
                        <span className="font-medium">{formatHours(spentHours)}</span>
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

                  {/* Task entries for this week */}
                  {taskEntries.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium text-slate-600 mb-2">This Week's Tasks:</div>
                      <div className="space-y-1">
                        {taskEntries.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 truncate">{entry.taskName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${entry.type === 'invested' ? 'text-green-600' : 'text-amber-600'}`}>
                                {formatHours(entry.duration)}
                              </span>
                              <Badge variant="outline" className={`text-xs px-1 py-0 ${entry.type === 'invested' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                {entry.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
