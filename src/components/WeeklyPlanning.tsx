
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, Target, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyTask {
  id: number;
  type: 'project' | 'personal';
  title: string;
  estimatedHours: number;
  timeType: 'invested' | 'spent';
  project?: string;
  projectId?: number;
  taskId?: number;
  completed: boolean;
}

export const WeeklyPlanning = () => {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    estimatedHours: 1, 
    timeType: 'invested', 
    project: '',
    projectId: 0,
    taskId: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const loadTasks = () => {
    const saved = localStorage.getItem('weeklyTasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading weekly tasks:', error);
      }
    }
  };

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  };

  const saveTasks = (updatedTasks: WeeklyTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('weeklyTasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    const task: WeeklyTask = { 
      id: Date.now(), 
      type: newTask.project ? 'project' : 'personal',
      title: newTask.title, 
      estimatedHours: newTask.estimatedHours, 
      timeType: newTask.timeType as 'invested' | 'spent',
      project: newTask.project,
      projectId: newTask.projectId || undefined,
      taskId: newTask.taskId || undefined,
      completed: false
    };

    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    
    setNewTask({ 
      title: '', 
      estimatedHours: 1, 
      timeType: 'invested', 
      project: '',
      projectId: 0,
      taskId: 0
    });
    
    toast({
      title: "Success",
      description: "Task added to weekly plan"
    });
  };

  const addExistingTask = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id.toString() === projectId);
    const task = project?.tasks.find((t: any) => t.id.toString() === taskId);
    
    if (!project || !task) return;

    const weeklyTask: WeeklyTask = {
      id: Date.now(),
      type: 'project',
      title: task.name,
      estimatedHours: task.estimatedHours || 1,
      timeType: 'invested',
      project: project.name,
      projectId: project.id,
      taskId: task.id,
      completed: false
    };

    const updatedTasks = [...tasks, weeklyTask];
    saveTasks(updatedTasks);
    
    toast({
      title: "Success",
      description: "Project task added to weekly plan"
    });
  };

  const toggleTaskComplete = (taskId: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    
    toast({
      title: "Success",
      description: "Task removed from weekly plan"
    });
  };

  const totalPlannedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const investedHours = tasks.filter(task => task.timeType === 'invested').reduce((sum, task) => sum + task.estimatedHours, 0);
  const spentHours = tasks.filter(task => task.timeType === 'spent').reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedTasks = tasks.filter(task => task.completed).length;

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);
  const availableTasks = selectedProjectData?.tasks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Planning</h1>
        <p className="text-slate-600">Plan your week based on strategy session outcomes</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Planned</p>
                <p className="text-2xl font-bold text-slate-800">{totalPlannedHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Invested Time</p>
                <p className="text-2xl font-bold text-green-600">{investedHours}h</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Spent Time</p>
                <p className="text-2xl font-bold text-orange-600">{spentHours}h</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Existing Project Task */}
      <Card>
        <CardHeader>
          <CardTitle>Add Existing Project Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProjectData && availableTasks.length > 0 && (
              <Select onValueChange={(taskId) => addExistingTask(selectedProject, taskId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((task: any) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.name} ({task.estimatedHours}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button 
              disabled={!selectedProject || availableTasks.length === 0}
              onClick={() => {
                if (availableTasks.length > 0) {
                  // Add first available task if none selected
                  addExistingTask(selectedProject, availableTasks[0].id.toString());
                }
              }}
            >
              Add Selected Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Weekly Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Hours"
              value={newTask.estimatedHours}
              onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) || 1 })}
            />
            <select
              value={newTask.timeType}
              onChange={(e) => setNewTask({ ...newTask, timeType: e.target.value as 'invested' | 'spent' })}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="invested">Invested</option>
              <option value="spent">Spent</option>
            </select>
            <Input
              placeholder="Project (optional)"
              value={newTask.project}
              onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`}
                  ></button>
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {task.title}
                    </h3>
                    {task.project && (
                      <p className="text-sm text-slate-600">Project: {task.project}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.timeType === 'invested' ? 'default' : 'secondary'}>
                    {task.timeType}
                  </Badge>
                  <span className="text-sm text-slate-600">{task.estimatedHours}h</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <p className="text-slate-500 text-center py-4">No tasks planned for this week</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
