
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Play, Pause, Square, Link, FileText, FolderOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMemo {
  id: number;
  title: string;
  duration: string;
  timestamp: string;
  transcription: string;
  linkedTo?: { type: 'project' | 'note'; name: string; id: number };
  tags: string[];
}

export const VoiceMemos = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceMemos, setVoiceMemos] = useState<VoiceMemo[]>([]);
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [newMemoTranscription, setNewMemoTranscription] = useState('');
  const [newMemoTags, setNewMemoTags] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadVoiceMemos();
    loadProjects();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadVoiceMemos = () => {
    const saved = localStorage.getItem('voiceMemos');
    if (saved) {
      try {
        setVoiceMemos(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading voice memos:', error);
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

  const saveVoiceMemos = (memos: VoiceMemo[]) => {
    setVoiceMemos(memos);
    localStorage.setItem('voiceMemos', JSON.stringify(memos));
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordingTime > 0) {
      // Show form to save memo
      setNewMemoTitle(`Voice memo ${new Date().toLocaleString()}`);
      setNewMemoTranscription('');
      setNewMemoTags('');
    }
  };

  const saveMemo = () => {
    if (!newMemoTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the memo",
        variant: "destructive"
      });
      return;
    }

    const memo: VoiceMemo = {
      id: Date.now(),
      title: newMemoTitle,
      duration: formatRecordingTime(recordingTime),
      timestamp: new Date().toISOString(),
      transcription: newMemoTranscription,
      tags: newMemoTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const updatedMemos = [...voiceMemos, memo];
    saveVoiceMemos(updatedMemos);
    
    setNewMemoTitle('');
    setNewMemoTranscription('');
    setNewMemoTags('');
    setRecordingTime(0);
    
    toast({
      title: "Success",
      description: "Voice memo saved successfully"
    });
  };

  const linkToProject = (memoId: number, projectId: string, projectName: string) => {
    const updatedMemos = voiceMemos.map(memo => 
      memo.id === memoId 
        ? { ...memo, linkedTo: { type: 'project' as const, name: projectName, id: parseInt(projectId) } }
        : memo
    );
    saveVoiceMemos(updatedMemos);
    
    toast({
      title: "Success",
      description: "Memo linked to project"
    });
  };

  const convertToNote = (memo: VoiceMemo) => {
    const notes = JSON.parse(localStorage.getItem('writingNotes') || '[]');
    const newNote = {
      id: Date.now(),
      topic: 'voice-memo',
      content: `${memo.title}\n\n${memo.transcription}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    
    notes.push(newNote);
    localStorage.setItem('writingNotes', JSON.stringify(notes));
    
    toast({
      title: "Success",
      description: "Voice memo converted to note"
    });
  };

  const deleteMemo = (memoId: number) => {
    const updatedMemos = voiceMemos.filter(memo => memo.id !== memoId);
    saveVoiceMemos(updatedMemos);
    
    toast({
      title: "Success",
      description: "Voice memo deleted"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Voice Memos</h1>
        <p className="text-slate-600">Capture ideas through voice, link to notes and projects</p>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-slate-800">
              {formatRecordingTime(recordingTime)}
            </div>
            
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    onClick={stopRecording}
                    variant="outline"
                    className="rounded-full w-16 h-16"
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-red-500 animate-pulse rounded"></div>
                  <div className="w-2 h-6 bg-red-400 animate-pulse rounded" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-10 bg-red-500 animate-pulse rounded" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-4 bg-red-400 animate-pulse rounded" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save New Memo Form */}
      {recordingTime > 0 && !isRecording && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Save Voice Memo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Memo title..."
              value={newMemoTitle}
              onChange={(e) => setNewMemoTitle(e.target.value)}
            />
            <Input
              placeholder="Transcription (optional)..."
              value={newMemoTranscription}
              onChange={(e) => setNewMemoTranscription(e.target.value)}
            />
            <Input
              placeholder="Tags (comma separated)..."
              value={newMemoTags}
              onChange={(e) => setNewMemoTags(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={saveMemo}>Save Memo</Button>
              <Button variant="outline" onClick={() => setRecordingTime(0)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Memos List */}
      <div className="space-y-4">
        {voiceMemos.map((memo) => (
          <Card key={memo.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium mb-1">{memo.title}</h3>
                  <div className="flex gap-2 mb-2">
                    {memo.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-600">{memo.duration}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(memo.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {memo.linkedTo && (
                <div className="mb-3">
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    {memo.linkedTo.type === 'project' ? (
                      <FolderOpen className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    Linked to: {memo.linkedTo.name}
                  </Badge>
                </div>
              )}

              {memo.transcription && (
                <div className="bg-slate-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-slate-700 italic">"{memo.transcription}"</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
                
                <Select onValueChange={(value) => {
                  const project = projects.find(p => p.id.toString() === value);
                  if (project) linkToProject(memo.id, value, project.name);
                }}>
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Link to Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button size="sm" variant="outline" onClick={() => convertToNote(memo)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Convert to Note
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => deleteMemo(memo.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Memos Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{voiceMemos.length}</div>
              <div className="text-sm text-slate-600">Total Memos</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {voiceMemos.filter(m => m.linkedTo).length}
              </div>
              <div className="text-sm text-slate-600">Linked Items</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {voiceMemos.filter(m => m.timestamp.startsWith(new Date().toISOString().split('T')[0])).length}
              </div>
              <div className="text-sm text-slate-600">Today</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {voiceMemos.filter(m => !m.linkedTo).length}
              </div>
              <div className="text-sm text-slate-600">Unlinked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
