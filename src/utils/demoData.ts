
export interface Project {
  id: string;
  name: string;
  lifeArea: string;
  status: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export interface TimeLog {
  id: string;
  task: string;
  duration: number;
  type: 'invested' | 'spent';
  timestamp: string;
  project?: string;
  taskId?: string;
}

export interface ReadingItem {
  id: number;
  title: string;
  type: 'book' | 'podcast' | 'article' | 'blog';
  category: string;
  status: 'not-started' | 'in-progress' | 'read';
  dateAdded: string;
  dateCompleted?: string;
}

export const generateDemoProjects = (): Project[] => [
  {
    id: 'demo-1',
    name: 'Mobile App Development',
    lifeArea: 'Work / Career',
    status: 'active',
    tasks: [
      { id: 'task-1', name: 'Design user interface mockups', completed: true },
      { id: 'task-2', name: 'Implement authentication system', completed: true },
      { id: 'task-3', name: 'Build core features', completed: false },
      { id: 'task-4', name: 'Testing and debugging', completed: false },
    ]
  },
  {
    id: 'demo-2',
    name: 'Morning Workout Routine',
    lifeArea: 'Health & Routines',
    status: 'active',
    tasks: [
      { id: 'task-5', name: 'Plan weekly workout schedule', completed: true },
      { id: 'task-6', name: 'Buy gym equipment', completed: true },
      { id: 'task-7', name: 'Complete 5 morning workouts', completed: false },
    ]
  },
  {
    id: 'demo-3',
    name: 'Learn Spanish',
    lifeArea: 'Personal Growth',
    status: 'active',
    tasks: [
      { id: 'task-8', name: 'Download language learning app', completed: true },
      { id: 'task-9', name: 'Complete beginner course', completed: false },
      { id: 'task-10', name: 'Practice speaking with native speaker', completed: false },
    ]
  },
  {
    id: 'demo-4',
    name: 'Photography Portfolio',
    lifeArea: 'Creative Projects',
    status: 'active',
    tasks: [
      { id: 'task-11', name: 'Take 50 portrait photos', completed: true },
      { id: 'task-12', name: 'Edit best 20 photos', completed: false },
      { id: 'task-13', name: 'Create online portfolio website', completed: false },
    ]
  }
];

export const generateDemoTimeLogs = (): TimeLog[] => {
  const now = new Date();
  const logs: TimeLog[] = [];
  
  // Generate logs for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add multiple logs per day
    logs.push(
      {
        id: `demo-log-${i}-1`,
        task: 'Design user interface mockups',
        duration: 90,
        type: 'invested',
        timestamp: new Date(date.setHours(9, 0)).toISOString(),
        project: 'Mobile App Development'
      },
      {
        id: `demo-log-${i}-2`,
        task: 'Morning workout session',
        duration: 45,
        type: 'invested',
        timestamp: new Date(date.setHours(7, 30)).toISOString(),
        project: 'Morning Workout Routine'
      },
      {
        id: `demo-log-${i}-3`,
        task: 'Spanish vocabulary practice',
        duration: 30,
        type: 'invested',
        timestamp: new Date(date.setHours(19, 0)).toISOString(),
        project: 'Learn Spanish'
      },
      {
        id: `demo-log-${i}-4`,
        task: 'Social media browsing',
        duration: 25,
        type: 'spent',
        timestamp: new Date(date.setHours(12, 30)).toISOString()
      }
    );
  }
  
  return logs;
};

export const generateDemoReadingItems = (): ReadingItem[] => [
  {
    id: 1,
    title: 'Atomic Habits',
    type: 'book',
    category: 'productivity',
    status: 'read',
    dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'The Tim Ferriss Show',
    type: 'podcast',
    category: 'business',
    status: 'in-progress',
    dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'Deep Work',
    type: 'book',
    category: 'productivity',
    status: 'read',
    dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    dateCompleted: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'React Performance Patterns',
    type: 'article',
    category: 'technology',
    status: 'in-progress',
    dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: 'The Lean Startup',
    type: 'book',
    category: 'business',
    status: 'not-started',
    dateAdded: new Date().toISOString()
  }
];

export const generateDemoStrategySession = () => ({
  strategyDay: 'Sunday',
  strategySessionHistory: [
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
      completedItems: [
        'Review last week\'s progress',
        'Plan project priorities',
        'Schedule important tasks'
      ],
      agendaItems: []
    }
  ],
  currentStrategySession: null
});
