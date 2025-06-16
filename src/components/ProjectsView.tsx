import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Timer, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  description: string;
  lifeArea: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  totalHours: number;
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

export const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    lifeArea: 'Work / Career'
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    estimatedHours: ''
  });
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [editProjectDialog, setEditProjectDialog] = useState(false);
  const { toast } = useToast();

  const lifeAreas = [
    'Work / Career',
    'Personal Growth',
    'Creative Projects', 
    'Health & Routines',
    'Relationships / Family',
    'Leisure/Hobby'
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedStrategy = localStorage.getItem('strategySession');
    const savedProjects = localStorage.getItem('projects');
    let allProjects: Project[] = [];
    
    // Load from saved projects first (these have tasks and time data)
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        allProjects = [...projects];
        console.log('Loaded saved projects:', projects);
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }

    // Load from strategy session (these typically don't have tasks yet)
    if (savedStrategy) {
      try {
        const data = JSON.parse(savedStrategy);
        if (data.projects) {
          const existingNames = new Set(allProjects.map(p => p.name.toLowerCase().trim()));
          const strategyProjects = data.projects
            .filter((p: any) => p.name.trim() !== '')
            .filter((p: any) => !existingNames.has(p.name.toLowerCase().trim()))
            .map((p: any, index: number) => ({
              id: Date.now() + index,
              name: p.name,
              description: p.description || '',
              lifeArea: p.lifeArea,
              status: 'planning' as const,
              progress: 0,
              totalHours: 0,
              investedHours: 0,
              spentHours: 0,
              tasks: []
            }));
          allProjects = [...allProjects, ...strategyProjects];
        }
      } catch (error) {
        console.error('Error loading strategy projects:', error);
      }
    }

    setProjects(allProjects);
  };

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const addProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      id: Date.now(),
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      lifeArea: newProject.lifeArea,
      status: 'planning',
      progress: 0,
      totalHours: 0,
      investedHours: 0,
      spentHours: 0,
      tasks: []
    };

    const updatedProjects = [...projects, project];
    saveProjects(updatedProjects);

    setNewProject({
      name: '',
      description: '',
      lifeArea: 'Work / Career'
    });
    setNewProjectDialog(false);

    toast({
      title: "Project Added",
      description: `${project.name} has been added to your projects`
    });
  };

  const deleteProject = (projectId: number) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    saveProjects(updatedProjects);

    toast({
      title: "Project Deleted",
      description: "Project has been deleted"
    });
  };

  const addTask = (projectId: number) => {
    if (!newTask.name.trim() || !newTask.estimatedHours.trim()) {
      toast({
        title: "Error",
        description: "Please enter task name and estimated hours",
        variant: "destructive"
      });
      return;
    }

    const estimatedHours = parseFloat(newTask.estimatedHours);
    if (isNaN(estimatedHours) || estimatedHours <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid estimated hours",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now(),
      name: newTask.name.trim(),
      completed: false,
      estimatedHours: estimatedHours,
      investedHours: 0,
      spentHours: 0
    };

    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...project.tasks, task]
        };
      }
      return project;
    });
    saveProjects(updatedProjects);

    setNewTask({
      name: '',
      estimatedHours: ''
    });

    toast({
      title: "Task Added",
      description: `${task.name} has been added to ${updatedProjects.find(p => p.id === projectId)?.name}`
    });
  };

  const deleteTask = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId)
        };
      }
      return project;
    });
    saveProjects(updatedProjects);

    toast({
      title: "Task Deleted",
      description: "Task has been deleted"
    });
  };

  const toggleTask = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: !task.completed
            };
          }
          return task;
        });
        return {
          ...project,
          tasks: updatedTasks
        };
      }
      return project;
    });
    saveProjects(updatedProjects);
  };

  const startTaskTimer = (projectId: number, taskId: number, taskName: string) => {
    // Store the task details in localStorage
    localStorage.setItem('currentTimerTask', JSON.stringify({
      projectId: projectId,
      taskId: taskId,
      taskName: taskName
    }));

    // Redirect to the TimeTracker page
    window.location.href = '/time-tracker';
  };

  const getLifeAreaColor = (lifeArea: string) => {
    const colors = {
      'Work / Career': 'bg-purple-100 text-purple-800',
      'Personal Growth': 'bg-blue-100 text-blue-800',
      'Creative Projects': 'bg-orange-100 text-orange-800',
      'Health & Routines': 'bg-red-100 text-red-800',
      'Relationships / Family': 'bg-pink-100 text-pink-800',
      'Leisure/Hobby': 'bg-green-100 text-green-800'
    };
    return colors[lifeArea as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const calculateTotalHours = (tasks: Task[], type: 'invested' | 'spent') => {
    return tasks.reduce((sum, task) => sum + (task[type === 'invested' ? 'investedHours' : 'spentHours'] || 0), 0);
  };

  const editProject = (project: Project) => {
    setEditingProject({ ...project });
    setEditProjectDialog(true);
  };

  const updateProject = () => {
    if (!editingProject || !editingProject.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    const updatedProjects = projects.map(project => 
      project.id === editingProject.id ? editingProject : project
    );
    saveProjects(updatedProjects);

    setEditProjectDialog(false);
    setEditingProject(null);

    toast({
      title: "Project Updated",
      description: `${editingProject.name} has been updated`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Projects Overview</h1>
          <p className="text-slate-600">Manage your projects and track time investment</p>
        </div>
        <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project name..."
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
              <Textarea
                placeholder="Project description..."
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <Select value={newProject.lifeArea} onValueChange={(value) => setNewProject({...newProject, lifeArea: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select life area..." />
                </SelectTrigger>
                <SelectContent>
                  {lifeAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={addProject} disabled={!newProject.name.trim()}>
                  Add Project
                </Button>
                <Button variant="outline" onClick={() => setNewProjectDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectDialog} onOpenChange={setEditProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">
              <Input
                placeholder="Project name..."
                value={editingProject.name}
                onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
              />
              <Textarea
                placeholder="Project description..."
                value={editingProject.description}
                onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
              />
              <Select value={editingProject.lifeArea} onValueChange={(value) => setEditingProject({...editingProject, lifeArea: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select life area..." />
                </SelectTrigger>
                <SelectContent>
                  {lifeAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={updateProject} disabled={!editingProject.name.trim()}>
                  Update Project
                </Button>
                <Button variant="outline" onClick={() => setEditProjectDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const taskInvested = calculateTotalHours(project.tasks, 'invested');
          const taskSpent = calculateTotalHours(project.tasks, 'spent');
          const projectInvested = project.investedHours || 0;
          const projectSpent = project.spentHours || 0;
          const totalInvested = taskInvested + projectInvested;
          const totalSpent = taskSpent + projectSpent;
          
          console.log(`ProjectsView - ${project.name}: taskInvested=${taskInvested}, projectInvested=${projectInvested}, totalInvested=${totalInvested}`);

          return (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getLifeAreaColor(project.lifeArea)} variant="outline">
                      {project.lifeArea}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Project</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete "{project.name}"? This action cannot be undone.</p>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="destructive" 
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete
                          </Button>
                          <Button variant="outline">Cancel</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-slate-600">{project.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Invested:</span>
                      <span className="font-mono text-green-600">{totalInvested.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent:</span>
                      <span className="font-mono text-amber-600">{totalSpent.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span>{project.tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Tasks</h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Task to {project.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Task name..."
                            value={newTask.name}
                            onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                          />
                          <Input
                            type="number"
                            placeholder="Estimated hours..."
                            value={newTask.estimatedHours}
                            onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                            min="0"
                            step="0.5"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => addTask(project.id)} disabled={!newTask.name.trim()}>
                              Add Task
                            </Button>
                            <Button variant="outline">Cancel</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {project.tasks.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No tasks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {project.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => toggleTask(project.id, task.id)}
                            />
                            <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : ''}`}>
                              {task.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-500">
                              {task.investedHours.toFixed(1)}h / {task.estimatedHours}h
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startTaskTimer(project.id, task.id, task.name)}
                            >
                              <Timer className="h-3 w-3" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Task</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete "{task.name}"? This action cannot be undone.</p>
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => deleteTask(project.id, task.id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button variant="outline">Cancel</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-slate-600">Total Projects</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {projects.reduce((sum, p) => {
                  const taskInvested = calculateTotalHours(p.tasks, 'invested');
                  const projectInvested = p.investedHours || 0;
                  return sum + taskInvested + projectInvested;
                }, 0).toFixed(1)}h
              </div>
              <div className="text-sm text-slate-600">Invested Hours</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {projects.reduce((sum, p) => {
                  const taskSpent = calculateTotalHours(p.tasks, 'spent');
                  const projectSpent = p.spentHours || 0;
                  return sum + taskSpent + projectSpent;
                }, 0).toFixed(1)}h
              </div>
              <div className="text-sm text-slate-600">Spent Hours</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {projects.reduce((sum, p) => sum + p.tasks.length, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
