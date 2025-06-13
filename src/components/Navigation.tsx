
import React from 'react';
import { 
  Home, 
  Target, 
  FolderOpen, 
  Timer, 
  BookOpen, 
  FileText, 
  Calendar,
  Gamepad2
} from 'lucide-react';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'strategy', label: 'Strategy Session', icon: Target },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'timer', label: 'Time Tracker', icon: Timer },
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'leisure', label: 'Leisure', icon: Gamepad2 },
    { id: 'planning', label: 'Weekly Planning', icon: Calendar },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Self-Strategy</h1>
        <p className="text-sm text-slate-500">Design your week through reflection</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
