import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Plus, Clock, Target, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  lifeArea: string;
  description: string;
  status: string;
  progress: number;
  totalHours: number;
  investedHours: number;
  spentHours: number;
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
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLifeArea, setNewProjectLifeArea] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('');
  const { toast } = useToast();

  const lifeAreaOptions = [
    'Work / Career',
    'Creative Projects', 
    'Health & Routines',
    'Relationships / Family',
    'Leisure/Hobby'
  ];

  // Load projects from strategy session and localStorage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedStrategy = localStorage.getItem('strategySession');
    const savedProjects = localStorage.getItem('projects');
    let allProjects: Project[] = [];
    const projectNames = new Set<string>(); // Track unique project names
    
    // Load from saved projects first
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        allProjects = [...projects];
        // Track existing project names
        projects.forEach((p: Project) => projectNames.add(p.name.toLowerCase().trim()));
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }

    // Load from strategy session only if not already exists
    if (savedStrategy) {
      try {
        const data = JSON.parse(savedStrategy);
        if (data.projects) {
          const strategyProjects = data.projects
            .filter((p: any) => p.name.trim() !== '')
            .filter((p: any) => !projectNames.has(p.name.toLowerCase().trim())) // Avoid duplicates
            .map((p: any, index: number) => ({
              id: Date.now() + index, // Use timestamp for unique IDs
              name: p.name,
              lifeArea: p.lifeArea,
              description: p.description || '',
              status: 'active',
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

    // Mock projects if no saved projects
    if (allProjects.length === 0) {
      allProjects = [
        {
          id: 1,
          name: 'Fitness App',
          lifeArea: 'Health & Routines',
          description: 'Build a comprehensive fitness tracking app that monitors energy levels throughout the day',
          status: 'active',
          progress: 65,
          totalHours: 42.5,
          investedHours: 38.2,
          spentHours: 4.3,
          tasks: [
            { id: 1, name: 'User interface design', completed: true, estimatedHours: 8, investedHours: 8, spentHours: 0 },
            { id: 2, name: 'Backend API development', completed: true, estimatedHours: 12, investedHours: 12, spentHours: 0 },
            { id: 3, name: 'Energy tracking algorithm', completed: false, estimatedHours: 6, investedHours: 3, spentHours: 1 },
            { id: 4, name: 'Mobile app testing', completed: false, estimatedHours: 4, investedHours: 0, spentHours: 0 },
          ]
        }
      ];
    }

    setProjects(allProjects);
  };

  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const createNewProject = () => {
    if (!newProjectName.trim() || !newProjectLifeArea) {
      toast({
        title: "Error",
        description: "Please fill in project name and life area",
        variant: "destructive"
      });
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name: newProjectName,
      lifeArea: newProjectLifeArea,
      description: newProjectDescription,
      status: 'active',
      progress: 0,
      totalHours: 0,
      investedHours: 0,
      spentHours: 0,
      tasks: []
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectLifeArea('');
    setShowNewProject(false);
    
    toast({
      title: "Success",
      description: "Project created successfully"
    });
  };

  const addTask = (projectId: number) => {
    if (!newTaskName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name",
        variant: "destructive"
      });
      return;
    }

    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const newTask: Task = {
          id: Date.now(),
          name: newTaskName,
          completed: false,
          estimatedHours: parseFloat(newTaskHours) || 0,
          investedHours: 0,
          spentHours: 0
        };
        return {
          ...project,
          tasks: [...project.tasks, newTask]
        };
      }
      return project;
    });

    saveProjects(updatedProjects);
    setNewTaskName('');
    setNewTaskHours('');
    
    toast({
      title: "Success",
      description: "Task added successfully"
    });
  };

  const toggleTaskComplete = (projectId: number, taskId: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress
        };
      }
      return project;
    });

    saveProjects(updatedProjects);
  };

  const startTimerForTask = (projectId: number, taskId: number, taskName: string) => {
    // Store the current task info for the timer
    localStorage.setItem('currentTimerTask', JSON.stringify({
      projectId,
      taskId,
      taskName,
      projectName: projects.find(p => p.id === projectId)?.name
    }));
    
    toast({
      title: "Timer Ready",
      description: `Navigate to Time Tracker to start timing "${taskName}"`
    });
  };

  const getLifeAreaColor = (lifeArea: string) => {
    const colors = {
      'Work / Career': 'bg-blue-100 text-blue-800',
      'Creative Projects': 'bg-purple-100 text-purple-800',
      'Health & Routines': 'bg-red-100 text-red-800',
      'Relationships / Family': 'bg-pink-100 text-pink-800',
      'Leisure/Hobby': 'bg-green-100 text-green-800'
    };
    return colors[lifeArea as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const calculateProjectTotals = (project: Project) => {
    const totalInvested = project.tasks.reduce((sum, task) => sum + task.investedHours, 0);
    const totalSpent = project.tasks.reduce((sum, task) => sum + task.spentHours, 0);
    return {
      totalInvested: totalInvested,
      totalSpent: totalSpent,
      totalHours: totalInvested + totalSpent
    };
  };

  if (showNewProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowNewProject(false)}>
            ← Back to Projects
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Create New Project</h1>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <Input 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Life Area</label>
              <Select value={newProjectLifeArea} onValueChange={setNewProjectLifeArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select life area..." />
                </SelectTrigger>
                <SelectContent>
                  {lifeAreaOptions.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Input 
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createNewProject} className="flex-1">
                Create Project
              </Button>
              <Button variant="outline" onClick={() => setShowNewProject(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Projects</h1>
          <p className="text-slate-600">Manage your strategic projects and track progress</p>
        </div>
        <Button onClick={() => setShowNewProject(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {selectedProject === null ? (
        /* Projects Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totals = calculateProjectTotals(project);
            return (
              <Card 
                key={`project-${project.id}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getLifeAreaColor(project.lifeArea)}>
                      {project.lifeArea}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Total Hours</div>
                      <div className="font-semibold">{totals.totalHours.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Invested</div>
                      <div className="font-semibold text-green-600">{totals.totalInvested.toFixed(1)}h</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks done</span>
                    <span>Click to view details</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Project Detail View */
        (() => {
          const project = projects.find(p => p.id === selectedProject)!;
          const totals = calculateProjectTotals(project);
          
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProject(null)}
                >
                  ← Back to Projects
                </Button>
                <Badge className={getLifeAreaColor(project.lifeArea)}>
                  {project.lifeArea}
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <p className="text-slate-600">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totals.totalHours.toFixed(1)}h</div>
                      <div className="text-sm text-slate-600">Total Time</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totals.totalInvested.toFixed(1)}h</div>
                      <div className="text-sm text-slate-600">Invested</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{totals.totalSpent.toFixed(1)}h</div>
                      <div className="text-sm text-slate-600">Spent</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Project Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add New Task */}
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Add New Task</h4>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Task name..."
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        placeholder="Est. hours"
                        type="number"
                        value={newTaskHours}
                        onChange={(e) => setNewTaskHours(e.target.value)}
                        className="w-24"
                      />
                      <Button onClick={() => addTask(project.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div key={`task-${task.id}`} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleTaskComplete(project.id, task.id)}
                            className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`}
                          ></button>
                          <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-800'}>
                            {task.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">
                            Est: {task.estimatedHours}h | 
                            Inv: {task.investedHours.toFixed(1)}h | 
                            Spent: {task.spentHours.toFixed(1)}h
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startTimerForTask(project.id, task.id, task.name)}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start Timer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()
      )}
    </div>
  );
};
