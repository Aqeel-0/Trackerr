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
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

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
    addHabit({
      name: preset.name,
      description: "",
      color: getRandomColor(),
      icon: preset.icon,
      trackingType: preset.trackingType,
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mode Toggle */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("preset")}
          className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === "preset"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Quick Pick
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === "custom"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Custom
        </button>
      </div>

      {mode === "preset" ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Tap a habit to add it instantly
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_HABITS.slice(0, 8).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl text-left transition-all duration-200 active:scale-[0.98] group"
              >
                <span className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 rounded-lg text-xl transition-colors">
                  {preset.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {preset.trackingType === "checkbox" ? "Daily check" : "Count"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon + Name Row */}
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={`w-14 h-14 flex-shrink-0 border-2 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 active:scale-95 ${
                showIconPicker
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-400"
              }`}
            >
              {icon}
            </button>
            <div className="flex-1">
              <input
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Habit name..."
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl animate-scale-in">
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
                {ICON_OPTIONS.map((iconOption, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIcon(iconOption);
                      setShowIconPicker(false);
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all active:scale-90 ${
                      icon === iconOption
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-white dark:hover:bg-slate-600"
                    }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type Selection - Segmented Control Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Tracking Type
            </label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
              <button
                type="button"
                onClick={() => setTrackingType("checkbox")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 ${
                  trackingType === "checkbox"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">✓</span>
                <span className="text-sm font-semibold">Checkbox</span>
              </button>
              <button
                type="button"
                onClick={() => setTrackingType("counter")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 ${
                  trackingType === "counter"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">#</span>
                <span className="text-sm font-semibold">Counter</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            Create Habit
          </button>
        </form>
      )}
    </div>
  );
}
