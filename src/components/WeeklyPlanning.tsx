
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Clock, CheckCircle, Plus } from 'lucide-react';

export const WeeklyPlanning = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Mock weekly plan data
  const weeklyPlan = {
    Monday: [
      { id: 1, type: 'project', title: 'Fitness App - UI Design', project: 'Fitness App', estimatedHours: 2, timeType: 'invested' },
      { id: 2, type: 'reading', title: 'Atomic Habits - Chapter 3', estimatedHours: 0.5, timeType: 'invested' },
      { id: 3, type: 'leisure', title: 'Swimming', estimatedHours: 1, timeType: 'invested' },
    ],
    Tuesday: [
      { id: 4, type: 'project', title: 'React Learning - Custom Hooks', project: 'Learn React', estimatedHours: 3, timeType: 'invested' },
      { id: 5, type: 'notes', title: 'Review and clean up notes', estimatedHours: 1, timeType: 'invested' },
    ],
    Wednesday: [
      { id: 6, type: 'project', title: 'Blog Writing - Draft Article', project: 'Blog Writing', estimatedHours: 2, timeType: 'invested' },
      { id: 7, type: 'leisure', title: 'Cooking Experiment', estimatedHours: 1.5, timeType: 'invested' },
    ],
    Thursday: [
      { id: 8, type: 'project', title: 'Fitness App - Backend Work', project: 'Fitness App', estimatedHours: 3, timeType: 'invested' },
      { id: 9, type: 'reading', title: 'Tech Podcast + Articles', estimatedHours: 1, timeType: 'invested' },
    ],
    Friday: [
      { id: 10, type: 'strategy', title: 'Weekly Strategy Session', estimatedHours: 1.5, timeType: 'invested' },
      { id: 11, type: 'project', title: 'Blog Writing - Publish Article', project: 'Blog Writing', estimatedHours: 1, timeType: 'invested' },
    ],
    Saturday: [
      { id: 12, type: 'leisure', title: 'Golf', estimatedHours: 4, timeType: 'invested' },
      { id: 13, type: 'reading', title: 'Fiction Reading', estimatedHours: 2, timeType: 'invested' },
    ],
    Sunday: [
      { id: 14, type: 'planning', title: 'Plan Next Week', estimatedHours: 1, timeType: 'invested' },
      { id: 15, type: 'leisure', title: 'Family Time', estimatedHours: 3, timeType: 'invested' },
    ],
  };

  const getTypeColor = (type: string) => {
    const colors = {
      project: 'bg-blue-100 text-blue-800',
      reading: 'bg-green-100 text-green-800',
      leisure: 'bg-purple-100 text-purple-800',
      notes: 'bg-orange-100 text-orange-800',
      strategy: 'bg-red-100 text-red-800',
      planning: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getTotalHoursForDay = (day: string) => {
    const tasks = weeklyPlan[day as keyof typeof weeklyPlan] || [];
    return tasks.reduce((total, task) => total + task.estimatedHours, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Planning</h1>
          <p className="text-slate-600">Plan your week based on strategy session outcomes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Review Strategy
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayTasks = weeklyPlan[day as keyof typeof weeklyPlan] || [];
              const totalHours = getTotalHoursForDay(day);
              return (
                <div 
                  key={day}
                  className="p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                >
                  <div className="font-medium mb-2">{day}</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{totalHours}h</div>
                  <div className="text-sm text-slate-500 mb-3">{dayTasks.length} tasks</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="text-xs bg-slate-100 p-1 rounded truncate">
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-slate-500">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Detail */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedDay} Detail</span>
              <span className="text-lg font-normal text-slate-600">
                {getTotalHoursForDay(selectedDay)} hours planned
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(weeklyPlan[selectedDay as keyof typeof weeklyPlan] || []).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.project && (
                        <div className="text-sm text-slate-500">Project: {task.project}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(task.type)}>
                      {task.type}
                    </Badge>
                    <span className="font-mono text-sm">{task.estimatedHours}h</span>
                    <Button size="sm" variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      Start Timer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week's Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">Primary Goal</div>
                <div className="text-sm text-slate-600">Complete Fitness App UI and start backend development</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium">Learning Goal</div>
                <div className="text-sm text-slate-600">Master React custom hooks pattern</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium">Wellness Goal</div>
                <div className="text-sm text-slate-600">Maintain 2x swimming + 1x golf schedule</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Projects (Work)</span>
                <span className="font-mono">16h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Learning & Reading</span>
                <span className="font-mono">8h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Leisure Activities</span>
                <span className="font-mono">11.5h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Strategy & Planning</span>
                <span className="font-mono">2.5h</span>
              </div>
              <hr />
              <div className="flex justify-between items-center font-bold">
                <span>Total Planned</span>
                <span className="font-mono">38h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
