# Changelog

## [Latest] - Code Refactoring: Extracted Date Parsing Helper

### Added

- **parseLocalDate Helper Function**: Centralized date parsing logic for consistent local timezone handling
  - Extracts "YYYY-MM-DD" string parsing into reusable utility function
  - Returns `Date` object in local timezone to avoid UTC conversion issues
  - Handles month offset (0-indexed) consistently across all usage

### Refactored

- **Eliminated Code Duplication**: Removed repeated date parsing logic from multiple functions
  - `getDaysUntilDeadline()`: Now uses `parseLocalDate()` helper
  - `formatDeadlineText()`: Now uses `parseLocalDate()` helper
  - `toggleDatePicker()`: Now uses `parseLocalDate()` helper
- **Improved Maintainability**: Single source of truth for date string parsing logic
- **Enhanced Consistency**: All date operations now use identical parsing approach

### Technical Benefits

- **DRY Principle**: Don't Repeat Yourself - eliminated 3 instances of duplicate code
- **Maintainability**: Future date parsing changes only need to be made in one place
- **Type Safety**: Helper function provides consistent `Date` return type
- **Timezone Safety**: All date parsing now guaranteed to use local timezone

### Code Quality Improvements

- **Reduced Lines of Code**: Consolidated 9+ lines of duplicate parsing into single helper
- **Better Abstraction**: Date parsing logic abstracted into meaningful function name
- **Easier Testing**: Helper function can be tested independently if needed

## [Previous] - Fixed Vuetify Component Access TypeScript Errors

### Fixed

- **TypeScript Component Access**: Fixed "Property '$el' does not exist" errors for Vuetify components
  - Changed template ref types from `HTMLInputElement` to `any` for Vuetify components
  - Added null checks for both component reference and `$el` property access
  - Ensured proper access to underlying DOM input elements within Vuetify components

### Technical Details

- **Root Cause**: Vuetify components don't directly expose `$el` property in TypeScript without proper typing
- **Solution**: Use `any` type for Vuetify component refs and add defensive null checking
- **Safety**: Added checks for both `component.value` and `component.value.$el` before DOM manipulation
- **Impact**: Eliminates TypeScript compilation errors while maintaining auto-focus functionality

### Modified Functions

- **startEditing()**: Added null check for `taskEditInput.value.$el` before querySelector
- **startSubtaskEditing()**: Added null check for `subtaskEditInput.value.$el` before querySelector

## [Previous] - Fixed Template Reference TypeScript Errors

### Fixed

- **Template References**: Added missing `taskEditInput` and `subtaskEditInput` template references
  - Resolved "Cannot find name 'taskEditInput'" TypeScript error
  - Resolved "Cannot find name 'subtaskEditInput'" TypeScript error
- **Type Safety**: Proper TypeScript declarations for input field references

### Technical Details

- **Root Cause**: Template refs were used in functions but not declared in script setup
- **Solution**: Added `ref<HTMLInputElement | null>(null)` declarations for both input fields
- **Impact**: Eliminates TypeScript compilation errors and enables proper auto-focus functionality

## [Previous] - Auto-Focus and Cursor Positioning for Editing

### Added

- **Auto-Focus on Edit**: Input fields automatically receive focus when editing starts
  - Task title editing: Cursor positioned at end of existing text
  - Subtask editing: Cursor positioned at end of existing text
- **Template References**: Added `ref` attributes to editing input fields for direct DOM access
- **Cursor Positioning**: Automatic cursor placement at end of text using `setSelectionRange()`

### Enhanced

- **User Experience**: Seamless editing flow without manual click to position cursor
- **Keyboard Navigation**: Users can immediately start typing when edit mode activates
- **Consistent Behavior**: Both task titles and subtasks use same auto-focus pattern

### Technical Implementation

- **Template Refs**: Added `taskEditInput` and `subtaskEditInput` refs for input field access
- **DOM Interaction**: Direct access to Vuetify input elements via `$el.querySelector('input')`
- **nextTick Usage**: Ensures DOM updates complete before focusing and positioning cursor
- **Selection Range**: Uses `setSelectionRange(length, length)` to position cursor at text end

