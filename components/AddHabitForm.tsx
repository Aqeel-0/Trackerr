"use client";

import { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { TrackingType } from "@/types/habit";
import { PRESET_HABITS, ICON_OPTIONS } from "@/data/presetHabits";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", 
  "#10b981", "#06b6d4", "#3b82f6", "#84cc16", "#f97316",
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
      setName("");
      setIcon("🎯");
      setTrackingType("checkbox");
      if (onSuccess) onSuccess();
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_HABITS[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setTrackingType(preset.trackingType);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {showPresets && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Quick Add</label>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-36 sm:max-h-44 overflow-y-auto pr-1">
            {PRESET_HABITS.slice(0, 8).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-left transition-all duration-200 active:scale-[0.98]"
              >
                <span className="text-base sm:text-lg">{preset.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!showPresets && (
        <button
          type="button"
          onClick={() => setShowPresets(true)}
          className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          + Show presets
        </button>
      )}

      <div className="relative py-2 sm:py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-500">or create custom</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Icon</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl hover:border-indigo-500 transition-all duration-200 bg-slate-50 dark:bg-slate-700 active:scale-95"
            >
              {icon}
            </button>
            <p className="flex-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center">
              Tap to choose a symbol
            </p>
          </div>
          {showIconPicker && (
            <div className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 grid grid-cols-7 sm:grid-cols-8 gap-1 sm:gap-1.5 max-h-32 sm:max-h-36 overflow-y-auto shadow-lg animate-scale-in">
              {ICON_OPTIONS.map((iconOption, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIcon(iconOption);
                    setShowIconPicker(false);
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-all text-base sm:text-lg active:scale-90"
                >
                  {iconOption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="habit-name" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Habit Name
          </label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Exercise"
            className="input-field text-sm sm:text-base"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTrackingType("checkbox")}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                trackingType === "checkbox"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">✓</span>
              <span className="font-semibold text-xs sm:text-sm">Checkbox</span>
              <span className="text-[10px] sm:text-xs opacity-70">Yes/No</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingType("counter")}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                trackingType === "counter"
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">#</span>
              <span className="font-semibold text-xs sm:text-sm">Counter</span>
              <span className="text-[10px] sm:text-xs opacity-70">Track quantity</span>
            </button>
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-3 sm:py-3.5 text-sm sm:text-base font-semibold mt-1 sm:mt-2">
          Create Habit
        </button>
      </form>
    </div>
  );
}
