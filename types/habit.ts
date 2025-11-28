export type TrackingType = "checkbox" | "counter";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  trackingType: TrackingType;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  count?: number; // For counter-based habits
}

export interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  setCounter: (habitId: string, date: string, count: number) => void;
  getCounter: (habitId: string, date: string) => number;
  isHabitCompleted: (habitId: string, date: string) => boolean;
  getHabitStats: (habitId: string) => {
    totalDays: number;
    completedDays: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
}
