
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gamepad2, Plus, Calendar, Target } from 'lucide-react';

export const LeisureTracker = () => {
  const [newActivity, setNewActivity] = useState({
    name: '',
    frequency: 'weekly',
    intention: '',
    category: 'exercise'
  });

  const categories = ['exercise', 'creative', 'social', 'outdoor', 'intellectual', 'relaxation'];
  const frequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];

  // Mock leisure activities
  const activities = [
    {
      id: 1,
      name: 'Swimming',
      category: 'exercise',
      frequency: 'weekly',
      intention: 'Improve cardiovascular health and reduce stress',
      targetSessions: 2,
      completedSessions: 1,
      lastSession: '2 days ago',
      totalHours: 4.5
    },
    {
      id: 2,
      name: 'Golf',
      category: 'outdoor',
      frequency: 'bi-weekly',
      intention: 'Social connection and mental relaxation',
      targetSessions: 1,
      completedSessions: 1,
      lastSession: '1 week ago',
      totalHours: 8.0
    },
    {
      id: 3,
      name: 'Reading Fiction',
      category: 'intellectual',
      frequency: 'daily',
      intention: 'Escape and mental stimulation',
      targetSessions: 7,
      completedSessions: 5,
      lastSession: 'Yesterday',
      totalHours: 6.2
    },
    {
      id: 4,
      name: 'Cooking',
      category: 'creative',
      frequency: 'weekly',
      intention: 'Creative expression and mindful practice',
      targetSessions: 3,
      completedSessions: 2,
      lastSession: '3 days ago',
      totalHours: 5.5
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      exercise: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
      outdoor: 'bg-emerald-100 text-emerald-800',
      intellectual: 'bg-orange-100 text-orange-800',
      relaxation: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Leisure Tracker</h1>
        <p className="text-slate-600">Track recurring activities with frequencies and intentions</p>
      </div>

      {/* Add New Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Leisure Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Activity name..."
              value={newActivity.name}
              onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
            />
            <select
              value={newActivity.category}
              onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={newActivity.frequency}
              onChange={(e) => setNewActivity({...newActivity, frequency: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {frequencies.map(frequency => (
                <option key={frequency} value={frequency}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </option>
              ))}
            </select>
            <Button>Add Activity</Button>
          </div>
          <Textarea
            placeholder="What's your intention for this activity? (e.g., stress relief, social connection, skill building...)"
            value={newActivity.intention}
            onChange={(e) => setNewActivity({...newActivity, intention: e.target.value})}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{activity.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCategoryColor(activity.category)}>
                      {activity.category}
                    </Badge>
                    <Badge variant="outline">{activity.frequency}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <div>{activity.totalHours}h total</div>
                  <div>{activity.lastSession}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-700 italic">"{activity.intention}"</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This period progress</span>
                  <span>{activity.completedSessions}/{activity.targetSessions} sessions</span>
                </div>
                <Progress 
                  value={(activity.completedSessions / activity.targetSessions) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Target className="h-4 w-4 mr-1" />
                  Log Session
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Leisure Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="p-3 border border-slate-200 rounded-lg">
                <div className="font-medium text-sm mb-2">{day}</div>
                <div className="space-y-1">
                  {index === 1 && (
                    <div className="text-xs bg-blue-50 text-blue-700 p-1 rounded">Swimming</div>
                  )}
                  {index === 3 && (
                    <div className="text-xs bg-purple-50 text-purple-700 p-1 rounded">Cooking</div>
                  )}
                  {index === 5 && (
                    <div className="text-xs bg-emerald-50 text-emerald-700 p-1 rounded">Golf</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Leisure Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-slate-600">Active Activities</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">24.2h</div>
              <div className="text-sm text-slate-600">Total This Month</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">75%</div>
              <div className="text-sm text-slate-600">Goals Met</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
