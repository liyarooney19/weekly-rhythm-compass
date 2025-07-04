
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  lifeArea: string;
  status: 'active' | 'postponed';
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    lifeArea: 'Work / Career',
    status: 'active' as 'active' | 'postponed'
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState({ name: '' });
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
    // Load from saved projects first
    const savedProjects = localStorage.getItem('projects');
    let allProjects: Project[] = [];
    
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        allProjects = projects.map((p: any) => ({
          id: p.id?.toString() || Date.now().toString(),
          name: p.name || '',
          description: p.description || '',
          lifeArea: p.lifeArea || 'Work / Career',
          status: p.status || 'active',
          tasks: (p.tasks || []).map((t: any) => ({
            id: t.id?.toString() || Date.now().toString(),
            name: t.name || '',
            completed: Boolean(t.completed)
          }))
        }));
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }

    // Load from strategy session if no saved projects
    if (allProjects.length === 0) {
      const savedStrategy = localStorage.getItem('strategySession');
      if (savedStrategy) {
        try {
          const data = JSON.parse(savedStrategy);
          if (data.projects) {
            const strategyProjects = data.projects
              .filter((p: any) => p.name?.trim())
              .map((p: any, index: number) => ({
                id: (Date.now() + index).toString(),
                name: p.name.trim(),
                description: p.description || '',
                lifeArea: p.lifeArea || 'Work / Career',
                status: 'active' as const,
                tasks: []
              }));
            allProjects = strategyProjects;
          }
        } catch (error) {
          console.error('Error loading strategy projects:', error);
        }
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
      id: Date.now().toString(),
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      lifeArea: newProject.lifeArea,
      status: newProject.status,
      tasks: []
    };

    const updatedProjects = [...projects, project];
    saveProjects(updatedProjects);

    setNewProject({
      name: '',
      description: '',
      lifeArea: 'Work / Career',
      status: 'active'
    });
    setNewProjectDialog(false);

    toast({
      title: "Project Added",
      description: `${project.name} has been added to your projects`
    });
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    saveProjects(updatedProjects);

    toast({
      title: "Project Deleted",
      description: "Project has been deleted"
    });
  };

  const addTask = (projectId: string) => {
    if (!newTask.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter task name",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name.trim(),
      completed: false
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

    setNewTask({ name: '' });

    toast({
      title: "Task Added",
      description: `${task.name} has been added to ${updatedProjects.find(p => p.id === projectId)?.name}`
    });
  };

  const deleteTask = (projectId: string, taskId: string) => {
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

  const toggleTask = (projectId: string, taskId: string) => {
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

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
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
          <p className="text-slate-600">Manage your projects and create tasks</p>
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
              <Select value={newProject.status} onValueChange={(value: 'active' | 'postponed') => setNewProject({...newProject, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
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
              <Select value={editingProject.status} onValueChange={(value: 'active' | 'postponed') => setEditingProject({...editingProject, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
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
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getLifeAreaColor(project.lifeArea)} variant="outline">
                      {project.lifeArea}
                    </Badge>
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {project.status}
                    </Badge>
                  </div>
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

              {/* Tasks */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tasks ({project.tasks.length})</h4>
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
                          onChange={(e) => setNewTask({name: e.target.value})}
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
                            onCheckedChange={() => toggleTask(project.id, task.id)}
                          />
                          <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.name}
                          </span>
                        </div>
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
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-slate-600">Total Projects</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Projects</div>
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