### Modified Functions

- **startEditing()**: Enhanced with auto-focus and cursor positioning for task titles
- **startSubtaskEditing()**: Enhanced with auto-focus and cursor positioning for subtasks
- **Input Fields**: Added `ref` and `autofocus` attributes to editing text fields

## [Previous] - Date Picker Layout Optimization

### Enhanced

- **Date Picker Layout**: Redesigned date picker for better visual hierarchy and compactness
  - Moved action buttons directly below the calendar instead of bottom-right corner
  - Centered date picker and buttons for better visual balance
  - Reduced date picker width to 280px for more compact display
  - Added maximum width constraint (320px) to date picker card container

### Improved

- **Visual Hierarchy**: Better organization of date picker elements
  - Calendar dates at the top
  - Action buttons (Remove/Set Deadline) immediately below dates
  - Centered alignment for all elements within the picker
- **User Experience**: More intuitive button placement closer to date selection area
- **Responsive Design**: Compact layout works better on different screen sizes

### Technical Changes

- **CSS Classes**: Added `.date-picker-card` styling for layout constraints
- **Flexbox Layout**: Used `flex-column` and `align-center` for vertical stacking
- **Width Constraints**: Set specific width (280px) for date picker component
- **Button Positioning**: Changed from `justify-end` to `justify-center` for button alignment

## [Previous] - Simplified Deadline Animations

### Removed

- **Pulse Animations**: Removed `urgentPulse` and `gentlePulse` animations for cleaner, less distracting UI
- **Animation Scaling Effects**: No more scaling transformations on deadline-urgent tasks
- **Complex Animation Combinations**: Simplified from multiple simultaneous animations to single effects

### Modified

- **Due Today Animation**: Now uses only spotlight background animation (3s cycle)
- **Due Tomorrow Styling**: Shows only blue border color without any animation
- **Hover Behavior**: Simplified hover effects without animation pause states

### Kept

- **Spotlight Effect**: Subtle background color animation for tasks due today
- **Border Color Indicators**: Orange border for today, blue border for tomorrow
- **Dynamic Animation Classes**: `getTaskAnimationClass()` function still determines styling based on deadline urgency

### Technical Changes

- **CSS Simplification**: Removed `urgentPulse` and `gentlePulse` keyframe definitions
- **Class Updates**: `.task-due-today` now only applies spotlight animation and border color
- **Performance Improvement**: Fewer CSS animations running simultaneously reduces resource usage

## [Previous] - Deadline Urgency Animations

### Added

- **Pulse Animation**: Tasks due today display an urgent pulse effect with orange accent
- **Spotlight Animation**: Tasks due today also feature a subtle background spotlight effect
- **Gentle Pulse**: Tasks due tomorrow show a gentler blue pulse animation
- **Dynamic Animation Classes**: `getTaskAnimationClass()` function determines appropriate animation based on deadline urgency

### Enhanced

- **Visual Urgency Indicators**: Animations provide immediate visual cues for deadline proximity
- **Border Color Changes**: Task cards show colored borders matching their urgency level
- **Hover Interaction**: Animations pause on hover to prevent distraction during interaction
- **Performance Optimized**: Animations only apply to incomplete tasks with deadlines

### Technical Implementation

- **CSS Keyframes**: Three animation types - `urgentPulse`, `spotlight`, and `gentlePulse`
- **Conditional Styling**: Animations applied via dynamic class binding based on `getDaysUntilDeadline()`
- **Animation Timing**: Due today (2s urgent pulse + 3s spotlight), Due tomorrow (3s gentle pulse)
- **User Experience**: Animations pause on hover to allow comfortable interaction

### Animation Details

- **Due Today**: Orange border + urgent pulse (scale 1.02) + spotlight background effect
- **Due Tomorrow**: Blue border + gentle pulse (scale 1.01) with blue shadow
- **Other Tasks**: No animations, maintaining clean interface for non-urgent items

## [Previous] - TypeScript Error Fixes

### Fixed

- **Missing Functions**: Added missing `closeDatePicker` and `removeDeadline` functions to resolve TypeScript compilation errors
  - `closeDatePicker`: Closes the date picker modal and resets selected date
  - `removeDeadline`: Removes deadline from task and closes date picker
  - Both functions properly update reactive state and clear UI components

