
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Plus, Calendar, Share2 } from 'lucide-react';

export const ReadingTracker = () => {
  const [newItem, setNewItem] = useState({ title: '', type: 'book', category: 'productivity' });
  
  const categories = ['productivity', 'fiction', 'business', 'technology', 'health', 'philosophy'];
  const types = ['book', 'podcast', 'article', 'blog'];

  // Mock reading data
  const currentReading = [
    { 
      title: 'Atomic Habits', 
      type: 'book', 
      category: 'productivity', 
      progress: 65,
      weeklyGoal: 50,
      timeSpent: '3.2h'
    },
    { 
      title: 'The Tim Ferriss Show', 
      type: 'podcast', 
      category: 'business', 
      progress: 100,
      weeklyGoal: 100,
      timeSpent: '2.1h'
    },
    { 
      title: 'React Patterns', 
      type: 'article', 
      category: 'technology', 
      progress: 80,
      weeklyGoal: 100,
      timeSpent: '1.5h'
    },
  ];

  const weeklyPlan = [
    { day: 'Monday', planned: 'Atomic Habits - Chapter 3', completed: true },
    { day: 'Tuesday', planned: 'Tech podcast + 2 articles', completed: true },
    { day: 'Wednesday', planned: 'Continue Atomic Habits', completed: false },
    { day: 'Thursday', planned: 'Philosophy blog posts', completed: false },
    { day: 'Friday', planned: 'Weekly review + new book', completed: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Reading Tracker</h1>
          <p className="text-slate-600">Books, podcasts, and articles with weekly planning</p>
        </div>
        <Button className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Reading List
        </Button>
      </div>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Reading Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Title..."
              value={newItem.title}
              onChange={(e) => setNewItem({...newItem, title: e.target.value})}
            />
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({...newItem, type: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <Button>Add Item</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Reading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Currently Reading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentReading.map((item, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{item.timeSpent}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <div className="text-xs text-slate-500">
                    Weekly goal: {item.weeklyGoal}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Reading Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Reading Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyPlan.map((day, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-sm text-slate-600">{day.planned}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${day.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reading by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category} className="text-center p-4 border border-slate-200 rounded-lg">
                <div className="text-lg font-bold text-blue-600">3</div>
                <div className="text-sm text-slate-600 capitalize">{category}</div>
                <div className="text-xs text-slate-500 mt-1">12.5h this week</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
