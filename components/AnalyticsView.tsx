"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { formatDateToString, getMonthWeeks } from "@/utils/dateUtils";

// Ultra-thin Line Graph with hover tooltips
function ThinLineGraph({ data, color = "#4f46e5", label = "Value" }: { data: { value: number; label: string }[]; color?: string; label?: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min || 1;

  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 100,
    y: 100 - ((value - min) / range) * 100,
    value,
    label: data[index].label
  }));

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full h-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-6 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.3" className="text-gray-400 dark:text-gray-600" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.3" className="text-gray-400 dark:text-gray-600" />

        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-gray-300 dark:text-gray-700"
          />
        ))}

        {/* Ultra-thin data line */}
        <polyline
          points={pathPoints}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Invisible hover areas */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Visible points only on hover */}
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill={hoveredIndex === index ? color : "transparent"}
            className="transition-all pointer-events-none"
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded text-sm font-medium shadow-lg pointer-events-none"
          style={{
            left: `${points[hoveredIndex].x}%`,
            top: `${points[hoveredIndex].y}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div>{points[hoveredIndex].label}</div>
          <div className="font-bold">{label}: {points[hoveredIndex].value.toFixed(1)}</div>
        </div>
      )}

      {/* Axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 -ml-8 py-6">
        <span>{max}</span>
        <span>{Math.round(max / 2)}</span>
        <span>0</span>
      </div>
    </div>
  );
}

// Simple Bar Chart
function SimpleBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);

  return (
    <div className="w-full h-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-4">
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((value, index) => {
          const height = max > 0 ? (value / max) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative flex items-end" style={{ height: '85%' }}>
                <div
                  className="w-full bg-indigo-500 dark:bg-indigo-600"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{labels[index]}</div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const { habits, isHabitCompleted, getCounter, getHabitStats } = useHabits();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    setToday(new Date());
  }, []);

  if (!currentDate || !today) {
    return null;
  }

  const monthWeeks = getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth());
  const allDates = monthWeeks.flat().filter(d => d <= today);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Data Yet</h3>
        <p className="text-gray-600 dark:text-gray-400">Start tracking habits to see analytics</p>
      </div>
    );
  }

  // Calculate overall daily progress
  const overallDailyProgress = allDates.map(date => {
    const dateStr = formatDateToString(date);
    const completedCount = habits.filter(h => {
      if (h.trackingType === 'checkbox') {
        return isHabitCompleted(h.id, dateStr);
      } else {
        return getCounter(h.id, dateStr) > 0;
      }
    }).length;
    const percentage = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
    return {
      value: percentage,
      label: dateStr
    };
  });

  const totalCompletions = habits.reduce((sum, habit) => {
    const stats = getHabitStats(habit.id);
    return sum + stats.completedDays;
  }, 0);

  const avgCompletionRate = habits.length > 0
    ? Math.round(
      habits.reduce((sum, h) => {
        const stats = getHabitStats(h.id);
        return sum + stats.completionRate;
      }, 0) / habits.length
    )
    : 0;

  const longestStreak = Math.max(...habits.map(h => getHabitStats(h.id).longestStreak), 0);

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Performance metrics and trends</p>
        </div>

        {/* Overall Progress Graph */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overall Daily Progress</h3>
          <ThinLineGraph data={overallDailyProgress} color="#4f46e5" label="Completion" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Shows the percentage of habits completed each day
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Completion</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{avgCompletionRate}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completed</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalCompletions}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Streak</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{longestStreak} days</div>
          </div>
        </div>

        {/* Per Habit - Counter habits only */}
        {habits.filter(h => h.trackingType === "counter").map(habit => {
          const stats = getHabitStats(habit.id);

          // Daily counter data
          const dailyData = allDates.map(date => ({
            value: getCounter(habit.id, formatDateToString(date)),
            label: formatDateToString(date)
          }));

          const totalCount = dailyData.reduce((sum, d) => sum + d.value, 0);
          const avgPerDay = allDates.length > 0 ? (totalCount / allDates.length).toFixed(1) : '0';
          const maxCount = Math.max(...dailyData.map(d => d.value), 1);

          const weeklyData = monthWeeks.map(week => {
            const weekDates = week.filter(d => d <= today);
            return weekDates.reduce((sum, d) =>
              sum + getCounter(habit.id, formatDateToString(d)), 0
            );
          });

          const weekLabels = monthWeeks.map((_, idx) => `W${idx + 1}`);

          return (
            <div key={habit.id} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{habit.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{habit.name}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Counter</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerDay}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Peak Day</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{maxCount}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Daily Volume</h4>
                  <ThinLineGraph data={dailyData} color="#10b981" label="Count" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Weekly Total</h4>
                  <SimpleBarChart data={weeklyData} labels={weekLabels} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
