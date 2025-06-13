
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Play, Pause, Square, Link, FileText, FolderOpen } from 'lucide-react';

export const VoiceMemos = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Mock voice memos data
  const voiceMemos = [
    {
      id: 1,
      title: 'Project idea for fitness tracking',
      duration: '2:34',
      timestamp: '1 hour ago',
      transcription: 'What if we built an app that tracks not just workouts but energy levels throughout the day...',
      linkedTo: { type: 'project', name: 'Fitness App' },
      tags: ['idea', 'fitness', 'app']
    },
    {
      id: 2,
      title: 'Reflection on productivity',
      duration: '1:45',
      timestamp: '3 hours ago',
      transcription: 'I noticed that I\'m most productive between 9-11 AM. Should structure my day around this...',
      linkedTo: { type: 'note', name: 'Productivity insights' },
      tags: ['reflection', 'productivity']
    },
    {
      id: 3,
      title: 'Reading thoughts on Atomic Habits',
      duration: '3:12',
      timestamp: '1 day ago',
      transcription: 'The concept of habit stacking really resonates with me. Could apply this to my morning routine...',
      linkedTo: null,
      tags: ['reading', 'habits']
    },
  ];

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    // Here you would start actual recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // Here you would stop recording and save the memo
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
                    variant="outline"
                    className="rounded-full w-16 h-16"
                  >
                    <Pause className="h-6 w-6" />
                  </Button>
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
                  <div className="text-xs text-slate-500">{memo.timestamp}</div>
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

              <div className="bg-slate-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-slate-700 italic">"{memo.transcription}"</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
                <Button size="sm" variant="outline">
                  <Link className="h-4 w-4 mr-1" />
                  Link to Project
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-1" />
                  Convert to Note
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
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-slate-600">Total Memos</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-slate-600">Linked Items</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">45min</div>
              <div className="text-sm text-slate-600">This Week</div>
            </div>
            <div className="text-center p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-slate-600">Unlinked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
