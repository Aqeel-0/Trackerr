"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/contexts/HabitContext";
import {
  formatDateToString,
  isSameDay,
  getMonthYear,
  getMonthWeeks,
  getDayName,
  getCurrentWeek,
} from "@/utils/dateUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Habit } from "@/types/habit";

interface SortableHabitRowProps {
  habit: Habit;
  dates: Date[];
  today: Date;
  getWeekColor: (index: number) => string;
  onDelete: (id: string, name: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isHabitCompleted: (habitId: string, date: string) => boolean;
  setCounter: (habitId: string, date: string, count: number) => void;
  getCounter: (habitId: string, date: string) => number;
  isMobileView?: boolean;
  isTabletView?: boolean;
}

function SortableHabitRow({
  habit,
  dates,
  today,
  getWeekColor,
  onDelete,
  toggleCompletion,
  isHabitCompleted,
  setCounter,
  getCounter,
  isMobileView = false,
  isTabletView = false,
}: SortableHabitRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompactView = isMobileView || isTabletView;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? "opacity-50" : ""}`}
    >
      <td className={`border border-slate-200 dark:border-slate-700 py-1 px-1 bg-white dark:bg-slate-900 z-10 font-medium text-slate-700 dark:text-slate-200 ${isMobileView ? 'text-[10px]' : 'text-xs'}`}>
        <div className="flex items-center justify-between gap-0.5 h-full">
          <div className="flex items-center gap-1 truncate">
            <button
              {...attributes}
              {...listeners}
              className="touch-none text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0 hidden sm:block"
              aria-label="Drag to reorder"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" />
                <circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />
              </svg>
            </button>
            <span className={`flex-shrink-0 ${isMobileView ? 'text-sm' : 'text-sm'}`}>{habit.icon}</span>
            <span className={`truncate ${isMobileView ? 'text-[10px]' : 'text-xs'}`}>{habit.name}</span>
          </div>
          <button
            onClick={() => onDelete(habit.id, habit.name)}
            className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
            title="Delete habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </td>
      {dates.map((date, dayIndex) => {
        const dateString = formatDateToString(date);
        const isCompleted = isHabitCompleted(habit.id, dateString);
        const isToday = isSameDay(date, today);
        const isFuture = date > today && !isToday;
        const weekIndex = Math.floor(dayIndex / 7);

        return (
          <td
            key={dayIndex}
            className={`border p-0 text-center h-full relative ${isToday
              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
              : `${getWeekColor(weekIndex)} border-slate-300 dark:border-slate-600`
            }`}
          >
            {habit.trackingType === "checkbox" ? (
              <div className={`flex items-center justify-center h-full w-full ${isMobileView ? 'p-1' : 'p-0.5'}`}>
                <button
                  onClick={() => !isFuture && toggleCompletion(habit.id, dateString)}
                  disabled={isFuture}
                  className={`
                    ${isMobileView ? 'w-6 h-6' : isTabletView ? 'w-5 h-5' : 'w-4 h-4'} flex items-center justify-center transition-all duration-100 rounded-none border
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
                    <svg xmlns="http://www.w3.org/2000/svg" width={isMobileView ? "14" : "12"} height={isMobileView ? "14" : "12"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-center h-full w-full p-0 ${isMobileView ? 'gap-0' : 'gap-0'}`}>
                <button
                  onClick={() => {
                    if (!isFuture) {
                      const current = getCounter(habit.id, dateString);
                      if (current > 0) setCounter(habit.id, dateString, current - 1);
                    }
                  }}
                  disabled={isFuture || getCounter(habit.id, dateString) === 0}
                  className={`${isMobileView ? 'w-4 h-6 text-xs' : 'w-3 h-4 text-[9px]'} flex items-center justify-center font-bold transition-colors ${isFuture || getCounter(habit.id, dateString) === 0
                    ? "opacity-20 cursor-not-allowed text-slate-400"
                    : "cursor-pointer text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  }`}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={getCounter(habit.id, dateString) || ""}
                  onChange={(e) => setCounter(habit.id, dateString, parseInt(e.target.value) || 0)}
                  disabled={isFuture}
                  onClick={(e) => e.currentTarget.select()}
                  className={`
                    ${isMobileView ? 'w-5 h-6 text-xs' : 'w-4 h-4 text-[9px]'} text-center border-0 focus:ring-1 focus:ring-indigo-500 bg-transparent p-0 font-mono
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${isFuture ? "text-slate-300 cursor-not-allowed" : "text-slate-700 dark:text-slate-200"}
                    ${getCounter(habit.id, dateString) > 0 ? "font-bold" : ""}
                  `}
                  placeholder="·"
                />
                <button
                  onClick={() => {
                    if (!isFuture) {
                      const current = getCounter(habit.id, dateString);
                      setCounter(habit.id, dateString, current + 1);
                    }
                  }}
                  disabled={isFuture}
                  className={`${isMobileView ? 'w-4 h-6 text-xs' : 'w-3 h-4 text-[9px]'} flex items-center justify-center font-bold transition-colors ${isFuture
                    ? "opacity-20 cursor-not-allowed text-slate-400"
                    : "cursor-pointer text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  }`}
                >
                  +
                </button>
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function CompactWeekView({
  habits,
  weekDates,
  today,
  toggleCompletion,
  isHabitCompleted,
  setCounter,
  getCounter,
  deleteHabit,
  reorderHabits,
  isMobileView = false,
  isTabletView = false,
}: {
  habits: Habit[];
  weekDates: Date[];
  today: Date;
  toggleCompletion: (habitId: string, date: string) => void;
  isHabitCompleted: (habitId: string, date: string) => boolean;
  setCounter: (habitId: string, date: string, count: number) => void;
  getCounter: (habitId: string, date: string) => number;
  deleteHabit: (id: string) => void;
  reorderHabits: (habits: Habit[]) => void;
  isMobileView?: boolean;
  isTabletView?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      reorderHabits(arrayMove(habits, oldIndex, newIndex));
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteHabit(id);
    }
  };

  const numDays = weekDates.length;

  const getHeaderBg = (idx: number) => {
    if (isMobileView) return "bg-slate-100 dark:bg-slate-800";
    const weekIdx = Math.floor(idx / 7);
    return weekIdx % 2 === 0
      ? "bg-[#f5f5f5] dark:bg-slate-800"
      : "bg-[#e5e5e5] dark:bg-slate-700";
  };

  const getCellBg = (weekIdx: number) => {
    if (isMobileView) return "bg-white dark:bg-slate-900";
    return weekIdx % 2 === 0
      ? "bg-[#f5f5f5] dark:bg-slate-800"
      : "bg-[#e5e5e5] dark:bg-slate-700";
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <table className="w-full border-collapse text-xs table-fixed">
        <colgroup>
          <col style={{ width: isMobileView ? '22%' : '18%' }} />
          {weekDates.map((_, idx) => (
            <col key={idx} style={{ width: isMobileView ? `${78 / numDays}%` : `${82 / numDays}%` }} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-20">
          <tr>
            <th rowSpan={2} className={`border border-slate-200 dark:border-slate-700 p-1 text-center bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 ${isMobileView ? 'text-[10px]' : 'text-xs'}`}>
              Habits
            </th>
            {Array.from({ length: Math.ceil(numDays / 7) }).map((_, weekIdx) => {
              const weekDaysCount = Math.min(7, numDays - weekIdx * 7);
              return (
                <th
                  key={weekIdx}
                  colSpan={weekDaysCount}
                  className={`border border-slate-200 dark:border-slate-700 py-0.5 px-0 text-center font-semibold text-[10px] ${getHeaderBg(weekIdx * 7)}`}
                >
                  <span className="text-slate-500 dark:text-slate-400">W{weekIdx + 1}</span>
                </th>
              );
            })}
          </tr>
          <tr>
            {weekDates.map((date, idx) => {
              const isToday = isSameDay(date, today);
              return (
                <th
                  key={idx}
                  className={`border border-slate-200 dark:border-slate-700 py-1.5 px-0.5 text-center ${isToday
                      ? "bg-indigo-500 text-white"
                      : `${getHeaderBg(idx)} text-slate-600 dark:text-slate-400`
                  }`}
                >
                  <div className={`font-medium ${isMobileView ? 'text-[9px]' : 'text-[10px]'}`}>{getDayName(date)}</div>
                  <div className={`font-bold ${isMobileView ? 'text-xs' : 'text-sm'}`}>{date.getDate()}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <SortableContext
          items={habits.map((h) => h.id)}
          strategy={verticalListSortingStrategy}
        >
          <tbody>
            {habits.map((habit) => (
              <SortableHabitRow
                key={habit.id}
                habit={habit}
                dates={weekDates}
                today={today}
                getWeekColor={getCellBg}
                onDelete={handleDelete}
                toggleCompletion={toggleCompletion}
                isHabitCompleted={isHabitCompleted}
                setCounter={setCounter}
                getCounter={getCounter}
                isMobileView={isMobileView}
                isTabletView={isTabletView}
              />
            ))}
          </tbody>
        </SortableContext>
      </table>
    </DndContext>
  );
}

interface MonthlyViewProps {
  onAddHabit?: () => void;
}

export default function MonthlyView({ onAddHabit }: MonthlyViewProps = {}) {
  const { habits, toggleCompletion, isHabitCompleted, deleteHabit, setCounter, getCounter, reorderHabits, isLoading } = useHabits();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    setCurrentDate(new Date());
    setToday(new Date());
    
    const checkViewMode = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewMode('mobile');
      } else if (width < 1280) {
        setViewMode('tablet');
      } else {
        setViewMode('desktop');
      }
    };
    
    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    return () => window.removeEventListener('resize', checkViewMode);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);

      reorderHabits(arrayMove(habits, oldIndex, newIndex));
    }
  };

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
    setWeekOffset(0);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteHabit(id);
    }
  };

  const getWeekDates = (weeksToShow: number): Date[] => {
    if (!today) return [];
    const currentWeek = getCurrentWeek();
    const dates: Date[] = [];
    
    for (let w = 0; w < weeksToShow; w++) {
      for (let d = 0; d < 7; d++) {
        const newDate = new Date(currentWeek[d]);
        newDate.setDate(currentWeek[d].getDate() + (weekOffset * 7) + (w * 7));
        dates.push(newDate);
      }
    }
    return dates;
  };

  const getWeekLabel = (weeksToShow: number): string => {
    const dates = getWeekDates(weeksToShow);
    if (dates.length === 0) return "";
    
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    if (weekOffset === 0 && weeksToShow === 1) return "This Week";
    if (weekOffset === -1 && weeksToShow === 1) return "Last Week";
    if (weekOffset === 1 && weeksToShow === 1) return "Next Week";
    
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  if (!currentDate || !today) {
    return null;
  }

  const monthWeeks = getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth());

  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

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
      ? "bg-[#f5f5f5] dark:bg-slate-800"
      : "bg-[#e5e5e5] dark:bg-slate-700";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading your habits...</p>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-900">
        {onAddHabit && (
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={onAddHabit}
              className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-3xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95 transition-all duration-200 border border-indigo-400/20"
              aria-label="Create your first habit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 to-white/10 pointer-events-none"></div>
            </button>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Create Your First Habit</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Start building better routines today</p>
            </div>
        </div>
        )}
      </div>
    );
  }

