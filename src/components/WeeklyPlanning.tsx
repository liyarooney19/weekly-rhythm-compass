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
  projectId: string;
  taskId: string;
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

  const formatHours = (hours: number) => {
    return Math.round(hours * 10) / 10; // Round to 1 decimal place
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load projects
    const savedProjects = localStorage.getItem('projects');
    setProjects(savedProjects ? JSON.parse(savedProjects) : []);

    // Load weekly tasks
    const savedWeeklyTasks = localStorage.getItem('weeklyTasks');
    setWeeklyTasks(savedWeeklyTasks ? JSON.parse(savedWeeklyTasks) : []);
  };

  const saveWeeklyTasks = (tasks: WeeklyTask[]) => {
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setWeeklyTasks(updatedTasks);
    saveWeeklyTasks(updatedTasks);
  };

  const removeTaskFromWeek = (taskId: string) => {
    const updatedTasks = weeklyTasks.filter(task => task.id !== taskId);
    setWeeklyTasks(updatedTasks);
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

    const estimatedHours = parseFloat(taskEstimatedHours) || 0;

    const newTask = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      taskId: selectedTask.id,
      projectName: selectedProject.name,
      taskName: selectedTask.name,
      estimatedHours: formatHours(estimatedHours),
      completed: false,
      actualHours: 0
    };

    const updatedTasks = [...weeklyTasks, newTask];
    setWeeklyTasks(updatedTasks);
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

  const updateTaskHours = (taskId: string, hours: string) => {
    const numericHours = parseFloat(hours) || 0;
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, actualHours: formatHours(numericHours) }
        : task
    );
    setWeeklyTasks(updatedTasks);
    saveWeeklyTasks(updatedTasks);
  };

  const updateEstimatedHours = (taskId: string, hours: string) => {
    const numericHours = parseFloat(hours) || 0;
    const updatedTasks = weeklyTasks.map(task =>
      task.id === taskId
        ? { ...task, estimatedHours: formatHours(numericHours) }
        : task
    );
    setWeeklyTasks(updatedTasks);
    saveWeeklyTasks(updatedTasks);
  };

  const getTotalPlannedHours = () => {
    return formatHours(weeklyTasks.reduce((sum, task) => sum + task.estimatedHours, 0));
  };

  const getTotalActualHours = () => {
    return formatHours(weeklyTasks.reduce((sum, task) => sum + task.actualHours, 0));
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
        <CardContent className="space-y-4">
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
                  {projects.filter(p => p.status === 'active' || !p.status).map(project => (
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
                  {selectedProject?.tasks?.map(task => (
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
              Add Selected Task
            </Button>
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
              <p className="text-sm">Add tasks from your projects above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={(checked) => toggleTaskCompletion(task.id)}
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
