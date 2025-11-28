"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/contexts/HabitContext";
import {
  formatDateToString,
  isSameDay,
  getMonthYear,
  getMonthWeeks,
  getDayName,
} from "@/utils/dateUtils";

export default function MonthlyView() {
  const { habits, toggleCompletion, isHabitCompleted, deleteHabit, setCounter, getCounter } = useHabits();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    setToday(new Date());
  }, []);

  const goToPreviousMonth = () => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  if (!currentDate || !today) {
    return null; 
  }

  // Always show exactly 4 weeks
  const monthWeeks = getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth());

  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  // Calculate statistics
  const totalHabits = habits.length;
  const allDates = monthWeeks.flat().filter(d => d !== null);
  const completedCount = habits.reduce((sum, habit) => {
    return sum + allDates.filter(date => {
      const dateStr = formatDateToString(date);
      return date <= today && isHabitCompleted(habit.id, dateStr);
    }).length;
  }, 0);

  const getWeekColor = (index: number) => {
    return index % 2 === 0
      ? "bg-[#f5f5f5] dark:bg-gray-800"
      : "bg-[#e8e8e8] dark:bg-gray-700";
  };

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center text-gray-500">
        <div>
          <p className="text-lg font-medium">No habits yet</p>
          <p className="text-sm mt-2">Add your first habit to start tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-[#f8f9fa] dark:bg-gray-900">
      {/* Month Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{getMonthYear(currentDate)}</h2>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
               <span className="text-gray-500 dark:text-gray-400">Habits:</span>
               <span className="font-semibold text-gray-800 dark:text-gray-200">{totalHabits}</span>
            </div>
            <div className="flex items-center gap-1">
               <span className="text-gray-500 dark:text-gray-400">Completed:</span>
               <span className="font-semibold text-gray-800 dark:text-gray-200">{completedCount}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            ←
          </button>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={goToNextMonth}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Main Grid - Scrollable for habits only */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 min-h-0 custom-scrollbar">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-20 shadow-sm bg-[#f0f0f0] dark:bg-gray-800">
            {/* Week headers */}
            <tr>
              <th rowSpan={2} className="border-r border-t border-l border-gray-300 dark:border-gray-600 p-2 text-center bg-[#e8e8e8] dark:bg-gray-800 font-bold text-sm min-w-[160px] text-gray-700 dark:text-gray-200 align-middle">
                My Habits
              </th>
              {monthWeeks.map((week, weekIndex) => (
                <th
                  key={weekIndex}
                  colSpan={week.length}
                  className={`border border-gray-300 dark:border-gray-600 py-0.5 px-0.5 text-center font-semibold text-[9px] text-gray-600 dark:text-gray-300 ${getWeekColor(weekIndex)}`}
                >
                  {weekIndex < 4 ? `W${weekIndex + 1}` : 'Ex'}
                </th>
              ))}
            </tr>
            {/* Day headers */}
            <tr>
              {monthWeeks.map((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const isToday = isSameDay(date, today);
                  return (
                    <th
                      key={`${weekIndex}-${dayIndex}`}
                      className={`border border-gray-300 dark:border-gray-600 py-0.5 px-0 text-center text-[8px] font-medium min-w-[28px] ${
                        isToday 
                          ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-700 dark:border-indigo-600" 
                          : `${getWeekColor(weekIndex)} text-gray-600 dark:text-gray-400`
                      }`}
                    >
                      <div className={isToday ? "opacity-90" : "opacity-70"}>{getDayName(date)}</div>
                      <div className={`font-semibold text-[9px] ${isToday ? "font-bold" : ""}`}>{date.getDate()}</div>
                    </th>
                  );
                })
              )}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="group">
                <td className="border border-gray-300 dark:border-gray-600 py-1.5 px-2 sticky left-0 bg-[#f9f9f9] dark:bg-gray-800 z-10 font-medium text-gray-700 dark:text-gray-200 text-sm">
                  <div className="flex items-center justify-between gap-2 h-full">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-lg flex-shrink-0">{habit.icon}</span>
                      <span className="truncate">{habit.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                          deleteHabit(habit.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 text-sm"
                      title="Delete habit"
                    >
                      ✕
                    </button>
                  </div>
                </td>
                {monthWeeks.map((week, weekIndex) =>
                  week.map((date, dayIndex) => {
                    const dateString = formatDateToString(date);
                    const isCompleted = isHabitCompleted(habit.id, dateString);
                    const isToday = isSameDay(date, today);
                    const isFuture = date > today;

                    return (
                      <td
                        key={`${weekIndex}-${dayIndex}`}
                        className={`border p-0 text-center min-w-[28px] h-full relative ${
                          isToday 
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700" 
                            : `${getWeekColor(weekIndex)} border-gray-300 dark:border-gray-600`
                        }`}
                      >
                        {habit.trackingType === "checkbox" ? (
                          <div className="flex items-center justify-center h-full w-full p-0.5">
                            <button
                              onClick={() => !isFuture && toggleCompletion(habit.id, dateString)}
                              disabled={isFuture}
                              className={`
                                w-4 h-4 flex items-center justify-center transition-all duration-100 rounded-none border
                                ${isFuture 
                                  ? "opacity-20 cursor-not-allowed bg-transparent border-gray-400" 
                                  : "cursor-pointer"
                                }
                                ${isCompleted 
                                  ? "bg-green-600 dark:bg-green-500 border-green-600 dark:border-green-500 text-white" 
                                  : "bg-transparent border-gray-400 dark:border-gray-500 hover:border-gray-600"
                                }
                              `}
                            >
                              {isCompleted && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full p-0.5">
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={getCounter(habit.id, dateString) || ""}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setCounter(habit.id, dateString, value);
                              }}
                              disabled={isFuture}
                              onClick={(e) => e.currentTarget.select()}
                              className={`
                                w-full h-5 text-center text-[9px] border-0 focus:ring-0 bg-transparent p-0
                                ${isFuture ? "text-gray-400 cursor-not-allowed" : "text-gray-900 dark:text-gray-100"}
                                ${getCounter(habit.id, dateString) > 0 ? "font-bold" : ""}
                              `}
                              placeholder="-"
                            />
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress Section - Fixed at bottom */}
      <div className="flex-shrink-0 bg-[#e8e8e8] dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <tbody>
            {/* Summary Rows at Bottom */}
            <tr>
              <td className="border-r border-gray-300 dark:border-gray-600 py-1 px-2 bg-[#e8e8e8] dark:bg-gray-800 font-bold text-xs text-gray-700 dark:text-gray-200 min-w-[160px]">
                Progress
              </td>
              {monthWeeks.map((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const dateStr = formatDateToString(date);
                  const total = habits.length;
                  if (total === 0) return <td key={`${weekIndex}-${dayIndex}`} className={`border border-gray-300 dark:border-gray-600 ${getWeekColor(weekIndex)}`}></td>;
                  
                  const completed = habits.filter(h => 
                    h.trackingType === 'checkbox' ? isHabitCompleted(h.id, dateStr) : getCounter(h.id, dateStr) > 0
                  ).length;
                  const percent = Math.round((completed / total) * 100);
                  
                  return (
                    <td key={`${weekIndex}-${dayIndex}`} className={`border-t border-r border-gray-300 dark:border-gray-600 py-0.5 px-0 text-center text-[8px] text-gray-600 dark:text-gray-400 min-w-[28px] ${getWeekColor(weekIndex)}`}>
                      {percent}%
                    </td>
                  );
                })
              )}
            </tr>
            <tr>
              <td className="border-r border-gray-300 dark:border-gray-600 py-1 px-2 bg-[#e8e8e8] dark:bg-gray-800 font-bold text-xs text-gray-700 dark:text-gray-200 min-w-[160px]">
                Done
              </td>
              {monthWeeks.map((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const dateStr = formatDateToString(date);
                  const completed = habits.filter(h => 
                    h.trackingType === 'checkbox' ? isHabitCompleted(h.id, dateStr) : getCounter(h.id, dateStr) > 0
                  ).length;
                  
                  return (
                    <td key={`${weekIndex}-${dayIndex}`} className={`border-t border-r border-gray-300 dark:border-gray-600 py-0.5 px-0 text-center text-[8px] text-gray-600 dark:text-gray-400 min-w-[28px] ${getWeekColor(weekIndex)}`}>
                      {completed}
                    </td>
                  );
                })
              )}
            </tr>
            <tr>
              <td className="border-r border-gray-300 dark:border-gray-600 py-1 px-2 bg-[#e8e8e8] dark:bg-gray-800 font-bold text-xs text-gray-700 dark:text-gray-200 min-w-[160px]">
                Not Done
              </td>
              {monthWeeks.map((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const dateStr = formatDateToString(date);
                  const total = habits.length;
                  const completed = habits.filter(h => 
                    h.trackingType === 'checkbox' ? isHabitCompleted(h.id, dateStr) : getCounter(h.id, dateStr) > 0
                  ).length;
                  
                  return (
                    <td key={`${weekIndex}-${dayIndex}`} className={`border-t border-r border-gray-300 dark:border-gray-600 py-0.5 px-0 text-center text-[8px] text-gray-600 dark:text-gray-400 min-w-[28px] ${getWeekColor(weekIndex)}`}>
                      {total - completed}
                    </td>
                  );
                })
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
