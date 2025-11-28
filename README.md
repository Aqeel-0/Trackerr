# Habit Tracker

A modern, beautiful habit tracking web application built with Next.js 15, TypeScript, and Tailwind CSS. Track your daily habits, visualize your progress, and build better routines.

## Features

### Core Functionality
- **Add Multiple Habits**: Create unlimited habits with names, descriptions, and custom colors
- **Weekly Tracking**: Track habit completion for each day of the week with checkboxes
- **Week Navigation**: Navigate between past and future weeks to view and update records
- **Data Persistence**: All data is automatically saved to localStorage
- **Summary Dashboard**: View comprehensive statistics and progress for all habits

### Habit Statistics
- **Completion Rate**: Percentage of days you've completed each habit
- **Current Streak**: Consecutive days of habit completion
- **Longest Streak**: Your best streak for each habit
- **Total Completions**: Overall count of completed days
- **Visual Progress Bars**: Color-coded progress indicators
- **Performance Feedback**: Motivational messages based on your progress

### User Experience
- **Clean, Modern UI**: Beautiful gradient backgrounds and smooth transitions
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Color Customization**: 8 preset colors for habit categorization
- **Today Highlighting**: Current day is highlighted for easy reference
- **Future Date Prevention**: Can't check off habits for future dates

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Storage**: localStorage
- **Date Utilities**: Custom date manipulation functions

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
tracker/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout with HabitProvider
│   └── page.tsx             # Main page with tab navigation
├── components/
│   ├── AddHabitForm.tsx     # Form to create new habits
│   ├── HabitList.tsx        # Display and manage habit list
│   ├── WeeklyView.tsx       # Weekly calendar with checkboxes
│   └── Summary.tsx          # Statistics and progress dashboard
├── contexts/
│   └── HabitContext.tsx     # React Context for state management
├── types/
│   └── habit.ts             # TypeScript interfaces
├── utils/
│   └── dateUtils.ts         # Date manipulation helpers
└── package.json
```

## Usage Guide

### Adding a Habit

1. Navigate to the "Habit Tracker" tab
2. Fill in the habit name (required)
3. Optionally add a description
4. Choose a color for the habit
5. Click "Add Habit"

### Tracking Habits

1. In the weekly view, find your habit in the left column
2. Click the checkbox for any day to mark it complete
3. Click again to unmark
4. Use the Previous/Next buttons to navigate between weeks
5. Click "Go to Current Week" to return to today

### Viewing Statistics

1. Click the "Summary" tab
2. View detailed statistics for each habit:
   - Completion rate
   - Total days tracked
   - Completed days
   - Current streak
   - Longest streak
3. See overall summary at the bottom

### Deleting a Habit

1. In the "My Habits" section
2. Click the "Delete" button next to any habit
3. Confirm the deletion

## Best Practices

### Code Quality
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Organization**: Clean separation of concerns
- **Context API**: Centralized state management
- **Custom Hooks**: Reusable logic with `useHabits` hook
- **Utility Functions**: DRY principle with date utilities

### Performance
- **Client Components**: Marked with "use client" for interactivity
- **Lazy Loading**: Efficient rendering with conditional displays
- **Optimized Callbacks**: useMemo and useCallback for performance
- **Local Storage**: Fast, instant data persistence

### Accessibility
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant colors in both themes

## Data Storage

All habit data is stored in your browser's localStorage:
- **Key**: `habit-tracker-habits` - Stores habit definitions
- **Key**: `habit-tracker-completions` - Stores completion records

Data persists across browser sessions but is device-specific. To backup or transfer data, you would need to implement export/import functionality.

## Customization

### Adding More Colors

Edit `components/AddHabitForm.tsx`:

```typescript
const PRESET_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  // Add more hex colors here
];
```

### Changing Week Start Day

Edit `utils/dateUtils.ts` in the `getWeekStart` function to change from Monday to Sunday or another day.

### Modifying Stats Calculations

Edit `contexts/HabitContext.tsx` in the `getHabitStats` function to add custom metrics.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential features to add:
- Export/import data functionality
- Habit categories and tags
- Notes for each completion
- Monthly and yearly views
- Data visualization charts
- Habit reminders
- Multi-user support with authentication
- Cloud sync across devices

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

Built with ❤️ using Next.js and modern web technologies.
