"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { formatDateToString } from "@/utils/dateUtils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from "recharts";
import { CheckboxStats, CounterStats, Habit } from "@/types/habit";


function StreakDisplay({ current, longest, color }: { current: number; longest: number; color: string }) {
  return (
    <div className="flex gap-6">
      <div className="text-center">
        <div className="relative">
          <div
            className="text-4xl font-bold"
            style={{ color }}
          >
            {current}
          </div>
          {current > 0 && (
            <span className="absolute -top-1 -right-4 text-2xl animate-bounce">🔥</span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Streak</div>
      </div>
      <div className="w-px bg-gray-200 dark:bg-gray-700" />
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-700 dark:text-gray-300">
          {longest}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
          <span>🏆</span> Best Streak
        </div>
      </div>
    </div>
  );
}


function CurrentWeekChart({ 
  habitId, 
  color, 
  isHabitCompleted 
}: { 
  habitId: string; 
  color: string; 
  isHabitCompleted: (habitId: string, date: string) => boolean;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayOfWeek);
  
  const chartData = days.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateStr = formatDateToString(date);
    const isFuture = date > today;
    const completed = !isFuture && isHabitCompleted(habitId, dateStr);
    return {
      day,
      value: isFuture ? 0 : (completed ? 100 : 0),
      completed,
      isFuture,
      isToday: index === currentDayOfWeek,
    };
  });

  return (
    <div className="flex justify-between gap-2">
      {chartData.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div 
            className={`w-full h-16 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              d.isFuture 
                ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600' 
                : d.completed 
                  ? 'text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            } ${d.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
            style={{ backgroundColor: d.completed ? color : undefined }}
          >
            {d.isFuture ? '—' : d.completed ? '✓' : '✗'}
          </div>
          <span className={`text-xs mt-1 ${d.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}


function FourMonthHeatmap({ 
  habitId, 
  color, 
  isHabitCompleted 
}: { 
  habitId: string; 
  color: string; 
  isHabitCompleted: (habitId: string, date: string) => boolean;
}) {
  const today = new Date();
  const fourMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  
  const months: { name: string; weeks: { date: string; completed: boolean; isFuture: boolean }[][] }[] = [];
  
  for (let m = 0; m < 4; m++) {
    const monthDate = new Date(fourMonthsAgo.getFullYear(), fourMonthsAgo.getMonth() + m, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    
    const weeks: { date: string; completed: boolean; isFuture: boolean }[][] = [];
    let currentWeek: { date: string; completed: boolean; isFuture: boolean }[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      const dateStr = formatDateToString(date);
      const isFuture = date > today;
      currentWeek.push({
        date: dateStr,
        completed: !isFuture && isHabitCompleted(habitId, dateStr),
        isFuture
      });
      if (currentWeek.length === 7 || d === daysInMonth) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    months.push({ name: monthName, weeks });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {months.map((month, mi) => (
          <div key={mi} className="flex-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{month.name}</div>
            <div className="flex gap-0.5">
              {month.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: day.isFuture ? '#e5e7eb' : day.completed ? color : 'rgba(156,163,175,0.3)',
                        opacity: day.isFuture ? 0.3 : 1
                      }}
                      title={`${day.date}: ${day.isFuture ? 'Future' : day.completed ? 'Done' : 'Missed'}`}
          />
        ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckboxHabitCard({ 
  habit, 
  stats,
  isHabitCompleted 
}: { 
  habit: Habit; 
  stats: CheckboxStats;
  isHabitCompleted: (habitId: string, date: string) => boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{habit.name}</h3>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <StreakDisplay current={stats.currentStreak} longest={stats.longestStreak} color={habit.color} />

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">This Week</h4>
          <CurrentWeekChart habitId={habit.id} color={habit.color} isHabitCompleted={isHabitCompleted} />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last 4 Months</h4>
          <FourMonthHeatmap habitId={habit.id} color={habit.color} isHabitCompleted={isHabitCompleted} />
        </div>
      </div>
    </div>
  );
}

function TrendLineChart({ data, color, unit }: { data: { date: string; count: number }[]; color: string; unit?: string }) {
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const avgValue = data.length > 0 ? data.reduce((s, d) => s + d.count, 0) / data.length : 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`counterGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 9, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [value, unit || 'Count']}
          labelFormatter={(label) => label}
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <ReferenceLine y={avgValue} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: 'Avg', position: 'right', fill: '#9ca3af', fontSize: 10 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          fill={`url(#counterGradient-${color.replace('#', '')})`}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


function TrendIndicator({ trend, percentage }: { trend: "up" | "down" | "stable"; percentage: number }) {
  const colors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-gray-500",
  };

  const icons = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  const labels = {
    up: "Trending Up",
    down: "Trending Down",
    stable: "Stable",
  };

  return (
    <div className={`flex items-center gap-1 ${colors[trend]}`}>
      <span className="text-lg font-bold">{icons[trend]}</span>
      <div>
        <div className="text-sm font-medium">{labels[trend]}</div>
        {percentage > 0 && trend !== "stable" && (
          <div className="text-xs opacity-70">{percentage.toFixed(1)}%</div>
        )}
      </div>
    </div>
  );
}

function CounterHabitCard({ habit, stats }: { habit: Habit; stats: CounterStats }) {
  const formatPeakDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{habit.name}</h3>
          </div>
          <TrendIndicator trend={stats.trend} percentage={stats.trendPercentage} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalCount.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.dailyAverage.toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">🏆 {stats.peakDay.count}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{formatPeakDate(stats.peakDay.date)}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Daily Progress</h4>
          <TrendLineChart data={stats.dailyData} color={habit.color} unit={habit.unit} />
        </div>
      </div>
    </div>
  );
}

function OverallStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: string; 
  gradient: string;
}) {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
      <div className="absolute top-2 right-2 text-4xl opacity-20">{icon}</div>
      <div className="relative">
        <div className="text-sm opacity-80">{title}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
        {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
      </div>
              </div>
  );
}

function TotalProgressChart({ 
  data, 
  averageCompletion 
}: { 
  data: { date: string; percentage: number; completed: number; total: number }[];
  averageCompletion: number;
}) {
  const chartData = data.map(d => {
    const date = new Date(d.date);
    return {
      ...d,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white">{data.dayName}, {label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: data.percentage >= 80 ? '#10b981' : data.percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
            {data.percentage}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.completed} of {data.total} habits completed
          </p>
            </div>
          );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">This Month&apos;s Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{averageCompletion}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
        </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={averageCompletion} 
            stroke="#6366f1" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ 
              value: `Avg: ${averageCompletion}%`, 
              position: 'right', 
              fill: '#6366f1', 
              fontSize: 11,
              fontWeight: 600
            }} 
          />
          <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#progressGradient)"
            dot={false}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
          <Bar dataKey="percentage" fill="#6366f1" fillOpacity={0.1} radius={[2, 2, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">80%+ Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">50-79% Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">&lt;50% Needs Work</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const { habits, getCheckboxStats, getCounterStats, getHabitStats, isHabitCompleted, getCounter } = useHabits();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  const checkboxHabits = habits.filter(h => h.trackingType === "checkbox");
  const counterHabits = habits.filter(h => h.trackingType === "counter");

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Data Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Start tracking habits to see detailed analytics. Add your first habit to begin your journey!
        </p>
      </div>
    );
  }

  const bestCurrentStreak = Math.max(...habits.map(h => getHabitStats(h.id).currentStreak), 0);
  const bestStreakEver = Math.max(...habits.map(h => getHabitStats(h.id).longestStreak), 0);
  
  const totalDaysTracked = habits.reduce((sum, h) => sum + getHabitStats(h.id).totalDays, 0);
  const totalCompletions = habits.reduce((sum, h) => sum + getHabitStats(h.id).completedDays, 0);

  const dailyProgressData: { date: string; percentage: number; completed: number; total: number }[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  
  const iterDate = new Date(firstDayOfMonth);
  while (iterDate <= today) {
    const dateStr = formatDateToString(iterDate);
    let completedCount = 0;
    habits.forEach(habit => {
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) completedCount++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) completedCount++;
      }
    });
    const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    dailyProgressData.push({ date: dateStr, percentage, completed: completedCount, total: habits.length });
    iterDate.setDate(iterDate.getDate() + 1);
  }

  const overallAverageCompletion = dailyProgressData.length > 0
    ? Math.round(dailyProgressData.reduce((sum, d) => sum + d.percentage, 0) / dailyProgressData.length)
    : 0;

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your progress and discover patterns in your habits</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <OverallStatsCard
            title="Current Streak"
            value={`${bestCurrentStreak} days`}
            subtitle="Best active streak"
            icon="🔥"
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
          />
          <OverallStatsCard
            title="This Month"
            value={`${overallAverageCompletion}%`}
            subtitle="Average completion"
            icon="📈"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <OverallStatsCard
            title="Best Streak"
            value={`${bestStreakEver} days`}
            subtitle="All-time record"
            icon="🏆"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <OverallStatsCard
            title="Completions"
            value={totalCompletions}
            subtitle={`${habits.length} habits tracked`}
            icon="✓"
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
        </div>

        <TotalProgressChart 
          data={dailyProgressData} 
          averageCompletion={overallAverageCompletion} 
        />

        {checkboxHabits.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-indigo-500 rounded-full" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Checkpoint Habits
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({checkboxHabits.length} habit{checkboxHabits.length !== 1 ? 's' : ''})
              </span>
          </div>
            <p className="text-gray-600 dark:text-gray-400 -mt-4 ml-4">
              Daily yes/no habits tracked for consistency
            </p>
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {checkboxHabits.map((habit) => (
                <CheckboxHabitCard
                  key={habit.id}
                  habit={habit}
                  stats={getCheckboxStats(habit.id)}
                  isHabitCompleted={isHabitCompleted}
                />
              ))}
          </div>
          </div>
        )}

        {counterHabits.length > 0 && (
          <div className="space-y-6">
                <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Counter Habits
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({counterHabits.length} habit{counterHabits.length !== 1 ? 's' : ''})
              </span>
                  </div>
            <p className="text-gray-600 dark:text-gray-400 -mt-4 ml-4">
              Quantity-based habits for tracking amounts and volumes
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {counterHabits.map((habit) => (
                <CounterHabitCard
                  key={habit.id}
                  habit={habit}
                  stats={getCounterStats(habit.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
