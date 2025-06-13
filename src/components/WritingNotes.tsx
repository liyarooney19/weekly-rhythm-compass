
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Archive, Link, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: number;
  topic: string;
  content: string;
  timestamp: string;
  status: 'active' | 'ready-for-cleanup' | 'archived';
  linkedProject?: string;
}

export const WritingNotes = () => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [newNote, setNewNote] = useState({ topic: '', content: '', customTopic: '' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const { toast } = useToast();

  const topics = ['productivity', 'technology', 'personal', 'ideas', 'quotes'];

  useEffect(() => {
    loadNotes();
    loadProjects();
  }, []);

  const loadNotes = () => {
    const saved = localStorage.getItem('writingNotes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  };

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('writingNotes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    const finalTopic = newNote.customTopic.trim() || newNote.topic;
    
    if (!finalTopic || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both topic and content",
        variant: "destructive"
      });
      return;
    }

    const note: Note = {
      id: Date.now(),
      topic: finalTopic,
      content: newNote.content,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    const updatedNotes = [...notes, note];
    saveNotes(updatedNotes);
    
    setNewNote({ topic: '', content: '', customTopic: '' });
    
    toast({
      title: "Success",
      description: "Note added successfully"
    });
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
  };

  const saveEdit = () => {
    if (!editingNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === editingNote.id ? editingNote : note
    );
    saveNotes(updatedNotes);
    setEditingNote(null);
    
    toast({
      title: "Success",
      description: "Note updated successfully"
    });
  };

  const linkToProject = (noteId: number, projectName: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, linkedProject: projectName } : note
    );
    saveNotes(updatedNotes);
    
    toast({
      title: "Success",
      description: "Note linked to project"
    });
  };

  const archiveNote = (noteId: number) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, status: 'archived' as const } : note
    );
    saveNotes(updatedNotes);
    
    toast({
      title: "Success",
      description: "Note archived"
    });
  };

  const deleteNote = (noteId: number) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    toast({
      title: "Success",
      description: "Note deleted"
    });
  };

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
                value={newNote.customTopic}
                onChange={(e) => setNewNote({...newNote, customTopic: e.target.value})}
                className="flex-1"
              />
            </div>
            <Textarea
              placeholder="Write your thoughts..."
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="min-h-[100px]"
            />
            <Button onClick={addNote}>Add Note</Button>
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

      {/* Edit Modal */}
      {editingNote && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Edit Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={editingNote.topic}
              onChange={(e) => setEditingNote({...editingNote, topic: e.target.value})}
              placeholder="Topic"
            />
            <Textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={saveEdit}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                <span className="text-sm text-slate-500">
                  {new Date(note.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-slate-700 mb-4">{note.content}</p>
              
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => editNote(note)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Select onValueChange={(value) => linkToProject(note.id, value)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Link to Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button size="sm" variant="outline" onClick={() => archiveNote(note.id)}>
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteNote(note.id)}>
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
              <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
              <div className="text-sm text-slate-600">Total Notes</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {notes.filter(n => n.status === 'ready-for-cleanup').length}
              </div>
              <div className="text-sm text-slate-600">Ready for Cleanup</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {notes.filter(n => n.linkedProject).length}
              </div>
              <div className="text-sm text-slate-600">Linked to Projects</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-slate-600">
                {notes.filter(n => n.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Active Notes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
