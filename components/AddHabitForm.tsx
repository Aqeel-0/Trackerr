"use client";

import { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { TrackingType } from "@/types/habit";
import { PRESET_HABITS } from "@/data/presetHabits";
import EmojiPicker, { Theme } from "emoji-picker-react";

const CATEGORIES = [
  { name: "Health", color: "#10b981", icon: "💪" }, // Emerald
  { name: "Work", color: "#3b82f6", icon: "💼" },   // Blue
  { name: "Mindfulness", color: "#8b5cf6", icon: "🧘" }, // Violet
  { name: "Learning", color: "#f59e0b", icon: "📚" }, // Amber
  { name: "Social", color: "#ec4899", icon: "👥" }, // Pink
  { name: "Other", color: "#64748b", icon: "✨" }, // Slate
];

interface AddHabitFormProps {
  onSuccess?: () => void;
}

export default function AddHabitForm({ onSuccess }: AddHabitFormProps) {
  const { addHabit } = useHabits();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState(CATEGORIES[5].color); // Default to 'Other' color
  const [category, setCategory] = useState("Other");
  const [trackingType, setTrackingType] = useState<TrackingType>("checkbox");
  const [targetCount, setTargetCount] = useState<string>("1");
  const [unit, setUnit] = useState<string>("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "templates">("create");
  const [customCategory, setCustomCategory] = useState<string>("");

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const finalCategory = category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

      addHabit({
        name: capitalizeFirstLetter(name.trim()),
        description: "",
        color,
        icon,
        trackingType,
        targetCount: trackingType === "counter" ? (parseInt(targetCount) || 1) : undefined,
        unit: trackingType === "counter" ? unit : undefined,
        category: finalCategory,
      });
      if (onSuccess) onSuccess();
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_HABITS[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setTrackingType(preset.trackingType);
    // Use the preset's color instead of defaulting to "Other"
    setColor(preset.color);
    setCategory("Other");
    setCustomCategory("");
    setActiveTab("create");
  };



  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex p-1 mx-6 mt-6 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "create"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
        >
          Create New
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "templates"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
        >
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Preview Section */}
            <div
              className="relative w-full max-w-sm p-4 rounded-3xl transition-all duration-300 shadow-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                borderColor: `${color}30`,
                borderWidth: '1px'
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-8xl">{icon}</span>
              </div>

              <div className="relative z-10 flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {name || "Habit Name"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {trackingType === "checkbox" ? "Daily Check-in" : `Target: ${targetCount} ${unit || "times"}`}
                  </p>
                  {(category || customCategory) && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300">
                      {category === "Other" && customCategory ? customCategory : category}
                    </span>
                  )}
                </div>
              </div>


            </div>


            {/* Main Inputs */}
            <div className="space-y-4">
              {/* Name & Icon */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Habit Name
                </label>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 flex items-center justify-center text-2xl transition-all"
                    >
                      {icon}
                    </button>
                    {showIconPicker && (
                      <div className="absolute top-full left-0 mt-2 z-50">
                        <div className="fixed inset-0 z-40" onClick={() => setShowIconPicker(false)} />
                        <div className="relative z-50 animate-in fade-in zoom-in-95 duration-200">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setIcon(emojiData.emoji);
                              setShowIconPicker(false);
                            }}
                            theme={Theme.AUTO}
                            width={300}
                            height={400}
                            searchDisabled={false}
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Read 30 mins"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name);
                        setColor(cat.color);
                        if (cat.name !== "Other") {
                          setCustomCategory("");
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${category === cat.name
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`text-xs font-medium ${category === cat.name ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Category Input */}
                {category === "Other" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name..."
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Tracking Type */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Goal Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTrackingType("checkbox")}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${trackingType === "checkbox"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${trackingType === "checkbox" ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Yes / No</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simple daily completion</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrackingType("counter")}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${trackingType === "counter"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${trackingType === "counter" ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                      <span className="text-lg font-bold">123</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">Numeric</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track specific values</div>
                  </button>
                </div>
              </div>

              {/* Counter Details */}
              {trackingType === "counter" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                      Daily Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetCount}
                      onChange={(e) => setTargetCount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="mins, pages, etc."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_HABITS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl text-left transition-all duration-200 group"
              >
                <span className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 rounded-xl text-2xl shadow-sm transition-colors">
                  {preset.icon}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {preset.trackingType === "checkbox" ? "Daily Check-in" : "Numeric Goal"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action */}
      {
        activeTab === "create" && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Create Habit</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        )
      }
    </div >
  );
}