### Technical Details

- **Root Cause**: Functions were referenced in template but not defined in script setup
- **Solution**: Added proper function implementations with reactive state management
- **Impact**: Eliminates TypeScript compilation errors and ensures proper functionality

## [Previous] - Finalized Deadline Feature

### Removed

- **Debug Logging**: Removed temporary console.log statements from deadline functions
  - Cleaned up `getDaysUntilDeadline` function
  - Cleaned up `setDeadline` function
  - Code is now production-ready without debug output

### Confirmed Working

- **Deadline Display**: Correctly shows "Due today" when deadline is set to today's date
- **Tomorrow Display**: Correctly shows "Due tomorrow" when deadline is set to tomorrow
- **Future Dates**: Correctly shows "X days" for dates beyond tomorrow
- **Timezone Handling**: All date calculations work properly in local timezone

## [Previous] - Debug and Complete Timezone Fix

### Fixed

- **Date Picker Timezone Issues**: Fixed remaining timezone issues in date picker functions
  - `toggleDatePicker`: Now parses existing deadline dates in local timezone when opening picker
  - `setDeadline`: Uses manual date formatting to avoid timezone conversion issues
  - Added debug logging to `getDaysUntilDeadline` to track date calculation issues

### Added

- **Debug Logging**: Temporary console logs to diagnose date calculation problems
  - Shows task deadline, today's date, and calculated difference
  - Helps identify where timezone conversion is occurring

### Technical Details

- **Root Cause**: Multiple functions were still using Date constructors that could cause UTC conversion
- **Solution**: Consistent local timezone parsing across all date-related functions
- **Impact**: Successfully achieved correct date display behavior

## [Earlier] - Complete Timezone Date Fix

### Fixed

- **Date Formatting Timezone Issue**: Fixed `formatDeadlineText` function to use timezone-safe date parsing
  - Applied same local timezone parsing approach as used in `getDaysUntilDeadline`
  - Prevents UTC conversion issues that caused "today" deadlines to show as "overdue yesterday"
  - Ensures consistent date handling across all deadline-related functions

### Technical Details

- **Root Cause**: `formatDeadlineText` was still using `new Date(task.deadline)` which could interpret dates in UTC
- **Solution**: Parse date string components manually and create Date object in local timezone
- **Impact**: Now correctly displays "Due today" when deadline is set to today's date

## [Original] - Date Calculation Fix

### Fixed

- **Deadline Date Calculation**: Fixed off-by-one error in deadline calculation
  - Setting today's date now correctly shows "Due today" instead of "Overdue"
  - Setting tomorrow's date now shows "Due tomorrow" instead of "Due today"
  - Changed from `Math.ceil` to `Math.floor` in `getDaysUntilDeadline` function for accurate day counting
  - Ensures proper date logic: same day = 0 days, tomorrow = 1 day, day after = 2 days
- **Action Button Group**: Added calendar icon button for deadline management
- **Task Display**: Enhanced task cards with deadline information chips and urgency indicators

### Removed

- **Number-Based Sorting**: Removed the previous sorting system based on numbered task titles
- **extractTaskNumber Function**: No longer needed with new deadline-based sorting

### Technical Improvements

- **Date Validation**: Date picker restricted to current week (today through next Sunday)
- **Reactive State Management**: Proper reactivity for deadline-related state changes
- **LocalStorage Compatibility**: Backward compatible with existing tasks (adds deadline fields seamlessly)
- **Clean UI Design**: Maximized use of Vuetify components for consistent styling and UX

### UI/UX Enhancements

- **Visual Hierarchy**: Clear deadline urgency through color-coded chips and icons
- **Intuitive Controls**: Easy-to-use date picker with set/remove deadline options
- **Responsive Design**: Maintains clean layout across different screen sizes
- **Accessibility**: Proper color contrast and icon usage for deadline status indication

## DailyTasks Component Implementation

### Features Implemented ✅

#### 1. Text Input and Add Button

