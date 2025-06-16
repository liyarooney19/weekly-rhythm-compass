
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, CheckCircle, Plus, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

interface WeeklyReflection {
  wins: string;
  challenges: string;
  learnings: string;
  nextWeekFocus: string;
}

export const WeeklyStrategyHub = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [reflection, setReflection] = useState<WeeklyReflection>({
    wins: '',
    challenges: '',
    learnings: '',
    nextWeekFocus: ''
  });
  const [newGoal, setNewGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editGoalText, setEditGoalText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = () => {
    try {
      // Load goals
      const savedGoals = localStorage.getItem('weeklyGoals');
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }

      // Load reflection
      const savedReflection = localStorage.getItem('weeklyReflection');
      if (savedReflection) {
        const parsed = JSON.parse(savedReflection);
        if (parsed && typeof parsed === 'object') {
          setReflection({
            wins: parsed.wins || '',
            challenges: parsed.challenges || '',
            learnings: parsed.learnings || '',
            nextWeekFocus: parsed.nextWeekFocus || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoals = (updatedGoals: WeeklyGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
  };

  const saveReflection = (updatedReflection: WeeklyReflection) => {
    setReflection(updatedReflection);
    localStorage.setItem('weeklyReflection', JSON.stringify(updatedReflection));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;

    const goal: WeeklyGoal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      category: 'General'
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    setNewGoal('');

    toast({
      title: "Goal Added",
      description: "Your weekly goal has been added"
    });
  };

  const toggleGoal = (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(updatedGoals);
  };

  const startEditGoal = (goal: WeeklyGoal) => {
    setEditingGoal(goal.id);
    setEditGoalText(goal.text);
  };

  const saveEditGoal = () => {
    if (!editGoalText.trim() || !editingGoal) return;

    const updatedGoals = goals.map(goal =>
      goal.id === editingGoal ? { ...goal, text: editGoalText.trim() } : goal
    );
    saveGoals(updatedGoals);
    setEditingGoal(null);
    setEditGoalText('');
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setEditGoalText('');
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
  };

  const getCompletionPercentage = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(goal => goal.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading weekly strategy...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Weekly Strategy Hub</h1>
        <p className="text-slate-600">Set goals, track progress, and reflect on your week</p>
      </div>

      {/* Weekly Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goals</CardTitle>
            <Target className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-slate-500">Total goals set</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.completed).length}</div>
            <p className="text-xs text-slate-500">Goals achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
            <p className="text-xs text-slate-500">Week completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new weekly goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button onClick={addGoal} disabled={!newGoal.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {goals.length > 0 && (
            <div className="space-y-2">
              <Progress value={getCompletionPercentage()} className="w-full" />
              <p className="text-sm text-slate-600">
                {goals.filter(g => g.completed).length} of {goals.length} goals completed
              </p>
            </div>
          )}

          <div className="space-y-2">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="h-4 w-4"
                />
                {editingGoal === goal.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editGoalText}
                      onChange={(e) => setEditGoalText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditGoal()}
                    />
                    <Button size="sm" onClick={saveEditGoal}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditGoal}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className={`flex-1 ${goal.completed ? 'line-through text-slate-500' : ''}`}>
                      {goal.text}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => startEditGoal(goal)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteGoal(goal.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No weekly goals set yet.</p>
              <p className="text-sm">Add your first goal above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Reflection */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">This Week's Wins</label>
            <Textarea
              placeholder="What went well this week?"
              value={reflection.wins}
              onChange={(e) => saveReflection({ ...reflection, wins: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Challenges Faced</label>
            <Textarea
              placeholder="What challenges did you encounter?"
              value={reflection.challenges}
              onChange={(e) => saveReflection({ ...reflection, challenges: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Key Learnings</label>
            <Textarea
              placeholder="What did you learn this week?"
              value={reflection.learnings}
              onChange={(e) => saveReflection({ ...reflection, learnings: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Next Week's Focus</label>
            <Textarea
              placeholder="What will you focus on next week?"
              value={reflection.nextWeekFocus}
              onChange={(e) => saveReflection({ ...reflection, nextWeekFocus: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