  if (viewMode === 'mobile' || viewMode === 'tablet') {
    const weeksToShow = viewMode === 'mobile' ? 1 : 2;
    const weekDates = getWeekDates(weeksToShow);
    
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 transition-all"
            >
              ←
            </button>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[90px] text-center">
              {getWeekLabel(weeksToShow)}
            </h2>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 transition-all"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalHabits}</span> habits
            </span>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2 h-7 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold transition-all"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Week Table */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
          <CompactWeekView
            habits={habits}
            weekDates={weekDates}
            today={today}
            toggleCompletion={toggleCompletion}
            isHabitCompleted={isHabitCompleted}
            setCounter={setCounter}
            getCounter={getCounter}
            deleteHabit={deleteHabit}
            reorderHabits={reorderHabits}
            isMobileView={viewMode === 'mobile'}
            isTabletView={viewMode === 'tablet'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{getMonthYear(currentDate)}</h2>
          <div className="hidden sm:flex gap-3 text-xs">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalHabits}</span> habits
            </span>
            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600 dark:text-emerald-400">
              <span className="font-semibold">{completedCount}</span> done
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 transition-all"
          >
            ←
          </button>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="px-3 h-8 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-all"
            >
              Today
            </button>
          )}
          <button
            onClick={goToNextMonth}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 transition-all"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full border-collapse text-[10px] table-fixed">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800">
              <tr>
                <th rowSpan={2} className="border-r border-t border-l border-slate-300 dark:border-slate-600 p-1 text-center bg-slate-100 dark:bg-slate-800 font-bold text-xs w-[160px] text-slate-700 dark:text-slate-200 align-middle">
                  My Habits
                </th>
                {monthWeeks.map((week, weekIndex) => (
                  <th
                    key={weekIndex}
                    colSpan={week.length}
                    className={`border border-slate-300 dark:border-slate-600 py-0 px-0 text-center font-semibold text-[8px] text-slate-500 dark:text-slate-400 ${getWeekColor(weekIndex)}`}
                  >
                    {weekIndex < 4 ? `W${weekIndex + 1}` : 'Ex'}
                  </th>
                ))}
              </tr>
              <tr>
                {monthWeeks.map((week, weekIndex) =>
                  week.map((date, dayIndex) => {
                    const isToday = isSameDay(date, today);
                    return (
                      <th
                        key={`${weekIndex}-${dayIndex}`}
                        className={`border border-slate-300 dark:border-slate-600 py-0 px-0 text-center text-[7px] font-medium ${isToday
                            ? "bg-indigo-500 text-white"
                            : `${getWeekColor(weekIndex)} text-slate-500 dark:text-slate-400`
                          }`}
                      >
                        <div className={isToday ? "" : "opacity-70"}>{getDayName(date)}</div>
                        <div className="font-semibold text-[8px]">{date.getDate()}</div>
                      </th>
                    );
                  })
                )}
              </tr>
            </thead>
            <SortableContext
              items={habits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {habits.map((habit) => (
                  <SortableHabitRow
                    key={habit.id}
                    habit={habit}
                    dates={monthWeeks.flat()}
                    today={today}
                    getWeekColor={getWeekColor}
                    onDelete={handleDelete}
                    toggleCompletion={toggleCompletion}
                    isHabitCompleted={isHabitCompleted}
                    setCounter={setCounter}
                    getCounter={getCounter}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse text-[9px] table-fixed">
          <tbody>
            <tr>
              <td className="border-r border-slate-300 dark:border-slate-600 py-1 px-1.5 bg-slate-100 dark:bg-slate-800 font-semibold text-[10px] text-slate-600 dark:text-slate-300 w-[160px]">
                Progress
              </td>
              {monthWeeks.map((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const dateStr = formatDateToString(date);
                  const total = habits.length;
                  if (total === 0) return <td key={`${weekIndex}-${dayIndex}`} className={`border border-slate-300 dark:border-slate-600 ${getWeekColor(weekIndex)}`}></td>;

                  const completed = habits.filter(h =>
                    h.trackingType === 'checkbox' ? isHabitCompleted(h.id, dateStr) : getCounter(h.id, dateStr) > 0
                  ).length;
                  const percent = Math.round((completed / total) * 100);

                  return (
                    <td key={`${weekIndex}-${dayIndex}`} className={`border-t border-r border-slate-300 dark:border-slate-600 py-0.5 px-0 text-center text-[7px] ${getWeekColor(weekIndex)} ${percent === 100 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {percent}%
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
