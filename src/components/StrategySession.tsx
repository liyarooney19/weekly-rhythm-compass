
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Target, Lightbulb, FolderOpen } from 'lucide-react';

export const StrategySession = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dissatisfactions, setDissatisfactions] = useState(['']);
  const [hypotheses, setHypotheses] = useState(['']);
  const [projects, setProjects] = useState([{ name: '', description: '', lifeArea: 'work' }]);

  const steps = [
    { title: 'Current Dissatisfactions', icon: Target },
    { title: 'Hypotheses', icon: Lightbulb },
    { title: 'Projects', icon: FolderOpen },
  ];

  const addDissatisfaction = () => {
    setDissatisfactions([...dissatisfactions, '']);
  };

  const updateDissatisfaction = (index: number, value: string) => {
    const updated = [...dissatisfactions];
    updated[index] = value;
    setDissatisfactions(updated);
  };

  const addHypothesis = () => {
    setHypotheses([...hypotheses, '']);
  };

  const updateHypothesis = (index: number, value: string) => {
    const updated = [...hypotheses];
    updated[index] = value;
    setHypotheses(updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', lifeArea: 'work' }]);
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const lifeAreas = ['work', 'personal', 'startup', 'health', 'relationships', 'learning'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Strategy Session</h1>
        <p className="text-slate-600">Transform dissatisfactions into actionable projects</p>
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
              <div key={index} className="space-y-2">
                <Textarea
                  placeholder={`Dissatisfaction ${index + 1}...`}
                  value={dissatisfaction}
                  onChange={(e) => updateDissatisfaction(index, e.target.value)}
                  className="min-h-[80px]"
                />
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
            {hypotheses.map((hypothesis, index) => (
              <div key={index} className="space-y-2">
                <Textarea
                  placeholder={`Hypothesis ${index + 1}: If I do X, then Y will improve because...`}
                  value={hypothesis}
                  onChange={(e) => updateHypothesis(index, e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            ))}
            <Button onClick={addHypothesis} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Hypothesis
            </Button>
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
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-slate-700">Project {index + 1}</span>
                  <select
                    value={project.lifeArea}
                    onChange={(e) => updateProject(index, 'lifeArea', e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    {lifeAreas.map((area) => (
                      <option key={area} value={area}>
                        {area.charAt(0).toUpperCase() + area.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Badge variant="secondary">{project.lifeArea}</Badge>
                </div>
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
