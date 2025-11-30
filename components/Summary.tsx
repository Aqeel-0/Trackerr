"use client";

import { useHabits } from "@/contexts/HabitContext";

export default function Summary() {
  const { habits, getHabitStats } = useHabits();

  if (habits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No habits to summarize yet. Start by adding some habits!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
          Habit Statistics
        </h2>

        <div className="space-y-6">
          {habits.map((habit) => {
            const stats = getHabitStats(habit.id);

            return (
              <div
                key={habit.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-all"
              >
                {/* Habit Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {habit.name}
                  </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard
                    label="Completion Rate"
                    value={`${stats.completionRate.toFixed(1)}%`}
                    color={habit.color}
                  />
                  <StatCard
                    label="Total Days"
                    value={stats.totalDays.toString()}
                    color={habit.color}
                  />
                  <StatCard
                    label="Completed"
                    value={stats.completedDays.toString()}
                    color={habit.color}
                  />
                  <StatCard
                    label="Current Streak"
                    value={`${stats.currentStreak} 🔥`}
                    color={habit.color}
                  />
                  <StatCard
                    label="Best Streak"
                    value={`${stats.longestStreak} ⭐`}
                    color={habit.color}
                  />
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{stats.completedDays} / {stats.totalDays} days</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${stats.completionRate}%`,
                        backgroundColor: habit.color,
                      }}
                    />
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mt-4 text-sm">
                  {stats.completionRate >= 80 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <span className="text-xl">🎉</span>
                      <span className="font-medium">Excellent! Keep it up!</span>
                    </div>
                  )}
                  {stats.completionRate >= 50 && stats.completionRate < 80 && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="text-xl">👍</span>
                      <span className="font-medium">Good progress! You&apos;re doing well.</span>
                    </div>
                  )}
                  {stats.completionRate >= 25 && stats.completionRate < 50 && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <span className="text-xl">💪</span>
                      <span className="font-medium">Keep pushing! You can do better.</span>
                    </div>
                  )}
                  {stats.completionRate < 25 && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <span className="text-xl">🎯</span>
                      <span className="font-medium">Time to focus! Stay consistent.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Overall Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {habits.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Habits
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {habits.reduce((sum, habit) => sum + getHabitStats(habit.id).completedDays, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Completions
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {habits.reduce((sum, habit) => sum + getHabitStats(habit.id).currentStreak, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Active Streaks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}
