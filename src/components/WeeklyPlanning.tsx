import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, Plus, Trash2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  status: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
}

interface WeeklyTask {
  id: string;
  projectId: string | null;
  taskId: string | null;
  projectName: string;
  taskName: string;
  estimatedHours: number;
  completed: boolean;
  actualHours: number;
}

export const WeeklyPlanning = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskEstimatedHours, setTaskEstimatedHours] = useState('');
  const [standaloneTaskName, setStandaloneTaskName] = useState('');
  const [standaloneTaskHours, setStandaloneTaskHours] = useState('');

  const formatHours = (hours: number | string): number => {
    const numHours = typeof hours === 'string' ? parseFloat(hours) || 0 : hours || 0;
    return Math.round(numHours * 10) / 10; // Round to 1 decimal place
  };

  const validateWeeklyTask = (task: any): WeeklyTask | null => {
    if (!task || typeof task !== 'object') return null;
    
    return {
      id: task.id || Date.now().toString(),
      projectId: task.projectId || null,
      taskId: task.taskId || null,
      projectName: task.projectName || 'Standalone Task',
      taskName: task.taskName || 'Unknown Task',
      estimatedHours: formatHours(task.estimatedHours),
      completed: Boolean(task.completed),
      actualHours: formatHours(task.actualHours)
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load projects
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) {
          setProjects(parsed.filter(p => p && p.name && p.name.trim()));
        }
      } catch (error) {
        console.error('Error parsing projects:', error);
        setProjects([]);
      }
    }

    // Load weekly tasks with validation
    const savedWeeklyTasks = localStorage.getItem('weeklyTasks');
    if (savedWeeklyTasks) {
      try {
        const parsed = JSON.parse(savedWeeklyTasks);
        if (Array.isArray(parsed)) {
          const validTasks = parsed
            .map(validateWeeklyTask)
            .filter(task => task !== null && task.taskName.trim() !== '')
            .filter(task => task !== null) as WeeklyTask[];
          
          setWeeklyTasks(validTasks);
          
          // If we had to clean up tasks, save the cleaned version
          if (validTasks.length !== parsed.length) {
            localStorage.setItem('weeklyTasks', JSON.stringify(validTasks));
          }
        }
      } catch (error) {
        console.error('Error parsing weekly tasks:', error);
        setWeeklyTasks([]);
        localStorage.removeItem('weeklyTasks'); // Clear corrupted data
      }
    }
  };

  const saveWeeklyTasks = (tasks: WeeklyTask[]) => {
    const validTasks = tasks.filter(task => task && task.taskName && task.taskName.trim());
    setWeeklyTasks(validTasks);
    localStorage.setItem('weeklyTasks', JSON.stringify(validTasks));
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveWeeklyTasks(updatedTasks);
  };

  const removeTaskFromWeek = (taskId: string) => {
    const updatedTasks = weeklyTasks.filter(task => task.id !== taskId);
    saveWeeklyTasks(updatedTasks);
  };

  const addTaskToWeek = () => {
    if (!selectedProject || !selectedTask) {
      toast({
        title: "Error",
        description: "Please select both a project and task",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProject.name.trim() || !selectedTask.name.trim()) {
      toast({
        title: "Error",
        description: "Invalid project or task selected",
        variant: "destructive"
      });
      return;
    }

    const estimatedHours = formatHours(taskEstimatedHours || 0);

    const newTask: WeeklyTask = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      taskId: selectedTask.id,
      projectName: selectedProject.name,
      taskName: selectedTask.name,
      estimatedHours: estimatedHours,
      completed: false,
      actualHours: 0
    };

    const updatedTasks = [...weeklyTasks, newTask];
    saveWeeklyTasks(updatedTasks);

    // Reset selections
    setSelectedProject(null);
    setSelectedTask(null);
    setTaskEstimatedHours('');

    toast({
      title: "Task Added",
      description: "Task has been added to this week's plan"
    });
  };

  const addStandaloneTask = () => {
    if (!standaloneTaskName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name",
        variant: "destructive"
      });
      return;
    }

    const estimatedHours = formatHours(standaloneTaskHours || 0);

    const newTask: WeeklyTask = {
      id: Date.now().toString(),
      projectId: null,
      taskId: null,
      projectName: 'Standalone Task',
      taskName: standaloneTaskName.trim(),
      estimatedHours: estimatedHours,
      completed: false,
      actualHours: 0
    };

    const updatedTasks = [...weeklyTasks, newTask];
    saveWeeklyTasks(updatedTasks);

    // Reset form
    setStandaloneTaskName('');
    setStandaloneTaskHours('');

    toast({
      title: "Standalone Task Added",
      description: "Task has been added to this week's plan"
    });
  };

  const updateTaskHours = (taskId: string, hours: string) => {
    const numericHours = formatHours(hours);
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, actualHours: numericHours }
        : task
    );
    saveWeeklyTasks(updatedTasks);
  };

  const updateEstimatedHours = (taskId: string, hours: string) => {
    const numericHours = formatHours(hours);
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, estimatedHours: numericHours }
        : task
    );
    saveWeeklyTasks(updatedTasks);
  };

  const getTotalPlannedHours = () => {
    return formatHours(weeklyTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0));
  };

  const getTotalActualHours = () => {
    return formatHours(weeklyTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0));
  };

  const getCompletionPercentage = () => {
    if (weeklyTasks.length === 0) return 0;
    const completedTasks = weeklyTasks.filter(task => task.completed);
    return Math.round((completedTasks.length / weeklyTasks.length) * 100);
  };

  const getCompletedTasksCount = () => {
    return weeklyTasks.filter(task => task.completed).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Planning</h1>
        <p className="text-slate-600">Plan and track your weekly tasks and goals</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planned</CardTitle>
            <Target className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalPlannedHours()}h</div>
            <p className="text-xs text-slate-500">Estimated hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Hours</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalActualHours()}h</div>
            <p className="text-xs text-slate-500">Time logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
            <p className="text-xs text-slate-500">{getCompletedTasksCount()} of {weeklyTasks.length} tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Tasks to This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Tasks */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">From Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Project</label>
                <Select value={selectedProject?.id || ''} onValueChange={(value) => {
                  const project = projects.find(p => p.id === value);
                  setSelectedProject(project || null);
                  setSelectedTask(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter(p => (p.status === 'active' || !p.status) && p.name && p.name.trim())
                      .map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Task</label>
                <Select 
                  value={selectedTask?.id || ''} 
                  onValueChange={(value) => {
                    const task = selectedProject?.tasks?.find(t => t.id === value);
                    setSelectedTask(task || null);
                  }}
                  disabled={!selectedProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProject?.tasks
                      ?.filter(task => task.name && task.name.trim())
                      .map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Estimated Hours</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 2.5"
                  value={taskEstimatedHours}
                  onChange={(e) => setTaskEstimatedHours(e.target.value)}
                />
              </div>
              <Button 
                onClick={addTaskToWeek}
                disabled={!selectedProject || !selectedTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project Task
              </Button>
            </div>
          </div>

          {/* Standalone Tasks */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Standalone Tasks</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Task Name</label>
                <Input
                  placeholder="e.g., Clean workspace, Review emails..."
                  value={standaloneTaskName}
                  onChange={(e) => setStandaloneTaskName(e.target.value)}
                />
              </div>
              <div className="w-32">
                <label className="text-sm font-medium mb-2 block">Estimated Hours</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 1.5"
                  value={standaloneTaskHours}
                  onChange={(e) => setStandaloneTaskHours(e.target.value)}
                />
              </div>
              <Button 
                onClick={addStandaloneTask}
                disabled={!standaloneTaskName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Standalone Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No tasks planned for this week yet.</p>
              <p className="text-sm">Add tasks from your projects or create standalone tasks above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.taskName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {task.projectName}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-sm">
                      <label className="block text-xs text-slate-500 mb-1">Estimated</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={task.estimatedHours}
                        onChange={(e) => updateEstimatedHours(task.id, e.target.value)}
                        className="w-20 text-center"
                      />
                    </div>
                    <div className="text-sm">
                      <label className="block text-xs text-slate-500 mb-1">Actual</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={task.actualHours}
                        onChange={(e) => updateTaskHours(task.id, e.target.value)}
                        className="w-20 text-center"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTaskFromWeek(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      {weeklyTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tasks Completed</span>
                  <span>{getCompletedTasksCount()} / {weeklyTasks.length}</span>
                </div>
                <Progress value={getCompletionPercentage()} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Planned Hours:</span>
                  <span className="font-medium ml-2">{getTotalPlannedHours()}h</span>
                </div>
                <div>
                  <span className="text-slate-500">Actual Hours:</span>
                  <span className="font-medium ml-2">{getTotalActualHours()}h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
