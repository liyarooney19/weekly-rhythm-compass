
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Target } from 'lucide-react';

export const WeeklyPlanning = () => {
  const [tasks, setTasks] = useState([
    { id: 1, type: 'project', title: 'Complete website redesign', estimatedHours: 8, timeType: 'invested', project: 'Website Redesign' },
    { id: 2, type: 'project', title: 'Client presentation prep', estimatedHours: 4, timeType: 'invested', project: 'Client Work' },
    { id: 3, type: 'personal', title: 'Weekly grocery shopping', estimatedHours: 2, timeType: 'spent' },
  ]);

  const [newTask, setNewTask] = useState({ title: '', estimatedHours: 1, timeType: 'invested', project: '' });

  const addTask = () => {
    if (newTask.title) {
      setTasks([...tasks, { 
        id: Date.now(), 
        type: newTask.project ? 'project' : 'personal',
        title: newTask.title, 
        estimatedHours: newTask.estimatedHours, 
        timeType: newTask.timeType,
        project: newTask.project
      }]);
      setNewTask({ title: '', estimatedHours: 1, timeType: 'invested', project: '' });
    }
  };

  const totalPlannedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const investedHours = tasks.filter(task => task.timeType === 'invested').reduce((sum, task) => sum + task.estimatedHours, 0);
  const spentHours = tasks.filter(task => task.timeType === 'spent').reduce((sum, task) => sum + task.estimatedHours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Planning</h1>
        <p className="text-slate-600">Plan your week based on strategy session outcomes</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <CardTitle>Add Weekly Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              onChange={(e) => setNewTask({ ...newTask, timeType: e.target.value })}
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
          </div>
          <Button onClick={addTask} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
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
                  <div>
                    <h3 className="font-medium text-slate-800">{task.title}</h3>
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
