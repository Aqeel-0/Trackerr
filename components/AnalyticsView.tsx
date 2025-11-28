"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { formatDateToString, getMonthWeeks } from "@/utils/dateUtils";

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
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
           <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No Analytics Yet</h3>
        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Start tracking your habits to see detailed insights here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 lg:p-6 space-y-8 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Performance Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Track your progress and consistency over time.</p>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Habits</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{habits.length}</div>
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Avg Completion</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {habits.length > 0
                ? Math.round(
                    habits.reduce((sum, h) => {
                      const stats = getHabitStats(h.id);
                      return sum + stats.completionRate;
                    }, 0) / habits.length
                  )
                : 0}%
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Days</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{allDates.length}</div>
            <span className="text-xs text-gray-500">Days recorded</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Best Streak</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
              {Math.max(...habits.map(h => getHabitStats(h.id).longestStreak), 0)}
            </div>
            <span className="text-xl">🔥</span>
          </div>
        </div>
      </div>

      {/* Per Habit Detailed Analytics */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {habits.map(habit => {
          const stats = getHabitStats(habit.id);

          if (habit.trackingType === "checkbox") {
            // Get daily completion data for the month
            const dailyData = allDates.map(date => ({
              date,
              completed: isHabitCompleted(habit.id, formatDateToString(date))
            }));

            // Weekly aggregation
            const weeks = monthWeeks.map((week, idx) => {
              const weekDates = week.filter(d => d <= today);
              const completed = weekDates.filter(d =>
                isHabitCompleted(habit.id, formatDateToString(d))
              ).length;
              const total = weekDates.length;
              return {
                week: idx + 1,
                completed,
                total,
                percentage: total > 0 ? (completed / total) * 100 : 0
              };
            });

            return (
              <div key={habit.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl">
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{habit.name}</h3>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full inline-block mt-1">
                        Checkbox
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(stats.completionRate)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Done</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.completedDays}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Streak</div>
                    <div className="text-lg font-bold text-orange-500">{stats.currentStreak} 🔥</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best Streak</div>
                    <div className="text-lg font-bold text-purple-500">{stats.longestStreak} ⚡</div>
                  </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Weekly Progress</h4>
                  <div className="flex items-end justify-between gap-3 h-32">
                    {weeks.map(week => (
                      <div key={week.week} className="flex-1 flex flex-col items-center group">
                         <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 transition-all duration-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500"
                            style={{
                              height: `${week.percentage}%`
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">W{week.week}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Heatmap */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {dailyData.slice(-28).map((day, idx) => ( // Show last 4 weeks approx
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${
                            day.completed 
                            ? "bg-indigo-500 text-white shadow-sm" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                        }`}
                        title={formatDateToString(day.date)}
                      >
                        {day.date.getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else {
            // Counter habit analytics
            const dailyData = allDates.map(date => ({
              date,
              count: getCounter(habit.id, formatDateToString(date))
            }));

            const totalCount = dailyData.reduce((sum, d) => sum + d.count, 0);
            const avgPerDay = allDates.length > 0 ? (totalCount / allDates.length).toFixed(1) : '0';
            const maxCount = Math.max(...dailyData.map(d => d.count), 1);
            // const daysWithActivity = dailyData.filter(d => d.count > 0).length;

            // Weekly aggregation
            const weeks = monthWeeks.map((week, idx) => {
              const weekDates = week.filter(d => d <= today);
              const total = weekDates.reduce((sum, d) =>
                sum + getCounter(habit.id, formatDateToString(d)), 0
              );
              return {
                week: idx + 1,
                total,
                avg: weekDates.length > 0 ? (total / weekDates.length).toFixed(1) : '0'
              };
            });

            const maxWeekTotal = Math.max(...weeks.map(w => w.total), 1);
            
            return (
              <div key={habit.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl">
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{habit.name}</h3>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full inline-block mt-1">
                        Counter
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Count</div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgPerDay}</div>
                  </div>
                   <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Day</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{maxCount}</div>
                  </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Weekly Volume</h4>
                  <div className="flex items-end justify-between gap-3 h-32">
                    {weeks.map(week => (
                      <div key={week.week} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 transition-all duration-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500"
                            style={{
                              height: `${(week.total / maxWeekTotal) * 100}%`
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">W{week.week}</div>
                         <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 absolute -mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            {week.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Daily Trend */}
                <div>
                   <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Daily Trend</h4>
                   <div className="flex items-end gap-1 h-24 overflow-x-auto custom-scrollbar pb-2">
                      {dailyData.map((day, idx) => (
                        <div key={idx} className="flex-shrink-0 flex flex-col items-center w-5 group">
                           <div className="w-3 bg-gray-100 dark:bg-gray-700 rounded-t-sm relative" style={{ height: '100%' }}>
                              <div 
                                className={`w-full absolute bottom-0 rounded-t-sm transition-all ${day.count > 0 ? 'bg-indigo-400 dark:bg-indigo-500' : 'bg-transparent'}`}
                                style={{ height: `${(day.count / maxCount) * 100}%` }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            );
          }
        })}
        </div>
      </div>
    </div>
  );
}
