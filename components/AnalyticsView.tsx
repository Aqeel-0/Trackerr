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
    <div className="flex gap-4 sm:gap-6">
      <div className="text-center">
        <div className="relative">
          <div
            className="text-2xl sm:text-4xl font-bold"
            style={{ color }}
          >
            {current}
          </div>
          {current > 0 && (
            <span className="absolute -top-1 -right-3 sm:-right-4 text-lg sm:text-2xl animate-bounce">🔥</span>
          )}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Current Streak</div>
      </div>
      <div className="w-px bg-gray-200 dark:bg-gray-700" />
      <div className="text-center">
        <div className="text-2xl sm:text-4xl font-bold text-gray-700 dark:text-gray-300">
          {longest}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
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
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);

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
      isToday: index === daysFromMonday,
    };
  });

  return (
    <div className="flex justify-between gap-1 sm:gap-2">
      {chartData.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className={`w-full h-10 sm:h-16 rounded-lg flex items-center justify-center text-sm sm:text-lg font-bold transition-all ${d.isFuture
              ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600'
              : d.completed
                ? 'text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              } ${d.isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2 dark:ring-offset-gray-800' : ''}`}
            style={{ backgroundColor: d.completed ? color : undefined }}
          >
            {d.isFuture ? '—' : d.completed ? '✓' : '✗'}
          </div>
          <span className={`text-[10px] sm:text-xs mt-1 ${d.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
            {d.day.slice(0, 2)}
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const today = new Date();
  const monthsToShow = isMobile ? 2 : 4;
  const startMonth = new Date(today.getFullYear(), today.getMonth() - (monthsToShow - 1), 1);

  const months: { name: string; weeks: { date: string; completed: boolean; isFuture: boolean }[][] }[] = [];

  for (let m = 0; m < monthsToShow; m++) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + m, 1);
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
      <div className="flex gap-2 sm:gap-4">
        {months.map((month, mi) => (
          <div key={mi} className="flex-1">
            <div className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{month.name}</div>
            <div className="flex gap-0.5">
              {month.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
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
  // Calculate last 30 days completion rate
  const last30Completed = stats.last30Days.filter(d => d.completed).length;
  const last30Rate = Math.round((last30Completed / 30) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-3 sm:p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">{habit.icon}</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{habit.name}</h3>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: habit.color + '20' }}>
            <span className="text-xs sm:text-sm font-bold" style={{ color: habit.color }}>{last30Rate}%</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">30d</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">
        <StreakDisplay current={stats.currentStreak} longest={stats.longestStreak} color={habit.color} />

        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">This Week</h4>
          <CurrentWeekChart habitId={habit.id} color={habit.color} isHabitCompleted={isHabitCompleted} />
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Months</h4>
          <FourMonthHeatmap habitId={habit.id} color={habit.color} isHabitCompleted={isHabitCompleted} />
        </div>
      </div>
    </div>
  );
}

function TrendLineChart({ data, color, unit, habitId }: { data: { date: string; count: number; label?: string }[]; color: string; unit?: string; habitId: string }) {
  const chartData = data.map(d => {
    // Parse date string as local time (YYYY-MM-DD)
    const [year, month, day] = d.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      ...d,
      label: d.label || date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  const avgValue = data.length > 0 ? data.reduce((s, d) => s + d.count, 0) / data.length : 0;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`counterGradient-${habitId}`} x1="0" y1="0" x2="0" y2="1">
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
          tick={{ fontSize: 10, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          formatter={(value: number) => [value, unit || 'Count']}
          labelFormatter={(label) => label}
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            fontSize: '12px',
          }}
        />
        <ReferenceLine y={avgValue} stroke="#9ca3af" strokeDasharray="5 5" />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          fill={`url(#counterGradient-${habitId})`}
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
    up: "Up",
    down: "Down",
    stable: "Stable",
  };

  return (
    <div className={`flex items-center gap-1 ${colors[trend]}`}>
      <span className="text-base sm:text-lg font-bold">{icons[trend]}</span>
      <div>
        <div className="text-xs sm:text-sm font-medium">{labels[trend]}</div>
        {percentage > 0 && trend !== "stable" && (
          <div className="text-[10px] sm:text-xs opacity-70">{percentage.toFixed(1)}%</div>
        )}
      </div>
    </div>
  );
}

function CounterHabitCard({ habit, stats }: { habit: Habit; stats: CounterStats }) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const formatPeakDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get available months from habit data
  const getAvailableMonths = () => {
    const months = new Set<string>();
    stats.dailyData.forEach(d => {
      // Parse date string as local time (YYYY-MM-DD)
      const [year, month, day] = d.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    const currentIndex = availableMonths.indexOf(currentMonthKey);

    if (direction === 'prev' && currentIndex < availableMonths.length - 1) {
      const [year, month] = availableMonths[currentIndex + 1].split('-');
      setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
    } else if (direction === 'next' && currentIndex > 0) {
      const [year, month] = availableMonths[currentIndex - 1].split('-');
      setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
    }
  };

  // Calculate stats based on selected view
  const getViewData = () => {
    let chartData: { date: string; count: number; label: string }[] = [];
    let periodLabel = '';
    let total = 0;
    let average = 0;
    let peakDay = { date: '', count: 0 };

    if (viewMode === 'daily') {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      periodLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const tempDate = new Date(firstOfMonth);
      while (tempDate <= lastOfMonth && tempDate <= now) {
        const dateStr = formatDateToString(tempDate);
        const dataPoint = stats.dailyData.find(d => d.date === dateStr);
        const count = dataPoint?.count ?? 0;

        chartData.push({
          date: dateStr,
          count: count,
          label: tempDate.getDate().toString()
        });

        total += count;

        // Track peak day for this period
        if (count > peakDay.count) {
          peakDay = { date: dateStr, count };
        }

        tempDate.setDate(tempDate.getDate() + 1);
      }

      average = chartData.length > 0 ? total / chartData.length : 0;

    } else {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);
      const now = new Date();

      periodLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const tempDate = new Date(firstOfMonth);
      while (tempDate <= lastOfMonth && tempDate <= now) {
        const dateStr = formatDateToString(tempDate);
        const dataPoint = stats.dailyData.find(d => d.date === dateStr);
        const count = dataPoint?.count ?? 0;

        chartData.push({
          date: dateStr,
          count: count,
          label: tempDate.getDate().toString()
        });

        total += count;

        // Track peak day for this period
        if (count > peakDay.count) {
          peakDay = { date: dateStr, count };
        }

        tempDate.setDate(tempDate.getDate() + 1);
      }

      average = chartData.length > 0 ? total / chartData.length : 0;
    }

    return { chartData, periodLabel, total, average, peakDay };
  };

  const { chartData, periodLabel, total, average, peakDay } = getViewData();

  const todayStr = formatDateToString(new Date());
  const todayCount = stats.dailyData.find(d => d.date === todayStr)?.count ?? 0;
  const targetLabel = habit.targetCount ? ` / ${habit.targetCount}` : '';
  const isTargetMet = habit.targetCount ? todayCount >= habit.targetCount : false;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-3 sm:p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">{habit.icon}</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{habit.name}</h3>
          </div>
          <TrendIndicator trend={stats.trend} percentage={stats.trendPercentage} />
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${viewMode === 'daily'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${viewMode === 'monthly'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Monthly
          </button>
        </div>

        {viewMode === 'monthly' && (
          <div className="flex items-center justify-between mt-3 px-2">
            <button
              onClick={() => navigateMonth('prev')}
              disabled={availableMonths.indexOf(`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`) >= availableMonths.length - 1}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              disabled={availableMonths.indexOf(`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`) <= 0}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className={`rounded-lg p-2 text-center ${isTargetMet ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className={`text-sm sm:text-lg font-bold flex items-center justify-center gap-1 ${isTargetMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {todayCount}{targetLabel}
              {habit.targetCount && (
                <span className="text-base">
                  {isTargetMet ? '✓' : '✗'}
                </span>
              )}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">Today</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <div className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {average.toFixed(1)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">Daily Avg</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
            <div className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400">
              🏆 {peakDay.count}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
              {peakDay.count > 0 ? formatPeakDate(peakDay.date) : 'N/A'}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            {periodLabel}
          </h4>
          <TrendLineChart data={chartData} color={habit.color || '#6366f1'} unit={habit.unit} habitId={habit.id} />
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
    <div className={`${gradient} rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white relative overflow-hidden`}>
      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 text-2xl sm:text-4xl opacity-20">{icon}</div>
      <div className="relative">
        <div className="text-[10px] sm:text-sm opacity-80">{title}</div>
        <div className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{value}</div>
        {subtitle && <div className="text-[10px] sm:text-xs opacity-70 mt-0.5 sm:mt-1">{subtitle}</div>}
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
    // Parse date string as local time (YYYY-MM-DD)
    const [year, month, day] = d.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      ...d,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isPerfect: d.percentage === 100,
    };
  });

  // Count perfect days
  const perfectDays = chartData.filter(d => d.isPerfect).length;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { dayName: string; percentage: number; completed: number; total: number; isPerfect: boolean } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 sm:p-3">
          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
            {data.dayName}, {label} {data.isPerfect && '⭐'}
          </p>
          <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1" style={{ color: data.percentage >= 80 ? '#10b981' : data.percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
            {data.percentage}%
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            {data.completed} of {data.total} habits
            {data.isPerfect && ' • Perfect day!'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot to show stars on perfect days
  const CustomDot = (props: { cx?: number; cy?: number; payload?: { isPerfect: boolean } }) => {
    const { cx, cy, payload } = props;
    if (payload?.isPerfect && cx && cy) {
      return (
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize={12}>
          ⭐
        </text>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">This Month&apos;s Progress</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {perfectDays > 0 && <span className="ml-2">• {perfectDays} perfect day{perfectDays > 1 ? 's' : ''} ⭐</span>}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{averageCompletion}%</div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Average</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={averageCompletion}
            stroke="#6366f1"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#progressGradient)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
          <Bar dataKey="percentage" fill="#6366f1" fillOpacity={0.1} radius={[2, 2, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">80%+ Great</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500" />
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">50-79% Good</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { name: "Health", color: "#10b981", icon: "💪" },
  { name: "Work", color: "#3b82f6", icon: "💼" },
  { name: "Mindfulness", color: "#8b5cf6", icon: "🧘" },
  { name: "Learning", color: "#f59e0b", icon: "📚" },
  { name: "Social", color: "#ec4899", icon: "👥" },
  { name: "Other", color: "#64748b", icon: "✨" },
];

function CategorySummaryCard({
  category,
  habits,
  getHabitStats,
  isHabitCompleted,
  getCounter
}: {
  category: { name: string; color: string; icon: string };
  habits: Habit[];
  getHabitStats: (id: string) => { completedDays: number; totalDays: number };
  isHabitCompleted: (habitId: string, date: string) => boolean;
  getCounter: (habitId: string, date: string) => number;
}) {
  if (habits.length === 0) return null;

  // Calculate last 7 days completion for this category
  const today = new Date();
  let last7DaysCompleted = 0;
  let last7DaysPossible = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = formatDateToString(date);

    habits.forEach(habit => {
      last7DaysPossible++;
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) last7DaysCompleted++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) last7DaysCompleted++;
      }
    });
  }

  const last7DaysRate = last7DaysPossible > 0 ? Math.round((last7DaysCompleted / last7DaysPossible) * 100) : 0;

  // Calculate this week's completion for this category
  const currentDayOfWeek = today.getDay();
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);

  let weekCompletions = 0;
  let weekPossible = 0;

  for (let i = 0; i <= daysFromMonday; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = formatDateToString(date);

    habits.forEach(habit => {
      weekPossible++;
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) weekCompletions++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) weekCompletions++;
      }
    });
  }

  const weekRate = weekPossible > 0 ? Math.round((weekCompletions / weekPossible) * 100) : 0;

  // Calculate last week's completion for trend comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let lastWeekCompletions = 0;
  let lastWeekPossible = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(lastWeekStart);
    date.setDate(lastWeekStart.getDate() + i);
    const dateStr = formatDateToString(date);

    habits.forEach(habit => {
      lastWeekPossible++;
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) lastWeekCompletions++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) lastWeekCompletions++;
      }
    });
  }

  const lastWeekRate = lastWeekPossible > 0 ? Math.round((lastWeekCompletions / lastWeekPossible) * 100) : 0;

  // Determine trend
  const trendDiff = weekRate - lastWeekRate;
  const trend = trendDiff > 5 ? 'up' : trendDiff < -5 ? 'down' : 'stable';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer"
      style={{ borderColor: category.color + '40' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <h4 className="font-bold text-gray-900 dark:text-white">{category.name}</h4>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: category.color + '15' }}>
            <div className="text-2xl font-bold" style={{ color: category.color }}>
              {last7DaysRate}%
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {weekRate}%
              </span>
              {trend === 'up' && <span className="text-green-500 text-sm">↑</span>}
              {trend === 'down' && <span className="text-red-500 text-sm">↓</span>}
              {trend === 'stable' && <span className="text-gray-400 text-sm">→</span>}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">This week</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const { habits, getCheckboxStats, getCounterStats, getHabitStats, isHabitCompleted, getCounter } = useHabits();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  // Get all unique categories from habits
  const habitCategories = Array.from(new Set(habits.map(h => h.category).filter(Boolean))) as string[];
  const allCategories = ["All", ...CATEGORIES.map(c => c.name), ...habitCategories.filter(c => !CATEGORIES.map(cat => cat.name).includes(c))];

  // Filter habits based on selected category
  const filteredHabits = selectedCategory === "All"
    ? habits
    : habits.filter(h => h.category === selectedCategory);

  const checkboxHabits = filteredHabits.filter(h => h.trackingType === "checkbox");
  const counterHabits = filteredHabits.filter(h => h.trackingType === "counter");

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-5xl sm:text-6xl mb-4">📊</div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Data Yet</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md">
          Start tracking habits to see detailed analytics. Add your first habit to begin your journey!
        </p>
      </div>
    );
  }

  // Declare today first
  const today = new Date();

  // Calculate today's progress
  const todayStr = formatDateToString(today);
  let todayCompleted = 0;
  filteredHabits.forEach(habit => {
    if (habit.trackingType === 'checkbox') {
      if (isHabitCompleted(habit.id, todayStr)) todayCompleted++;
    } else {
      if (getCounter(habit.id, todayStr) > 0) todayCompleted++;
    }
  });
  const todayTotal = filteredHabits.length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Calculate yesterday's progress for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToString(yesterday);
  let yesterdayCompleted = 0;
  filteredHabits.forEach(habit => {
    if (habit.trackingType === 'checkbox') {
      if (isHabitCompleted(habit.id, yesterdayStr)) yesterdayCompleted++;
    } else {
      if (getCounter(habit.id, yesterdayStr) > 0) yesterdayCompleted++;
    }
  });
  const yesterdayPercentage = todayTotal > 0 ? Math.round((yesterdayCompleted / todayTotal) * 100) : 0;
  const todayTrend = todayPercentage - yesterdayPercentage;

  // Calculate this week's progress
  const currentDayOfWeek = today.getDay();
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);

  let weekCompleted = 0;
  let weekPossible = 0;

  for (let i = 0; i <= daysFromMonday; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = formatDateToString(date);

    filteredHabits.forEach(habit => {
      weekPossible++;
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) weekCompleted++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) weekCompleted++;
      }
    });
  }

  const weekPercentage = weekPossible > 0 ? Math.round((weekCompleted / weekPossible) * 100) : 0;

  // Calculate last week's progress for comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let lastWeekCompleted = 0;
  let lastWeekPossible = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(lastWeekStart);
    date.setDate(lastWeekStart.getDate() + i);
    const dateStr = formatDateToString(date);

    filteredHabits.forEach(habit => {
      lastWeekPossible++;
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) lastWeekCompleted++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) lastWeekCompleted++;
      }
    });
  }

  const lastWeekPercentage = lastWeekPossible > 0 ? Math.round((lastWeekCompleted / lastWeekPossible) * 100) : 0;
  const weekTrend = weekPercentage - lastWeekPercentage;

  const dailyProgressData: { date: string; percentage: number; completed: number; total: number }[] = [];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  const iterDate = new Date(firstDayOfMonth);
  while (iterDate <= today) {
    const dateStr = formatDateToString(iterDate);
    let completedCount = 0;
    filteredHabits.forEach(habit => {
      if (habit.trackingType === 'checkbox') {
        if (isHabitCompleted(habit.id, dateStr)) completedCount++;
      } else {
        if (getCounter(habit.id, dateStr) > 0) completedCount++;
      }
    });
    const percentage = filteredHabits.length > 0 ? Math.round((completedCount / filteredHabits.length) * 100) : 0;
    dailyProgressData.push({ date: dateStr, percentage, completed: completedCount, total: filteredHabits.length });
    iterDate.setDate(iterDate.getDate() + 1);
  }

  const overallAverageCompletion = dailyProgressData.length > 0
    ? Math.round(dailyProgressData.reduce((sum, d) => sum + d.percentage, 0) / dailyProgressData.length)
    : 0;

  // Group habits by category for summary cards
  const categorizedHabits = CATEGORIES.map(cat => ({
    category: cat,
    habits: habits.filter(h => h.category === cat.name)
  })).filter(group => group.habits.length > 0);

  // Add custom categories
  const customCategories = habitCategories.filter(c => !CATEGORIES.map(cat => cat.name).includes(c));
  customCategories.forEach(catName => {
    categorizedHabits.push({
      category: { name: catName, color: "#64748b", icon: "✨" },
      habits: habits.filter(h => h.category === catName)
    });
  });

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Analytics</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Track your progress and discover patterns</p>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Category</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {allCategories.map((cat) => {
              const categoryData = CATEGORIES.find(c => c.name === cat);
              const isSelected = selectedCategory === cat;
              const habitCount = cat === "All" ? habits.length : habits.filter(h => h.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${isSelected
                    ? 'bg-indigo-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  style={isSelected && categoryData ? { backgroundColor: categoryData.color } : {}}
                >
                  {categoryData && <span>{categoryData.icon}</span>}
                  <span>{cat}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isSelected
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                    {habitCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Summary Cards */}
        {selectedCategory === "All" && categorizedHabits.length > 1 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Category Insights</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedHabits.map(({ category, habits: catHabits }) => (
                <CategorySummaryCard
                  key={category.name}
                  category={category}
                  habits={catHabits}
                  getHabitStats={getHabitStats}
                  isHabitCompleted={isHabitCompleted}
                  getCounter={getCounter}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Today's Progress Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl sm:text-5xl opacity-20">📋</div>
            <div className="relative">
              <div className="text-xs sm:text-sm opacity-90 mb-2">Today&apos;s Progress</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl sm:text-4xl font-bold">{todayCompleted}/{todayTotal}</span>
                <span className="text-lg sm:text-xl opacity-80">habits</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${todayPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{todayPercentage}%</span>
              </div>
              {/* Trend vs Yesterday */}
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs opacity-75">vs Yesterday</span>
                <div className="flex items-center gap-1">
                  {todayTrend > 0 && (
                    <>
                      <span className="text-green-300 text-sm">↑</span>
                      <span className="text-xs font-medium text-green-300">+{todayTrend}%</span>
                    </>
                  )}
                  {todayTrend < 0 && (
                    <>
                      <span className="text-red-300 text-sm">↓</span>
                      <span className="text-xs font-medium text-red-300">{todayTrend}%</span>
                    </>
                  )}
                  {todayTrend === 0 && (
                    <>
                      <span className="text-white/60 text-sm">→</span>
                      <span className="text-xs font-medium text-white/60">Same</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* This Week Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl sm:text-5xl opacity-20">📊</div>
            <div className="relative">
              <div className="text-xs sm:text-sm opacity-90 mb-2">This Week</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl sm:text-4xl font-bold">{weekCompleted}/{weekPossible}</span>
                <span className="text-lg sm:text-xl opacity-80">done</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${weekPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{weekPercentage}%</span>
              </div>
              {/* Trend vs Last Week */}
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs opacity-75">vs Last Week</span>
                <div className="flex items-center gap-1">
                  {weekTrend > 0 && (
                    <>
                      <span className="text-green-300 text-sm">↑</span>
                      <span className="text-xs font-medium text-green-300">+{weekTrend}%</span>
                    </>
                  )}
                  {weekTrend < 0 && (
                    <>
                      <span className="text-red-300 text-sm">↓</span>
                      <span className="text-xs font-medium text-red-300">{weekTrend}%</span>
                    </>
                  )}
                  {weekTrend === 0 && (
                    <>
                      <span className="text-white/60 text-sm">→</span>
                      <span className="text-xs font-medium text-white/60">Same</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <TotalProgressChart
          data={dailyProgressData}
          averageCompletion={overallAverageCompletion}
        />

        {checkboxHabits.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1 h-6 sm:h-8 bg-indigo-500 rounded-full" />
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Checkpoint Habits
              </h3>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({checkboxHabits.length})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 -mt-2 sm:-mt-4 ml-3 sm:ml-4">
              Daily yes/no habits tracked for consistency
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1 h-6 sm:h-8 bg-emerald-500 rounded-full" />
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Counter Habits
              </h3>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({counterHabits.length})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 -mt-2 sm:-mt-4 ml-3 sm:ml-4">
              Quantity-based habits for tracking amounts
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
