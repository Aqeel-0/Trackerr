export type TrackingType = "checkbox" | "counter";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  trackingType: TrackingType;
  createdAt: string;
  updatedAt?: string;
  targetCount?: number;
  unit?: string;
  displayOrder: number;
  category?: string;
}

export interface HabitCompletion {
  id?: string;
  habitId: string;
  user_id: string;
  date: string;
  completed: boolean;
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export interface CheckboxStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  weeklyBreakdown: number[];
  bestDay: { day: string; rate: number };
  worstDay: { day: string; rate: number };
  monthlyData: { month: string; rate: number }[];
  last30Days: { date: string; completed: boolean }[];
}

export interface CounterStats {
  totalCount: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  peakDay: { date: string; count: number };
  peakWeek: { weekStart: string; count: number };
  currentStreak: number;
  longestStreak: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  weeklyBreakdown: number[];
  dailyData: { date: string; count: number }[];
  weeklyData: { week: string; count: number }[];
}

export interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "user_id" | "displayOrder">) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  setCounter: (habitId: string, date: string, count: number) => Promise<void>;
  getCounter: (habitId: string, date: string) => number;
  isHabitCompleted: (habitId: string, date: string) => boolean;
  getHabitStats: (habitId: string) => {
    totalDays: number;
    completedDays: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
  getCheckboxStats: (habitId: string) => CheckboxStats;
  getCounterStats: (habitId: string) => CounterStats;
  reorderHabits: (newOrder: Habit[]) => Promise<void>;
}
