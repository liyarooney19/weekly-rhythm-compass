
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Plus, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReadingItem {
  id: number;
  title: string;
  type: 'book' | 'podcast' | 'article' | 'blog';
  category: string;
  progress: number;
  weeklyGoal: number;
  timeSpent: string;
  dateAdded: string;
}

export const ReadingTracker = () => {
  const [newItem, setNewItem] = useState({ title: '', type: 'book', category: 'productivity' });
  const [readingItems, setReadingItems] = useState<ReadingItem[]>([]);
  const { toast } = useToast();
  
  const categories = ['productivity', 'fiction', 'business', 'technology', 'health', 'philosophy'];
  const types = ['book', 'podcast', 'article', 'blog'];

  useEffect(() => {
    loadReadingItems();
  }, []);

  const loadReadingItems = () => {
    const saved = localStorage.getItem('readingItems');
    if (saved) {
      try {
        setReadingItems(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading reading items:', error);
        setReadingItems([]);
      }
    } else {
      // Check if this is the first time loading (no data exists)
      // Only show default items if there's no indication of a reset
      const hasBeenReset = localStorage.getItem('strategySession') === null && 
                          localStorage.getItem('projects') === null;
      
      if (!hasBeenReset) {
        // First time user - show default items
        const defaultItems: ReadingItem[] = [
          { 
            id: 1,
            title: 'Atomic Habits', 
            type: 'book', 
            category: 'productivity', 
            progress: 65,
            weeklyGoal: 50,
            timeSpent: '3.2h',
            dateAdded: new Date().toISOString()
          },
          { 
            id: 2,
            title: 'The Tim Ferriss Show', 
            type: 'podcast', 
            category: 'business', 
            progress: 100,
            weeklyGoal: 100,
            timeSpent: '2.1h',
            dateAdded: new Date().toISOString()
          },
          { 
            id: 3,
            title: 'React Patterns', 
            type: 'article', 
            category: 'technology', 
            progress: 80,
            weeklyGoal: 100,
            timeSpent: '1.5h',
            dateAdded: new Date().toISOString()
          },
        ];
        setReadingItems(defaultItems);
        localStorage.setItem('readingItems', JSON.stringify(defaultItems));
      } else {
        // Data has been reset - start with empty list
        setReadingItems([]);
      }
    }
  };

  const addReadingItem = () => {
    if (!newItem.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive"
      });
      return;
    }

    const item: ReadingItem = {
      id: Date.now(),
      title: newItem.title,
      type: newItem.type as 'book' | 'podcast' | 'article' | 'blog',
      category: newItem.category,
      progress: 0,
      weeklyGoal: 50,
      timeSpent: '0h',
      dateAdded: new Date().toISOString()
    };

    const updatedItems = [...readingItems, item];
    setReadingItems(updatedItems);
    localStorage.setItem('readingItems', JSON.stringify(updatedItems));
    
    setNewItem({ title: '', type: 'book', category: 'productivity' });
    
    toast({
      title: "Success",
      description: "Reading item added successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Reading Tracker</h1>
          <p className="text-slate-600">Books, podcasts, and articles tracking</p>
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
            <Button onClick={addReadingItem}>Add Item</Button>
          </div>
        </CardContent>
      </Card>

      {/* Currently Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Currently Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readingItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg mb-2">No reading items yet</p>
              <p className="text-sm">Add your first book, podcast, or article above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readingItems.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reading by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const categoryCount = readingItems.filter(item => item.category === category).length;
              return (
                <div key={category} className="text-center p-4 border border-slate-200 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{categoryCount}</div>
                  <div className="text-sm text-slate-600 capitalize">{category}</div>
                  <div className="text-xs text-slate-500 mt-1">items</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
