import { TrackingType } from "@/types/habit";

export interface PresetHabit {
  name: string;
  icon: string;
  color: string;
  trackingType: TrackingType;
  description: string;
}

export const PRESET_HABITS: PresetHabit[] = [
  {
    name: "Morning Workout",
    icon: "🏃",
    color: "#EF4444",
    trackingType: "checkbox",
    description: "Exercise or workout session"
  },
  {
    name: "Drink Water",
    icon: "💧",
    color: "#3B82F6",
    trackingType: "counter",
    description: "Track glasses of water"
  },
  {
    name: "Read Books",
    icon: "📚",
    color: "#8B5CF6",
    trackingType: "checkbox",
    description: "Daily reading habit"
  },
  {
    name: "Meditation",
    icon: "🧘",
    color: "#10B981",
    trackingType: "checkbox",
    description: "Mindfulness practice"
  },
  {
    name: "Sleep 8 Hours",
    icon: "💤",
    color: "#6366F1",
    trackingType: "checkbox",
    description: "Get enough sleep"
  },
  {
    name: "Healthy Meal",
    icon: "🥗",
    color: "#84CC16",
    trackingType: "checkbox",
    description: "Eat nutritious food"
  },
  {
    name: "No Smoking",
    icon: "🚭",
    color: "#EF4444",
    trackingType: "checkbox",
    description: "Stay smoke-free"
  },
  {
    name: "Cigarettes Smoked",
    icon: "🚬",
    color: "#F59E0B",
    trackingType: "counter",
    description: "Track to reduce"
  },
  {
    name: "Journal Writing",
    icon: "📝",
    color: "#F59E0B",
    trackingType: "checkbox",
    description: "Daily journaling"
  },
  {
    name: "Study Session",
    icon: "🎯",
    color: "#EC4899",
    trackingType: "checkbox",
    description: "Focused study time"
  },
  {
    name: "Deep Work",
    icon: "💼",
    color: "#14B8A6",
    trackingType: "checkbox",
    description: "Productive work session"
  },
  {
    name: "Practice Music",
    icon: "🎸",
    color: "#A855F7",
    trackingType: "checkbox",
    description: "Musical practice"
  },
  {
    name: "Create Art",
    icon: "🎨",
    color: "#F43F5E",
    trackingType: "checkbox",
    description: "Artistic activities"
  },
  {
    name: "Self Care",
    icon: "🌱",
    color: "#10B981",
    trackingType: "checkbox",
    description: "Personal wellness"
  },
  {
    name: "Walk Steps",
    icon: "👟",
    color: "#06B6D4",
    trackingType: "counter",
    description: "Daily steps (in thousands)"
  },
  {
    name: "Coffee Intake",
    icon: "☕",
    color: "#92400E",
    trackingType: "counter",
    description: "Cups of coffee"
  },
  {
    name: "Screen Time",
    icon: "📱",
    color: "#7C3AED",
    trackingType: "counter",
    description: "Hours on devices"
  },
  {
    name: "Learn Languages",
    icon: "🗣️",
    color: "#059669",
    trackingType: "checkbox",
    description: "Language practice"
  }
];