- **Added**: Text field with "New Task" label using Vuetify `v-text-field`
- **Added**: Plus button (`mdi-plus` icon) to add new tasks
- **Enhanced**: Enter key support for quick task addition
- **Layout**: 10/2 column split for optimal space usage

#### 2. Task List Display with Local Storage

- **Added**: Dynamic task list using Vuetify `v-list` component
- **Added**: Persistent storage using localStorage
- **Added**: Auto-load tasks on component mount via `onMounted()`
- **Added**: Auto-save tasks on any change via `watch()` with deep watching
- **Added**: Empty state with helpful message when no tasks exist

#### 3. Checkbox with Strike-through

- **Added**: Checkbox for each task using `v-checkbox`
- **Added**: Strike-through styling when task is marked as done
- **Added**: Visual feedback with reduced text emphasis for completed tasks
- **Styling**: `text-decoration-line-through text-medium-emphasis` classes

#### 4. Delete Functionality

- **Added**: Delete button with trash icon (`mdi-delete`) for each task
- **Added**: Confirmation-free deletion for quick task removal
- **Styling**: Red error color for visual indication

### Technical Implementation

#### TypeScript Interface

```typescript
interface Task {
  id: string; // Unique identifier using uuid
  text: string; // Task description
  done: boolean; // Completion status
}
```

#### Key Functions

- `addTask()`: Adds new task with UUID, clears input
- `deleteTask(id)`: Removes task by ID from array
- `toggleDone(id)`: Toggles completion status
- `onMounted()`: Loads saved tasks from localStorage
- `watch()`: Auto-saves tasks to localStorage on any change

#### Vuetify Components Used

- `v-container`, `v-row`, `v-col` for responsive layout
- `v-text-field` for task input
- `v-btn` for add and delete buttons
- `v-list`, `v-list-item` for task display
- `v-checkbox` for completion toggle
- `v-card` for empty state

### Bug Fixes Applied

- **Fixed**: Removed JavaScript-style comments from Vue template
- **Fixed**: Proper localStorage timing (save after array update)
- **Fixed**: Correct Vuetify slot usage (`v-slot:prepend`, `v-slot:append`)

### User Experience Enhancements

- **Responsive Design**: Works on mobile and desktop
- **Visual Feedback**: Color-coded buttons and completion states
- **Keyboard Support**: Enter key to add tasks
- **Empty State**: Helpful message when no tasks exist
- **Persistent Data**: Tasks survive browser refresh/restart

## UI/UX Fixes Applied

### Material Design Icons Setup

- **Added**: `@mdi/font` package for Material Design Icons
- **Fixed**: Vuetify icon configuration in main.ts
- **Fixed**: Add button now shows proper plus icon instead of "ADD" text
- **Enhanced**: All icons now render correctly throughout the app

### List Styling Improvements

- **Fixed**: Task list now properly renders with Vuetify styling
- **Added**: Card container around task list for better visual separation
- **Enhanced**: Improved list item spacing and alignment
- **Added**: `lines="one"` and `hide-details` for cleaner checkbox appearance

### Button Fixes

- **Fixed**: Removed conflicting text content from icon button
- **Enhanced**: Proper icon-only button rendering
- **Improved**: Better visual consistency across all buttons
- **Fixed**: Add button now displays as a perfect square (56x56px)
- **Enhanced**: Better alignment with text input using `no-gutters` and padding
- **Added**: Square button styling with rounded corners (4px border-radius)

### Strike-through Functionality Fix

- **Fixed**: Task completion toggle now works properly
- **Removed**: Redundant `toggleDone` function that was causing conflicts
- **Enhanced**: Direct v-model binding for smoother checkbox interaction
- **Added**: Smooth transition effect for strike-through animation

### DailyTasks Container Height Adjustment

- Set the DailyTasks container to a fixed height of 400px for consistent layout. Added `overflow-y: auto` to allow scrolling when tasks exceed the visible area.

## CustomCountdown Component Migration

### Summary of Changes

