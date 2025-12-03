/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of the week (Saturday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = -day + 6; // Saturday is start of week
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diff);
  if (weekStart > d) {
    weekStart.setDate(weekStart.getDate() - 7);
  }
  return weekStart;
}

/**
 * Get array of dates for the current week starting from Saturday
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Get the day name from a date (2-letter format)
 */
export function getDayName(date: Date): string {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return days[date.getDay()];
}

/**
 * Get formatted date string for display
 */
export function getFormattedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateToString(date1) === formatDateToString(date2);
}

/**
 * Get month name and year
 */
export function getMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Get weeks for a month, starting from day 1
 * Returns: { regularWeeks: Date[][], extraDays: Date[] }
 * regularWeeks: Weeks 1-4 (days 1-28)
 * extraDays: Days 29, 30, 31 if they exist
 */
export function getMonthWeeks(year: number, month: number): Date[][] {
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const weeks: Date[][] = [];
  let currentDay = 1;

  // Weeks 1-4: days 1-28 (7 days each)
  for (let weekNum = 0; weekNum < 4; weekNum++) {
    const week: Date[] = [];
    for (let dayNum = 0; dayNum < 7; dayNum++) {
      if (currentDay <= daysInMonth) {
        week.push(new Date(year, month, currentDay));
        currentDay++;
      }
    }
    weeks.push(week);
  }

  // Extra days (29, 30, 31) if they exist
  const extraDays: Date[] = [];
  while (currentDay <= daysInMonth) {
    extraDays.push(new Date(year, month, currentDay));
    currentDay++;
  }

  // Add extra days as a separate section if they exist
  if (extraDays.length > 0) {
    weeks.push(extraDays);
  }

  return weeks;
}

/**
 * Get week number in month
 */
export function getWeekNumberInMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const weeks = getMonthWeeks(date.getFullYear(), date.getMonth());

  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].some(d => isSameDay(d, date))) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate streak from completion dates
 * Counts consecutive days ending at endDate (or yesterday if today not completed)
 */
export function calculateStreak(completionDates: string[], endDate: Date): number {
  if (completionDates.length === 0) return 0;

  const completionSet = new Set(completionDates);
  let streak = 0;
  let currentDate = new Date(endDate);
  const todayStr = formatDateToString(currentDate);
  
  // If today is not completed, start checking from yesterday
  // This allows the streak to continue if user hasn't logged today yet
  if (!completionSet.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive completed days going backwards
  while (true) {
    const checkDate = formatDateToString(currentDate);
    if (completionSet.has(checkDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the current week (7 days starting from Monday)
 */
export function getCurrentWeek(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today);

  // Calculate days to subtract to get to Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(today.getDate() - daysToMonday);

  // Get 7 days starting from Monday
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    week.push(date);
  }

  return week;
}

