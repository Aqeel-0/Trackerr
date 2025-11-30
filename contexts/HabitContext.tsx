"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Habit, HabitCompletion, HabitContextType, CheckboxStats, CounterStats } from "@/types/habit";
import { formatDateToString, calculateStreak } from "@/utils/dateUtils";

const HabitContext = createContext<HabitContextType | undefined>(undefined);

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEYS = {
  HABITS: "habit-tracker-habits",
  COMPLETIONS: "habit-tracker-completions",
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
        const storedCompletions = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);

        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
        if (storedCompletions) {
          setCompletions(JSON.parse(storedCompletions));
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
      } catch (error) {
        console.error("Error saving habits to localStorage:", error);
      }
    }
  }, [habits, isLoaded]);

  // Save completions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
      } catch (error) {
        console.error("Error saving completions to localStorage:", error);
      }
    }
  }, [completions, isLoaded]);

  const addHabit = useCallback((habitData: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    setCompletions((prev) => prev.filter((completion) => completion.habitId !== id));
  }, []);

  const toggleCompletion = useCallback((habitId: string, date: string) => {
    setCompletions((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.habitId === habitId && c.date === date
      );

      if (existingIndex >= 0) {
        // Toggle existing completion
        const newCompletions = [...prev];
        newCompletions[existingIndex] = {
          ...newCompletions[existingIndex],
          completed: !newCompletions[existingIndex].completed,
        };
        return newCompletions;
      } else {
        // Add new completion
        return [
          ...prev,
          {
            habitId,
            date,
            completed: true,
          },
        ];
      }
    });
  }, []);

  const setCounter = useCallback((habitId: string, date: string, count: number) => {
    setCompletions((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.habitId === habitId && c.date === date
      );

      if (existingIndex >= 0) {
        // Update existing completion
        const newCompletions = [...prev];
        newCompletions[existingIndex] = {
          ...newCompletions[existingIndex],
          count,
          completed: count > 0,
        };
        return newCompletions;
      } else {
        // Add new completion
        return [
          ...prev,
          {
            habitId,
            date,
            completed: count > 0,
            count,
          },
        ];
      }
    });
  }, []);

  const getCounter = useCallback(
    (habitId: string, date: string): number => {
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      return completion?.count ?? 0;
    },
    [completions]
  );

  const isHabitCompleted = useCallback(
    (habitId: string, date: string): boolean => {
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      return completion?.completed ?? false;
    },
    [completions]
  );

  const getHabitStats = useCallback(
    (habitId: string) => {
      const habitCompletions = completions.filter(
        (c) => c.habitId === habitId && c.completed
      );
      const completionDates = habitCompletions.map((c) => c.date);

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) {
        return {
          totalDays: 0,
          completedDays: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
        };
      }

      const createdDate = new Date(habit.createdAt);
      const today = new Date();
      const totalDays = Math.floor(
        (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      const completedDays = completionDates.length;
      const completionRate = totalDays > 0 ? Math.min((completedDays / totalDays) * 100, 100) : 0;

      const currentStreak = calculateStreak(completionDates, today);

      let longestStreak = 0;
      if (completionDates.length > 0) {
        const sortedDates = [...completionDates].sort();
        let currentStreakCount = 1;
        longestStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const dayDiff = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            currentStreakCount++;
            longestStreak = Math.max(longestStreak, currentStreakCount);
          } else {
            currentStreakCount = 1;
          }
        }
      }

      return {
        totalDays,
        completedDays,
        currentStreak,
        longestStreak,
        completionRate,
      };
    },
    [habits, completions]
  );

  const getCheckboxStats = useCallback(
    (habitId: string): CheckboxStats => {
      const habit = habits.find((h) => h.id === habitId);
      const habitCompletions = completions.filter(
        (c) => c.habitId === habitId && c.completed
      );
      const completionDates = habitCompletions.map((c) => c.date);
      const completionSet = new Set(completionDates);

      const today = new Date();
      const createdDate = habit ? new Date(habit.createdAt) : today;
      const totalDays = Math.max(1, Math.floor(
        (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1);

      const completedDays = completionDates.length;
      const completionRate = totalDays > 0 ? Math.min((completedDays / totalDays) * 100, 100) : 0;
      const currentStreak = calculateStreak(completionDates, today);

      let longestStreak = 0;
      if (completionDates.length > 0) {
        const sortedDates = [...completionDates].sort();
        let streakCount = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const dayDiff = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDiff === 1) {
            streakCount++;
            longestStreak = Math.max(longestStreak, streakCount);
          } else {
            streakCount = 1;
          }
        }
      }

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      const dayTotals = [0, 0, 0, 0, 0, 0, 0];

      const startDate = new Date(createdDate);
      const iterDate = new Date(startDate);
      while (iterDate <= today) {
        const dayOfWeek = iterDate.getDay();
        dayTotals[dayOfWeek]++;
        const dateStr = formatDateToString(iterDate);
        if (completionSet.has(dateStr)) {
          dayCounts[dayOfWeek]++;
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }

      const weeklyBreakdown = dayCounts.map((count, i) => 
        dayTotals[i] > 0 ? Math.round((count / dayTotals[i]) * 100) : 0
      );

      let bestDayIndex = 0;
      let worstDayIndex = 0;
      let bestRate = 0;
      let worstRate = 100;
      weeklyBreakdown.forEach((rate, i) => {
        if (dayTotals[i] > 0) {
          if (rate > bestRate) {
            bestRate = rate;
            bestDayIndex = i;
          }
          if (rate < worstRate) {
            worstRate = rate;
            worstDayIndex = i;
          }
        }
      });

      const monthlyData: { month: string; rate: number }[] = [];
      const monthGroups = new Map<string, { completed: number; total: number }>();
      
      const monthIterDate = new Date(startDate);
      while (monthIterDate <= today) {
        const monthKey = `${monthIterDate.getFullYear()}-${String(monthIterDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthGroups.has(monthKey)) {
          monthGroups.set(monthKey, { completed: 0, total: 0 });
        }
        const group = monthGroups.get(monthKey)!;
        group.total++;
        const dateStr = formatDateToString(monthIterDate);
        if (completionSet.has(dateStr)) {
          group.completed++;
        }
        monthIterDate.setDate(monthIterDate.getDate() + 1);
      }

      monthGroups.forEach((data, month) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthlyData.push({
          month: `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`,
          rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        });
      });

      const last30Days: { date: string; completed: boolean }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDateToString(date);
        last30Days.push({
          date: dateStr,
          completed: completionSet.has(dateStr)
        });
      }

      return {
        totalDays,
        completedDays,
        currentStreak,
        longestStreak,
        completionRate,
        weeklyBreakdown,
        bestDay: { day: dayNames[bestDayIndex], rate: bestRate },
        worstDay: { day: dayNames[worstDayIndex], rate: worstRate },
        monthlyData,
        last30Days
      };
    },
    [habits, completions]
  );

  const getCounterStats = useCallback(
    (habitId: string): CounterStats => {
      const habit = habits.find((h) => h.id === habitId);
      const habitCompletions = completions.filter((c) => c.habitId === habitId);

      const today = new Date();
      const createdDate = habit ? new Date(habit.createdAt) : today;

      const dailyData: { date: string; count: number }[] = [];
      const dateCountMap = new Map<string, number>();

      habitCompletions.forEach((c) => {
        dateCountMap.set(c.date, c.count || 0);
      });

      const iterDate = new Date(createdDate);
      while (iterDate <= today) {
        const dateStr = formatDateToString(iterDate);
        dailyData.push({
          date: dateStr,
          count: dateCountMap.get(dateStr) || 0
        });
        iterDate.setDate(iterDate.getDate() + 1);
      }

      const totalCount = dailyData.reduce((sum, d) => sum + d.count, 0);
      const daysWithData = dailyData.filter(d => d.count > 0).length;
      const totalDays = dailyData.length;
      const dailyAverage = totalDays > 0 ? totalCount / totalDays : 0;

      let peakDay = { date: '', count: 0 };
      dailyData.forEach((d) => {
        if (d.count > peakDay.count) {
          peakDay = { date: d.date, count: d.count };
        }
      });

      const weeklyData: { week: string; count: number }[] = [];
      const weekGroups = new Map<string, number>();
      
      dailyData.forEach((d) => {
        const date = new Date(d.date);
        const weekStart = new Date(date);
        const dayOfWeek = date.getDay();
        weekStart.setDate(date.getDate() - dayOfWeek);
        const weekKey = formatDateToString(weekStart);
        weekGroups.set(weekKey, (weekGroups.get(weekKey) || 0) + d.count);
      });

      const sortedWeeks = Array.from(weekGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      sortedWeeks.forEach(([weekStart, count]) => {
        const date = new Date(weekStart);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        weeklyData.push({
          week: `${monthNames[date.getMonth()]} ${date.getDate()}`,
          count
        });
      });

      let peakWeek = { weekStart: '', count: 0 };
      weekGroups.forEach((count, weekStart) => {
        if (count > peakWeek.count) {
          peakWeek = { weekStart, count };
        }
      });

      const weeklyAverage = weeklyData.length > 0 ? totalCount / weeklyData.length : 0;

      const monthGroups = new Map<string, number>();
      dailyData.forEach((d) => {
        const date = new Date(d.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthGroups.set(monthKey, (monthGroups.get(monthKey) || 0) + d.count);
      });
      const monthlyAverage = monthGroups.size > 0 ? totalCount / monthGroups.size : 0;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyBreakdown = [0, 0, 0, 0, 0, 0, 0];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];

      dailyData.forEach((d) => {
        const date = new Date(d.date);
        const dayOfWeek = date.getDay();
        weeklyBreakdown[dayOfWeek] += d.count;
        dayCounts[dayOfWeek]++;
      });

      const avgByDay = weeklyBreakdown.map((total, i) => 
        dayCounts[i] > 0 ? total / dayCounts[i] : 0
      );

      let currentStreak = 0;
      for (let i = dailyData.length - 1; i >= 0; i--) {
        if (dailyData[i].count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      let longestStreak = 0;
      let tempStreak = 0;
      dailyData.forEach((d) => {
        if (d.count > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

      let trend: "up" | "down" | "stable" = "stable";
      let trendPercentage = 0;

      if (weeklyData.length >= 2) {
        const recentWeeks = weeklyData.slice(-4);
        if (recentWeeks.length >= 2) {
          const firstHalf = recentWeeks.slice(0, Math.floor(recentWeeks.length / 2));
          const secondHalf = recentWeeks.slice(Math.floor(recentWeeks.length / 2));
          
          const firstAvg = firstHalf.reduce((s, w) => s + w.count, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((s, w) => s + w.count, 0) / secondHalf.length;
          
          if (firstAvg > 0) {
            trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
            if (trendPercentage > 5) trend = "up";
            else if (trendPercentage < -5) trend = "down";
          }
        }
      }

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthData: { date: string; count: number }[] = [];
      const tempDate = new Date(firstOfMonth);
      
      while (tempDate <= now) {
        const dateStr = formatDateToString(tempDate);
        const existing = dailyData.find(d => d.date === dateStr);
        currentMonthData.push({
          date: dateStr,
          count: existing ? existing.count : 0
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }

      return {
        totalCount,
        dailyAverage,
        weeklyAverage,
        monthlyAverage,
        peakDay,
        peakWeek,
        currentStreak,
        longestStreak,
        trend,
        trendPercentage: Math.abs(trendPercentage),
        weeklyBreakdown: avgByDay,
        dailyData: currentMonthData,
        weeklyData: weeklyData.slice(-12)
      };
    },
    [habits, completions]
  );

  const reorderHabits = useCallback((newOrder: Habit[]) => {
    setHabits(newOrder);
  }, []);

  const value: HabitContextType = {
    habits,
    completions,
    addHabit,
    deleteHabit,
    toggleCompletion,
    setCounter,
    getCounter,
    isHabitCompleted,
    getHabitStats,
    getCheckboxStats,
    getCounterStats,
    reorderHabits,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}
