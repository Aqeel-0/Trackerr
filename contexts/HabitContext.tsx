"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Habit, HabitCompletion, HabitContextType } from "@/types/habit";
import { formatDateToString, calculateStreak } from "@/utils/dateUtils";

const HabitContext = createContext<HabitContextType | undefined>(undefined);

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
      id: crypto.randomUUID(),
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

      // Calculate total days since habit creation
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
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

      // Calculate current streak
      const currentStreak = calculateStreak(completionDates, today);

      // Calculate longest streak
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