- Converted `CustomCountdown.vue` to use `<script lang="ts">` and Vue 3 Composition API.
- Replaced all Firebase DB operations with localStorage for countdown CRUD.
- Added TypeScript interfaces and updated all logic to use composition API.
- Updated comments to indicate where code was changed or added.
- Removed BottomNav component import and usage from CustomCountdown.vue.
- Refactored CustomCountdown.vue to use `<script setup lang="ts">` syntax for Composition API.
- Target Date field now always defaults to today's date and resets to today's date after adding a countdown.
- Countdown cards now use full width and Vuetify 3 card styling for improved layout.

## WeeklyProgressTasks Component Implementation

### Features Implemented ✅

#### 1. Task and Subtask Management

- **Added**: Support for subtasks in `WeeklyProgressTasks.vue`
- **Added**: Functionality to add, delete, and toggle completion of subtasks
- **Enhanced**: Visual distinction between tasks and subtasks
- **Styling**: Indentation and reduced font size for subtasks

#### 2. Progress Tracking

- **Added**: Linear progress bar for each task based on subtask completion
- **Enhanced**: Dynamic updating of task progress when subtasks are completed
- **Visuals**: Clear indication of task and subtask relationships

### Technical Implementation

#### TypeScript Interface

```typescript
interface Subtask {
  id: string; // Unique identifier using uuid
  text: string; // Subtask description
  done: boolean; // Completion status
}

interface Task {
  id: string; // Unique identifier using uuid
  text: string; // Task description
  done: boolean; // Completion status
  subtasks: Subtask[]; // List of subtasks
}
```

#### Key Functions

- `addTask()`: Adds new task with UUID, clears input
- `deleteTask(id)`: Removes task by ID from array
- `toggleDone(id)`: Toggles completion status
- `addSubtask(taskId)`: Adds new subtask to a task
- `deleteSubtask(taskId, subtaskId)`: Removes subtask by ID
- `toggleSubtaskDone(taskId, subtaskId)`: Toggles subtask completion status
- `onMounted()`: Loads saved tasks from localStorage
- `watch()`: Auto-saves tasks to localStorage on any change

#### Vuetify Components Used

- `v-container`, `v-row`, `v-col` for responsive layout
- `v-text-field` for task and subtask input
- `v-btn` for add and delete buttons
- `v-list`, `v-list-item` for task and subtask display
- `v-checkbox` for completion toggle
- `v-card` for empty state
- `v-progress-linear` for task progress indication

### Bug Fixes Applied

- **Fixed**: Removed JavaScript-style comments from Vue template
- **Fixed**: Proper localStorage timing (save after array update)
- **Fixed**: Correct Vuetify slot usage (`v-slot:prepend`, `v-slot:append`)
- **Fixed**: Vuetify slot error in WeeklyProgressTasks.vue by moving all direct children (including v-list-item-title and v-text-field) into the default slot of v-list-item.
- **Fixed**: Subtask add button in WeeklyProgressTasks.vue: replaced icon prop with <v-icon> inside <v-btn> and ensured new tasks always have a subtasks array.
- Fixed subtasks visibility toggle in WeeklyProgressTasks.vue by setting default subtasksCollapsed to true (hidden) for new tasks
- Added migration logic to ensure existing tasks have proper subtasksCollapsed property when loaded from localStorage

### User Experience Enhancements

- **Responsive Design**: Works on mobile and desktop
- **Visual Feedback**: Color-coded buttons and completion states
- **Keyboard Support**: Enter key to add tasks
- **Empty State**: Helpful message when no tasks exist
- **Persistent Data**: Tasks survive browser refresh/restart
- **Progress Indication**: Visual progress tracking for tasks
- **Compact UI**: Reduced spacing and smaller components for a more compact layout
- **Subtask Input Control**: Subtask input field only shows when + button is pressed, with a cancel option
- **Button Layout**: Edit and delete buttons moved next to the main task title for better layout
- **Button Size**: Reduced button sizes for improved overall compactness
- Improved WeeklyProgressTasks.vue UI: Added proper spacing between edit/delete buttons, increased button sizes for better clickability
- Made progress bar thicker (12px) and more visible with better colors and rounded corners
- Left-aligned subtasks instead of center alignment
- Enhanced button spacing and sizing throughout the component
- Moved the + button (add subtask) in WeeklyProgressTasks.vue to be positioned next to the edit/delete buttons, specifically to the left of the pencil (edit) button for better accessibility.
- Moved the show/hide subtasks toggle button in WeeklyProgressTasks.vue to be grouped with other action buttons (delete, pencil, plus) for better UI organization
- Reduced button gap spacing from 8px to 4px for more compact layout
- The main task checkbox is already positioned next to the title via the prepend slot
- Removed main task checkbox from WeeklyProgressTasks.vue, keeping only subtask checkboxes
- Show percentage text outside progress bar when 0% for better visibility
- Changed progress bar text color to black when progress < 50% and white when >= 50% for better contrast
- Removed red border from progress bar when no subtasks are completed in WeeklyProgressTasks.vue
- Added consistent grey border to progress bar to make empty portion always visible
- Progress bar now has uniform styling regardless of completion status

