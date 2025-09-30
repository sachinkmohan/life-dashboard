# Changelog

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

### Technical Details

- Added input parsing logic that splits on commas and creates subtask objects
- Maintained existing UUID generation for both main tasks and subtasks
- Preserved existing task structure and properties
- **NEW**: Added `parseNumberedItem()` helper function to extract numbers and text
- **NEW**: Added sorting logic that respects numerical order when numbers are present
- **NEW**: Handles mixed content (some numbered, some not) gracefully
- **ENHANCED**: Advanced sorting algorithm that maintains task hierarchy and completion status
- **FIXED**: Improved reactivity in task editing to ensure proper localStorage persistence

### Examples

- Tasks with numbers "3. Task C", "1. Task A", "2. Task B" will display as: "1. Task A", "2. Task B", "3. Task C"
- Mixed tasks "Task X", "2. Priority", "Task Y", "1. Urgent" will display as: "1. Urgent", "2. Priority", "Task X", "Task Y"
- Completed tasks maintain the same sorting rules but appear after incomplete tasks
- Edited task titles now persist correctly after page refresh
