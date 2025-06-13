
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, Plus, Clock, Target, CheckCircle } from 'lucide-react';

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
}

export const ProjectsView = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects from strategy session and mock data
  useEffect(() => {
    const savedStrategy = localStorage.getItem('strategySession');
    let strategyProjects: Project[] = [];
    
    if (savedStrategy) {
      try {
        const data = JSON.parse(savedStrategy);
        if (data.projects) {
          strategyProjects = data.projects
            .filter((p: any) => p.name.trim() !== '')
            .map((p: any, index: number) => ({
              id: index + 100, // Start with high IDs to avoid conflicts
              name: p.name,
              lifeArea: p.lifeArea.toLowerCase().replace(/[^a-z]/g, ''),
              description: p.description,
              status: 'active',
              progress: 0,
              totalHours: 0,
              investedHours: 0,
              spentHours: 0,
              tasks: []
            }));
        }
      } catch (error) {
        console.error('Error loading strategy projects:', error);
      }
    }

    // Mock projects data (existing examples)
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'Fitness App',
        lifeArea: 'health',
        description: 'Build a comprehensive fitness tracking app that monitors energy levels throughout the day',
        status: 'active',
        progress: 65,
        totalHours: 42.5,
        investedHours: 38.2,
        spentHours: 4.3,
        tasks: [
          { id: 1, name: 'User interface design', completed: true, estimatedHours: 8 },
          { id: 2, name: 'Backend API development', completed: true, estimatedHours: 12 },
          { id: 3, name: 'Energy tracking algorithm', completed: false, estimatedHours: 6 },
          { id: 4, name: 'Mobile app testing', completed: false, estimatedHours: 4 },
        ]
      },
      {
        id: 2,
        name: 'Learn React Patterns',
        lifeArea: 'work',
        description: 'Master advanced React patterns and hooks for professional development',
        status: 'active',
        progress: 40,
        totalHours: 18.5,
        investedHours: 17.1,
        spentHours: 1.4,
        tasks: [
          { id: 5, name: 'Study compound components', completed: true, estimatedHours: 4 },
          { id: 6, name: 'Practice render props pattern', completed: false, estimatedHours: 3 },
          { id: 7, name: 'Build custom hooks', completed: false, estimatedHours: 5 },
          { id: 8, name: 'Context API deep dive', completed: false, estimatedHours: 4 },
        ]
      },
    ];

    // Combine strategy projects with mock projects
    setProjects([...strategyProjects, ...mockProjects]);
  }, []);

  const getLifeAreaColor = (lifeArea: string) => {
    const colors = {
      workcareer: 'bg-blue-100 text-blue-800',
      work: 'bg-blue-100 text-blue-800',
      creativeprojects: 'bg-purple-100 text-purple-800',
      creative: 'bg-purple-100 text-purple-800',
      healthroutines: 'bg-red-100 text-red-800',
      health: 'bg-red-100 text-red-800',
      relationshipsfamily: 'bg-pink-100 text-pink-800',
      relationships: 'bg-pink-100 text-pink-800',
      leisurehobby: 'bg-green-100 text-green-800',
      leisure: 'bg-green-100 text-green-800',
      startup: 'bg-purple-100 text-purple-800',
      personal: 'bg-green-100 text-green-800',
      learning: 'bg-orange-100 text-orange-800'
    };
    return colors[lifeArea as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Projects</h1>
          <p className="text-slate-600">Manage your strategic projects and track progress</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {selectedProject === null ? (
        /* Projects Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
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
                    <div className="font-semibold">{project.totalHours}h</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Invested</div>
                    <div className="font-semibold text-green-600">{project.investedHours}h</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks done</span>
                  <span>Click to view details</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ... keep existing code (Project Detail View) */
        (() => {
          const project = projects.find(p => p.id === selectedProject)!;
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
                      <div className="text-2xl font-bold text-blue-600">{project.totalHours}h</div>
                      <div className="text-sm text-slate-600">Total Time</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{project.investedHours}h</div>
                      <div className="text-sm text-slate-600">Invested</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{project.spentHours}h</div>
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
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          <span className={task.completed ? 'line-through text-slate-500' : 'text-slate-800'}>
                            {task.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{task.estimatedHours}h</span>
                          <Button size="sm" variant="outline">
                            <Clock className="h-4 w-4 mr-1" />
                            Track Time
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Task
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })()
      )}
    </div>
  );
};
