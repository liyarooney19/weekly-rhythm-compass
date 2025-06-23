
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Share2, Trash2, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReadingItem {
  id: number;
  title: string;
  type: 'book' | 'podcast' | 'article' | 'blog';
  category: string;
  status: 'not-started' | 'in-progress' | 'read';
  dateAdded: string;
  dateCompleted?: string;
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
            status: 'in-progress',
            dateAdded: new Date().toISOString()
          },
          { 
            id: 2,
            title: 'The Tim Ferriss Show', 
            type: 'podcast', 
            category: 'business', 
            status: 'read',
            dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            dateCompleted: new Date().toISOString()
          },
          { 
            id: 3,
            title: 'React Patterns', 
            type: 'article', 
            category: 'technology', 
            status: 'in-progress',
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
      status: 'not-started',
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

  const updateItemStatus = (id: number, newStatus: 'in-progress' | 'read') => {
    const updatedItems = readingItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, status: newStatus };
        if (newStatus === 'read' && !item.dateCompleted) {
          updatedItem.dateCompleted = new Date().toISOString();
        }
        return updatedItem;
      }
      return item;
    });
    
    setReadingItems(updatedItems);
    localStorage.setItem('readingItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Status Updated",
      description: `Marked as ${newStatus === 'read' ? 'read' : 'in progress'}`
    });
  };

  const deleteReadingItem = (id: number) => {
    const updatedItems = readingItems.filter(item => item.id !== id);
    setReadingItems(updatedItems);
    localStorage.setItem('readingItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Item Deleted",
      description: "Reading item has been removed"
    });
  };

  const currentlyReading = readingItems.filter(item => item.status === 'not-started' || item.status === 'in-progress');
  const completedItems = readingItems.filter(item => item.status === 'read');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'in-progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      default:
        return null;
    }
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
          {currentlyReading.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg mb-2">No reading items yet</p>
              <p className="text-sm">Add your first book, podcast, or article above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentlyReading.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {item.status === 'not-started' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemStatus(item.id, 'in-progress')}
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-4 w-4" />
                          Start Reading
                        </Button>
                      )}
                      {item.status === 'in-progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemStatus(item.id, 'read')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReadingItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read Books */}
      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Read Books ({completedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedItems.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-700">{item.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.dateCompleted && (
                        <p className="text-xs text-slate-500 mt-2">
                          Completed: {new Date(item.dateCompleted).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReadingItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
