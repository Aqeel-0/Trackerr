"use client";

import { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { TrackingType } from "@/types/habit";
import { PRESET_HABITS, ICON_OPTIONS } from "@/data/presetHabits";

const PRESET_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#14B8A6", // teal
  "#A855F7", // purple
  "#F43F5E", // rose
];

const getRandomColor = () => {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
};

interface AddHabitFormProps {
  onSuccess?: () => void;
}

export default function AddHabitForm({ onSuccess }: AddHabitFormProps) {
  const { addHabit } = useHabits();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [trackingType, setTrackingType] = useState<TrackingType>("checkbox");
  const [showPresets, setShowPresets] = useState(true);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim()) {
      addHabit({
        name: capitalizeFirstLetter(name.trim()),
        description: "",
        color: getRandomColor(),
        icon: icon,
        trackingType,
      });

      // Reset form
      setName("");
      setIcon("🎯");
      setTrackingType("checkbox");
      
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_HABITS[0]) => {
    addHabit({
      name: preset.name,
      description: preset.description,
      color: preset.color,
      icon: preset.icon,
      trackingType: preset.trackingType,
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Habits */}
      {showPresets && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quick Add Presets</label>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {PRESET_HABITS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-left transition-all hover:shadow-sm group"
                title={preset.description}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!showPresets && (
        <button
          type="button"
          onClick={() => setShowPresets(true)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          <span>+</span> Show Preset Habits
        </button>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or Create Custom</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-gray-700"
            >
              {icon}
            </button>
            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Tap the icon to choose a different symbol for your habit.
            </div>
          </div>
          {showIconPicker && (
            <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 grid grid-cols-8 gap-2 max-h-40 overflow-y-auto custom-scrollbar shadow-lg">
              {ICON_OPTIONS.map((iconOption, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIcon(iconOption);
                    setShowIconPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-all text-lg"
                >
                  {iconOption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name
          </label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Exercise"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-shadow"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tracking Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTrackingType("checkbox")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                trackingType === "checkbox"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="font-semibold text-sm">✓ Checkbox</span>
              <span className="text-xs opacity-70 mt-1">Yes/No Completion</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingType("counter")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                trackingType === "counter"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="font-semibold text-sm"># Counter</span>
              <span className="text-xs opacity-70 mt-1">Track Quantity</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none mt-4"
        >
          Create Habit
        </button>
      </form>
    </div>
  );
}
