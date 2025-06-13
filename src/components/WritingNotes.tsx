
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Archive, Link, Trash2, Edit } from 'lucide-react';

export const WritingNotes = () => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [newNote, setNewNote] = useState({ topic: '', content: '' });

  // Mock data
  const topics = ['productivity', 'technology', 'personal', 'ideas', 'quotes'];
  
  const notes = [
    {
      id: 1,
      topic: 'productivity',
      content: 'The key to productivity is not time management, but energy management. Focus on your natural rhythms.',
      timestamp: '2 hours ago',
      status: 'active',
      linkedProject: 'Blog Writing'
    },
    {
      id: 2,
      topic: 'technology',
      content: 'React Server Components seem to be the future of React development. Need to dive deeper into this.',
      timestamp: '1 day ago',
      status: 'ready-for-cleanup',
      linkedProject: null
    },
    {
      id: 3,
      topic: 'ideas',
      content: 'App idea: A tool that connects your calendar with your energy levels to suggest optimal scheduling.',
      timestamp: '3 days ago',
      status: 'active',
      linkedProject: 'Fitness App'
    },
    {
      id: 4,
      topic: 'personal',
      content: 'Reflection: I tend to overcommit on Mondays. Should build in buffer time.',
      timestamp: '1 week ago',
      status: 'archived',
      linkedProject: null
    },
  ];

  const filteredNotes = selectedTopic === 'all' 
    ? notes 
    : notes.filter(note => note.topic === selectedTopic);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready-for-cleanup': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-slate-100 text-slate-600';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Writing Notes</h1>
        <p className="text-slate-600">Capture thoughts and organize them by topic</p>
      </div>

      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                value={newNote.topic}
                onChange={(e) => setNewNote({...newNote, topic: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="">Select topic...</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Or create new topic..."
                className="flex-1"
              />
            </div>
            <Textarea
              placeholder="Write your thoughts..."
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="min-h-[100px]"
            />
            <Button>Add Note</Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter by Topic */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTopic === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedTopic('all')}
        >
          All Notes
        </Button>
        {topics.map(topic => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTopic(topic)}
          >
            {topic.charAt(0).toUpperCase() + topic.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <Badge variant="outline">{note.topic}</Badge>
                  <Badge className={getStatusColor(note.status)}>
                    {note.status.replace('-', ' ')}
                  </Badge>
                  {note.linkedProject && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      {note.linkedProject}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-slate-500">{note.timestamp}</span>
              </div>
              
              <p className="text-slate-700 mb-4">{note.content}</p>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Link className="h-4 w-4 mr-1" />
                  Link to Project
                </Button>
                <Button size="sm" variant="outline">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notes Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-slate-600">Total Notes</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-slate-600">Ready for Cleanup</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-slate-600">Linked to Projects</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-slate-600">8</div>
              <div className="text-sm text-slate-600">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
