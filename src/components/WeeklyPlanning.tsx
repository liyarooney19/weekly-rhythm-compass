
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  completed: boolean;
}

interface WeeklyTask {
  id: string;
  projectId: string | null;
  taskId: string | null;
  projectName: string;
  taskName: string;
  estimatedHours: number;
  completed: boolean;
  timeType: 'invested' | 'spent';
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
    return Math.round(numHours * 10) / 10;
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

    // Load weekly tasks
    const savedWeeklyTasks = localStorage.getItem('weeklyTasks');
    if (savedWeeklyTasks) {
      try {
        const parsed = JSON.parse(savedWeeklyTasks);
        if (Array.isArray(parsed)) {
          const validTasks = parsed
            .filter(task => task && task.taskName && task.taskName.trim())
            .map(task => ({
              id: task.id || Date.now().toString(),
              projectId: task.projectId || null,
              taskId: task.taskId || null,
              projectName: task.projectName || 'Standalone Task',
              taskName: task.taskName || 'Unknown Task',
              estimatedHours: formatHours(task.estimatedHours),
              completed: Boolean(task.completed),
              timeType: task.timeType || 'invested'
            }));
          
          setWeeklyTasks(validTasks);
        }
      } catch (error) {
        console.error('Error parsing weekly tasks:', error);
        setWeeklyTasks([]);
      }
    }
  };

  const saveWeeklyTasks = (tasks: WeeklyTask[]) => {
    const validTasks = tasks.filter(task => task && task.taskName && task.taskName.trim());
    setWeeklyTasks(validTasks);
    localStorage.setItem('weeklyTasks', JSON.stringify(validTasks));
  };

  const logCompletedTask = (task: WeeklyTask) => {
    // Create a time log entry when task is completed
    const timeLog: TimeLog = {
      id: Date.now().toString(),
      task: task.taskName,
      duration: task.estimatedHours * 60, // Convert hours to minutes
      type: task.timeType,
      timestamp: new Date().toISOString(),
      project: task.projectName !== 'Standalone Task' ? task.projectName : undefined,
      taskId: task.taskId || undefined
    };

    // Add to time logs
    const existingLogs = localStorage.getItem('timeLogs');
    const timeLogs = existingLogs ? JSON.parse(existingLogs) : [];
    timeLogs.push(timeLog);
    localStorage.setItem('timeLogs', JSON.stringify(timeLogs));

    console.log('Logged completed task:', timeLog);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = weeklyTasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const updatedTasks = weeklyTasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    // If task is being marked as completed (not uncompleted), log it
    if (!wasCompleted && task.estimatedHours > 0) {
      logCompletedTask({ ...task, completed: true });
      toast({
        title: "Task Completed",
        description: `${task.taskName} logged as ${task.timeType} time (${task.estimatedHours}h)`
      });
    }

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

    const estimatedHours = formatHours(taskEstimatedHours || 0);

    const newTask: WeeklyTask = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      taskId: selectedTask.id,
      projectName: selectedProject.name,
      taskName: selectedTask.name,
      estimatedHours: estimatedHours,
      completed: false,
      timeType: 'invested'
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
      timeType: 'invested'
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

  const updateEstimatedHours = (taskId: string, hours: string) => {
    const numericHours = formatHours(hours);
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, estimatedHours: numericHours }
        : task
    );
    saveWeeklyTasks(updatedTasks);
  };

  const updateTimeType = (taskId: string, timeType: 'invested' | 'spent') => {
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, timeType }
        : task
    );
    saveWeeklyTasks(updatedTasks);
  };

  const getTotalPlannedHours = () => {
    return formatHours(weeklyTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0));
  };

  const getCompletionPercentage = () => {
    if (weeklyTasks.length === 0) return 0;
    const completedTasks = weeklyTasks.filter(task => task.completed);
    return Math.round((completedTasks.length / weeklyTasks.length) * 100);
  };

  const getCompletedTasksCount = () => {
    return weeklyTasks.filter(task => task.completed).length;
  };

  const getCompletedHours = () => {
    return formatHours(weeklyTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Planning</h1>
        <p className="text-slate-600">Plan your weekly tasks and goals</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned Hours</CardTitle>
            <Target className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalPlannedHours()}h</div>
            <p className="text-xs text-slate-500">Total estimated time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Hours</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getCompletedHours()}h</div>
            <p className="text-xs text-slate-500">From completed tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedTasksCount()}/{weeklyTasks.length}</div>
            <p className="text-xs text-slate-500">Completed tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
            <p className="text-xs text-slate-500">Week completion</p>
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
                      <label className="block text-xs text-slate-500 mb-1">Estimated Hours</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={task.estimatedHours}
                        onChange={(e) => updateEstimatedHours(task.id, e.target.value)}
                        className="w-24 text-center"
                        disabled={task.completed}
                      />
                    </div>
                    <div className="text-sm">
                      <label className="block text-xs text-slate-500 mb-1">Time Type</label>
                      <RadioGroup 
                        value={task.timeType} 
                        onValueChange={(value) => updateTimeType(task.id, value as 'invested' | 'spent')}
                        className="flex gap-2"
                        disabled={task.completed}
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="invested" id={`invested-${task.id}`} disabled={task.completed} />
                          <label htmlFor={`invested-${task.id}`} className="text-xs text-green-600 cursor-pointer">
                            Invested
                          </label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="spent" id={`spent-${task.id}`} disabled={task.completed} />
                          <label htmlFor={`spent-${task.id}`} className="text-xs text-orange-600 cursor-pointer">
                            Spent
                          </label>
                        </div>
                      </RadioGroup>
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Planned Hours:</span>
                  <span className="font-medium ml-2">{getTotalPlannedHours()}h</span>
                </div>
                <div>
                  <span className="text-green-600">Completed Hours:</span>
                  <span className="font-medium ml-2 text-green-600">{getCompletedHours()}h</span>
                </div>
                <div>
                  <span className="text-slate-500">Progress:</span>
                  <span className="font-medium ml-2">{getCompletionPercentage()}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