## [Unreleased]

### Added

- Enhanced task creation with comma-separated input parsing
  - First value becomes the main task title
  - Subsequent comma-separated values automatically become subtasks
  - Automatic whitespace trimming for clean task and subtask names
  - Empty values are filtered out to prevent blank entries
- **NEW**: Numbered list parsing and automatic sorting
  - Detects numbered items in format "1. Task name"
  - Automatically sorts tasks and subtasks by their numbers
  - Supports mixed numbered and non-numbered items
  - Non-numbered items are placed after numbered ones
- **ENHANCED**: Advanced task sorting with numbered priority
  - Numbered tasks (1. 2. 3. etc.) always appear at the top in ascending numerical order
  - Non-numbered tasks maintain their original creation order
  - Completed tasks are sorted separately but maintain the same priority rules

### Changed

- Modified `addTask()` function to parse comma-separated input
- Subtasks are now automatically expanded when created from comma-separated input
- **Enhanced**: Added intelligent parsing for numbered lists with automatic sorting
- **IMPROVED**: Enhanced `sortedTasks` computed property for better task organization
  - Added `extractTaskNumber()` helper function for reliable number extraction
  - Implemented priority-based sorting: numbered tasks first, then non-numbered
  - Preserved original order for non-numbered tasks within completion groups

### Fixed

- **CRITICAL**: Fixed task title editing persistence issue
  - Task title changes now properly save to localStorage and persist after page reload
  - Updated `saveEdit()` function to correctly update the reactive tasks array
  - Ensured proper reactivity triggers for localStorage synchronization
- **TypeScript Checkbox Error Fix**: Resolved TypeScript compilation error in WeeklyProgressTasks component
  - Fixed `$event` type error where v-checkbox emits `boolean | null` but function expected only `boolean`
  - Updated `updateSubtaskDone` function signature to accept `boolean | null` parameter
  - Added null coalescing operator (`??`) to convert null values to false
  - Used nullish coalescing in template to handle null case: `$event ?? false`
  - Ensured type safety while maintaining existing checkbox functionality

### Technical Details

- Added input parsing logic that splits on commas and creates subtask objects
- Maintained existing UUID generation for both main tasks and subtasks
- Preserved existing task structure and properties
- **NEW**: Added `parseNumberedItem()` helper function to extract numbers and text
- **NEW**: Added sorting logic that respects numerical order when numbers are present
- **NEW**: Handles mixed content (some numbered, some not) gracefully
- **ENHANCED**: Advanced sorting algorithm that maintains task hierarchy and completion status
- **FIXED**: Improved reactivity in task editing to ensure proper localStorage persistence
- Modified `updateSubtaskDone` function to handle `boolean | null` input type
- Added proper null handling with fallback to `false` for consistent behavior
- Updated template binding to use nullish coalescing operator
- Maintained existing reactivity and localStorage persistence functionality

### Examples

- Tasks with numbers "3. Task C", "1. Task A", "2. Task B" will display as: "1. Task A", "2. Task B", "3. Task C"
- Mixed tasks "Task X", "2. Priority", "Task Y", "1. Urgent" will display as: "1. Urgent", "2. Priority", "Task X", "Task Y"
- Completed tasks maintain the same sorting rules but appear after incomplete tasks
- Edited task titles now persist correctly after page refresh
