"use client";

import { useHabits } from "@/contexts/HabitContext";

export default function HabitList() {
  const { habits, deleteHabit } = useHabits();

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No habits yet. Add your first habit above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {habit.description}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                deleteHabit(habit.id);
              }
            }}
            className="flex-shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label={`Delete ${habit.name}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
