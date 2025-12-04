"use client";

import { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
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
import DeleteConfirmModal from "./DeleteConfirmModal";

interface SortableHabitItemProps {
  habit: Habit;
  onDelete: (id: string, name: string) => void;
}

function SortableHabitItem({ habit, onDelete }: SortableHabitItemProps) {
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
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? "relative" as const : "static" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all ${isDragging ? "shadow-xl ring-2 ring-indigo-500 opacity-80" : ""
        }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>

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
        onClick={() => onDelete(habit.id, habit.name)}
        className="flex-shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        aria-label={`Delete ${habit.name}`}
      >
        Delete
      </button>
    </div>
  );
}

export default function HabitList() {
  const { habits, deleteHabit, reorderHabits } = useHabits();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name: string } | null>(null);

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
    setHabitToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No habits yet. Add your first habit above!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={habits.map((h) => h.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {habits.map((habit) => (
            <SortableHabitItem
              key={habit.id}
              habit={habit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
      
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        habitName={habitToDelete?.name || ""}
      />
    </DndContext>
  );
}
