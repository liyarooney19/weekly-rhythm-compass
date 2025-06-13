
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { StrategySession } from '@/components/StrategySession';
import { ProjectsView } from '@/components/ProjectsView';
import { TimeTracker } from '@/components/TimeTracker';
import { ReadingTracker } from '@/components/ReadingTracker';
import { WritingNotes } from '@/components/WritingNotes';
import { LeisureTracker } from '@/components/LeisureTracker';
import { WeeklyPlanning } from '@/components/WeeklyPlanning';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'strategy':
        return <StrategySession setActiveView={setActiveView} />;
      case 'projects':
        return <ProjectsView />;
      case 'timer':
        return <TimeTracker />;
      case 'reading':
        return <ReadingTracker />;
      case 'notes':
        return <WritingNotes />;
      case 'leisure':
        return <LeisureTracker />;
      case 'planning':
        return <WeeklyPlanning />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      <main className="ml-64 p-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default Index;
