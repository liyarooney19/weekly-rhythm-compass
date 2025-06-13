
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Target, Lightbulb, FolderOpen, Save } from 'lucide-react';

export const StrategySession = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dissatisfactions, setDissatisfactions] = useState(['']);
  const [hypotheses, setHypotheses] = useState(['']);
  const [projects, setProjects] = useState([{ name: '', description: '', lifeArea: 'Work / Career' }]);

  const steps = [
    { title: 'Current Dissatisfactions', icon: Target },
    { title: 'Hypotheses', icon: Lightbulb },
    { title: 'Projects', icon: FolderOpen },
  ];

  const lifeAreas = [
    'Work / Career',
    'Creative Projects', 
    'Health & Routines',
    'Relationships / Family',
    'Leisure/Hobby'
  ];

  const addDissatisfaction = () => {
    setDissatisfactions([...dissatisfactions, '']);
  };

  const updateDissatisfaction = (index: number, value: string) => {
    const updated = [...dissatisfactions];
    updated[index] = value;
    setDissatisfactions(updated);
    console.log('Updated dissatisfactions:', updated);
  };

  const removeDissatisfaction = (index: number) => {
    if (dissatisfactions.length > 1) {
      const updated = dissatisfactions.filter((_, i) => i !== index);
      setDissatisfactions(updated);
      
      // Also remove corresponding hypothesis
      const updatedHypotheses = hypotheses.filter((_, i) => i !== index);
      setHypotheses(updatedHypotheses);
    }
  };

  const addHypothesis = () => {
    setHypotheses([...hypotheses, '']);
  };

  const updateHypothesis = (index: number, value: string) => {
    const updated = [...hypotheses];
    updated[index] = value;
    setHypotheses(updated);
    console.log('Updated hypotheses:', updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', lifeArea: 'Work / Career' }]);
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
    console.log('Updated projects:', updated);
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      const updated = projects.filter((_, i) => i !== index);
      setProjects(updated);
    }
  };

  const saveStrategy = () => {
    const strategyData = {
      dissatisfactions: dissatisfactions.filter(d => d.trim() !== ''),
      hypotheses: hypotheses.filter(h => h.trim() !== ''),
      projects: projects.filter(p => p.name.trim() !== '' || p.description.trim() !== ''),
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage for now
    localStorage.setItem('strategySession', JSON.stringify(strategyData));
    console.log('Strategy saved:', strategyData);
    alert('Strategy session saved successfully!');
  };

  // Load data on component mount
  React.useEffect(() => {
    const savedStrategy = localStorage.getItem('strategySession');
    if (savedStrategy) {
      try {
        const data = JSON.parse(savedStrategy);
        if (data.dissatisfactions?.length > 0) {
          setDissatisfactions(data.dissatisfactions);
        }
        if (data.hypotheses?.length > 0) {
          setHypotheses(data.hypotheses);
        }
        if (data.projects?.length > 0) {
          setProjects(data.projects);
        }
        console.log('Strategy loaded:', data);
      } catch (error) {
        console.error('Error loading strategy:', error);
      }
    }
  }, []);

  // Ensure hypotheses array matches dissatisfactions length
  React.useEffect(() => {
    if (activeStep === 1) {
      const validDissatisfactions = dissatisfactions.filter(d => d.trim() !== '');
      if (hypotheses.length !== validDissatisfactions.length) {
        setHypotheses(validDissatisfactions.map((_, index) => hypotheses[index] || ''));
      }
    }
  }, [activeStep, dissatisfactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Strategy Session</h1>
          <p className="text-slate-600">Transform dissatisfactions into actionable projects</p>
        </div>
        <Button onClick={saveStrategy} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Save Strategy
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
                  activeStep === index
                    ? 'bg-blue-100 text-blue-700'
                    : activeStep > index
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <Icon size={20} />
                <span className="font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="mx-4 text-slate-400" size={20} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Dissatisfactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 mb-4">
              What aspects of your current situation are you dissatisfied with? Be specific and honest.
            </p>
            {dissatisfactions.map((dissatisfaction, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder={`Dissatisfaction ${index + 1}...`}
                  value={dissatisfaction}
                  onChange={(e) => updateDissatisfaction(index, e.target.value)}
                  className="min-h-[80px] flex-1"
                />
                {dissatisfactions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDissatisfaction(index)}
                    className="mt-2"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={addDissatisfaction} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Dissatisfaction
            </Button>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Hypotheses for Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 mb-4">
              For each dissatisfaction, write a hypothesis about how you might resolve it. What actions or changes could address the issue?
            </p>
            {dissatisfactions
              .filter((dissatisfaction) => dissatisfaction.trim() !== '')
              .map((dissatisfaction, index) => (
                <div key={index} className="space-y-3 p-4 border border-slate-200 rounded-lg">
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Dissatisfaction {index + 1}:</h4>
                    <p className="text-slate-600 text-sm">{dissatisfaction}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Your Hypothesis:</label>
                    <Textarea
                      placeholder={`If I do X, then this dissatisfaction will improve because...`}
                      value={hypotheses[index] || ''}
                      onChange={(e) => updateHypothesis(index, e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
            {dissatisfactions.filter(d => d.trim() !== '').length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>Go back to add dissatisfactions first</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Transform into Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600 mb-4">
              Turn your hypotheses into concrete projects. Each project should have a clear goal and life area assignment.
            </p>
            {projects.map((project, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Project {index + 1}</span>
                    <Badge variant="secondary">{project.lifeArea}</Badge>
                  </div>
                  {projects.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProject(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <select
                  value={project.lifeArea}
                  onChange={(e) => updateProject(index, 'lifeArea', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  {lifeAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Project name..."
                  value={project.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                />
                <Textarea
                  placeholder="Project description and goals..."
                  value={project.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            ))}
            <Button onClick={addProject} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
