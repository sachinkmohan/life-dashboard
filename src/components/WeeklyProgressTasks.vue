<template>
  <div>
    <!-- Modified: Added flex container for heading and progress indicator -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="ml-4">Weekly Focus</h2>
      <v-progress-circular
        :model-value="overallProgress"
        :size="50"
        :width="5"
        color="primary"
        bg-color="grey-lighten-3"
      >
        <!-- Added: Center text showing completion count using default slot -->
        <span class="text-body-1 font-weight-bold">
          {{ completedSubtasksCount }}/{{ totalSubtasksCount }}
        </span>
      </v-progress-circular>
    </div>
    <v-container style="width: 400px; overflow-x: auto">
      <v-row align="center" no-gutters>
        <v-col>
          <v-text-field
            label="New Task"
            v-model="newTask"
            @keyup.enter="addTask"
            variant="outlined"
            density="comfortable"
            style="height: 48px; min-height: 48px"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            class="ml-3"
            @click="addTask"
            color="primary"
            icon="mdi-plus"
            variant="elevated"
            style="
              height: 48px;
              width: 48px;
              min-width: 48px;
              min-height: 48px;
              border-radius: 8px;
            "
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <template v-if="tasks.length > 0">
            <!-- Modified: Individual cards for each task instead of single list -->
            <div v-for="task in sortedTasks" :key="task.id" class="mb-3">
              <!-- Modified: Add dynamic animation classes based on deadline urgency -->
              <v-card
                variant="outlined"
                class="task-block"
                :class="getTaskAnimationClass(task)"
              >
                <v-list density="compact">
                  <v-list-item class="py-1 px-4">
                    <!-- Removed: Main task checkbox (v-slot:prepend section) -->
                    <template #default>
                      <!-- Compact task title with inline edit/delete buttons -->
                      <div class="d-flex align-center justify-space-between">
                        <div class="flex-grow-1">
                          <!-- Modified: Added decoration and left alignment to main task title -->
                          <div
                            v-if="editingTaskId !== task.id"
                            class="task-title-container"
                          >
                            <div class="d-flex align-center">
                              <!-- Modified: Changed decorative icon based on deadline urgency -->
                              <v-icon
                                :color="getDeadlineUrgencyColor(task)"
                                size="small"
                                class="mr-2"
                              >
                                {{ getDeadlineIcon(task) }}
                              </v-icon>
                              <!-- Added: Decorated task title with better styling -->
                              <v-list-item-title
                                :style="
                                  task.done
                                    ? 'text-decoration: line-through; color: #888;'
                                    : 'color: #333; font-weight: 500;'
                                "
                                class="text-wrap break-word task-title"
                              >
                                {{ task.text }}
                              </v-list-item-title>
                            </div>
                            <!-- Added: Deadline display with days until deadline -->
                            <div class="deadline-info mt-1">
                              <v-chip
                                :color="getDeadlineChipColor(task)"
                                :variant="task.deadline ? 'flat' : 'outlined'"
                                size="small"
                                class="mr-2"
                              >
                                <v-icon start size="x-small"
                                  >mdi-calendar</v-icon
                                >
                                {{ formatDeadlineText(task) }}
                              </v-chip>
                            </div>
                            <!-- Added: Decorative underline for main task -->
                            <div class="task-underline"></div>
                          </div>
                          <v-text-field
                            v-else
                            v-model="editedTaskText"
                            density="compact"
                            hide-details
                            variant="outlined"
                            style="max-width: 250px"
                            ref="taskEditInput"
                            autofocus
                          />
                        </div>
                        <!-- Modified: Added date picker button to the action buttons group -->
                        <div class="d-flex" style="gap: 4px">
                          <!-- Modified: Grouped action buttons with consistent styling and spacing -->
                          <v-btn-group variant="outlined" density="compact">
                            <!-- Added: Date picker toggle button -->
                            <v-btn
                              size="small"
                              @click="toggleDatePicker(task)"
                              :color="
                                task.deadline ? 'success' : 'grey-darken-1'
                              "
                              icon="mdi-calendar"
                              min-width="32"
                            />
                            <!-- Added: mx-1 class for 2px spacing between buttons while preserving group border -->
                            <v-btn
                              size="small"
                              @click="toggleSubtasksCollapse(task)"
                              color="grey-darken-1"
                              :icon="
                                task.subtasksCollapsed
                                  ? 'mdi-chevron-down'
                                  : 'mdi-chevron-up'
                              "
                              min-width="32"
                            />
                            <!-- Added: mx-1 class for consistent spacing -->
                            <v-btn
                              size="small"
                              @click="toggleSubtaskInput(task)"
                              color="primary"
                              icon="mdi-plus"
                              min-width="32"
                            />
                            <!-- Added: mx-1 class for consistent spacing -->
                            <v-btn
                              v-if="editingTaskId !== task.id"
                              size="small"
                              @click="startEditing(task)"
                              color="primary"
                              icon="mdi-pencil"
                              min-width="32"
                            />
                            <v-btn
                              v-else
                              size="small"
                              @click="saveEdit(task)"
                              color="success"
                              icon="mdi-check"
                              min-width="32"
                            />
                            <!-- Added: mx-1 class for consistent spacing -->
                            <v-btn
                              v-if="editingTaskId === task.id"
                              size="small"
                              @click="cancelEdit"
                              color="grey"
                              icon="mdi-close"
                              min-width="32"
                            />
                            <!-- Added: mx-1 class for consistent spacing -->
                            <v-btn
                              size="small"
                              @click="deleteTask(task.id)"
                              color="error"
                              icon="mdi-delete"
                              min-width="32"
                            />
                          </v-btn-group>
                        </div>
                      </div>

                      <!-- Modified: Date picker component with improved layout -->
                      <div v-if="task.showDatePicker" class="mt-3">
                        <v-card
                          variant="outlined"
                          class="pa-3 date-picker-card"
                        >
                          <div
                            class="d-flex align-center justify-space-between mb-2"
                          >
                            <h4 class="text-h6">Set Deadline</h4>
                            <v-btn
                              icon="mdi-close"
                              size="x-small"
                              variant="text"
                              @click="closeDatePicker(task)"
                            />
                          </div>

                          <!-- Modified: Centered date picker with compact layout -->
                          <div class="d-flex flex-column align-center">
                            <v-date-picker
                              v-model="selectedDate"
                              :min="getCurrentDate()"
                              :max="getNextSundayDate()"
                              color="primary"
                              elevation="0"
                              hide-header
                              width="280"
                            />

                            <!-- Modified: Action buttons directly below the date picker, centered -->
                            <div
                              class="d-flex justify-center mb-5"
                              style="gap: 8px; width: 100%"
                            >
                              <v-btn
                                v-if="task.deadline"
                                color="error"
                                variant="outlined"
                                size="small"
                                @click="removeDeadline(task)"
                              >
                                Remove
                              </v-btn>
                              <v-btn
                                color="success"
                                variant="flat"
                                size="small"
                                @click="setDeadline(task)"
                                :disabled="!selectedDate"
                              >
                                Set Deadline
                              </v-btn>
                            </div>
                          </div>
                        </v-card>
                      </div>

                      <!-- Modified: Always show progress bar and percentage text for consistent UI -->
                      <div
                        v-if="task.subtasks && task.subtasks.length > 0"
                        class="mt-2"
                      >
                        <!-- Modified: Always show percentage text above progress bar for consistency -->
                        <div class="mb-1">
                          <span
                            style="
                              font-size: 0.8em;
                              color: #666;
                              font-weight: bold;
                            "
                          >
                            {{ getSubtaskProgress(task) }}% completed
                          </span>
                        </div>
                        <!-- Modified: Always render progress bar, removed percentage text from inside -->
                        <v-progress-linear
                          :model-value="getSubtaskProgress(task)"
                          height="12"
                          color="primary"
                          bg-color="grey-lighten-3"
                          class="mb-2"
                          rounded
                          style="border: 1px solid #ddd"
                        >
                          <!-- Removed: Percentage text from inside progress bar for consistent positioning -->
                        </v-progress-linear>
                      </div>

                      <!-- Enhanced: Left-aligned subtasks section -->
                      <div v-show="!task.subtasksCollapsed" class="ml-2">
                        <!-- Added: Show input only when + button is pressed -->
                        <div v-if="task.showSubtaskInput" class="mb-2 ma-5">
                          <v-row class="align-center" no-gutters>
                            <v-col cols="8">
                              <!-- Modified: Use reactive binding with computed getter/setter for proper reactivity -->
                              <v-text-field
                                :model-value="getSubtaskInputText(task)"
                                @update:model-value="
                                  updateSubtaskInputText(task, $event)
                                "
                                label="Add subtask or number range(check tip)"
                                density="compact"
                                hide-details
                                variant="outlined"
                                @keyup.enter="addSubtask(task)"
                                style="font-size: 0.9em"
                              />
                              <!-- Added: Subtle info text for number range expansion logic -->
                              <v-text
                                class="text-caption text-grey-darken-1 mt-1"
                                style="font-size: 0.85em"
                              >
                                Tip: Enter ranges like <b>1,5(1)</b> to
                                auto-expand to <b>1,2,3,4,5</b>. Max 10 numbers.
                                Each value becomes a separate subtask on
                                pressing enter.
                              </v-text>
                            </v-col>
                            <v-col
                              cols="4"
                              class="d-flex justify-start pl-2"
                              style="gap: 4px"
                            >
                              <v-btn
                                color="success"
                                size="small"
                                @click="addSubtask(task)"
                                type="button"
                                density="comfortable"
                              >
                                <v-icon size="small">mdi-check</v-icon>
                              </v-btn>
                              <v-btn
                                color="grey"
                                size="small"
                                @click="cancelSubtaskInput(task)"
                                type="button"
                                density="comfortable"
                              >
                                <v-icon size="small">mdi-close</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- Enhanced: Left-aligned subtask list -->
                        <v-list
                          v-if="task.subtasks && task.subtasks.length > 0"
                          density="compact"
                          class="py-0"
                        >
                          <v-list-item
                            v-for="subtask in task.subtasks"
                            :key="subtask.id"
                            class="py-1 px-0"
                            style="min-height: 36px"
                          >
                            <template v-slot:prepend>
                              <!-- Fixed: Handle null case from checkbox model-value -->
                              <v-checkbox
                                :model-value="subtask.done"
                                @update:model-value="
                                  updateSubtaskDone(
                                    task,
                                    subtask.id,
                                    $event ?? false
                                  )
                                "
                                color="success"
                                hide-details
                                density="compact"
                                style="margin-right: 12px"
                              />
                            </template>
                            <!-- Modified: Enhanced subtask title with edit functionality -->
                            <div
                              class="d-flex align-center justify-space-between flex-grow-1"
                            >
                              <div class="flex-grow-1">
                                <v-list-item-title
                                  v-if="editingSubtaskId !== subtask.id"
                                  :style="
                                    subtask.done
                                      ? 'text-decoration: line-through; color: #888; font-size: 0.9em; text-align: left;'
                                      : 'font-size: 0.9em; text-align: left;'
                                  "
                                  class="text-pre-wrap"
                                >
                                  {{ subtask.text }}
                                </v-list-item-title>
                                <!-- Added: Edit input field for subtasks -->
                                <v-text-field
                                  v-else
                                  v-model="editedSubtaskText"
                                  density="compact"
                                  hide-details
                                  variant="outlined"
                                  style="max-width: 200px; font-size: 0.9em"
                                  @keyup.enter="saveSubtaskEdit(task, subtask)"
                                  ref="subtaskEditInput"
                                  autofocus
                                />
                              </div>
                              <!-- Added: Grouped edit and delete buttons for subtasks -->
                              <div class="d-flex ml-2">
                                <v-btn-group
                                  variant="outlined"
                                  density="comfortable"
                                  divided
                                >
                                  <v-btn
                                    v-if="editingSubtaskId !== subtask.id"
                                    size="x-small"
                                    @click="startSubtaskEditing(subtask)"
                                    color="primary"
                                    icon="mdi-pencil"
                                    min-width="32"
                                  />
                                  <v-btn
                                    v-else
                                    size="x-small"
                                    @click="saveSubtaskEdit(task, subtask)"
                                    color="success"
                                    icon="mdi-check"
                                    min-width="32"
                                  />
                                  <v-btn
                                    v-if="editingSubtaskId === subtask.id"
                                    size="x-small"
                                    @click="cancelSubtaskEdit"
                                    color="grey"
                                    icon="mdi-close"
                                    min-width="32"
                                  />
                                  <v-btn
                                    size="x-small"
                                    @click="deleteSubtask(task, subtask.id)"
                                    color="error"
                                    icon="mdi-delete"
                                    min-width="32"
                                  />
                                </v-btn-group>
                              </div>
                            </div>
                          </v-list-item>
                        </v-list>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
          </template>
          <template v-else>
            <v-card class="text-center pa-6" variant="outlined">
              <v-card-text class="text-medium-emphasis">
                No tasks yet. Add your first task above!
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { v4 as uuidv4 } from "uuid";

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

// Modified: Added deadline field to Task interface
interface Task {
  id: string;
  text: string;
  done: boolean;
  deadline?: string; // Added: ISO date string for deadline
  subtasks?: Subtask[];
  subtasksCollapsed?: boolean; // false = expanded by default
  newSubtaskText?: string; // for input binding
  showSubtaskInput?: boolean; // Added: control subtask input visibility
  showDatePicker?: boolean; // Added: control date picker visibility
}

const newTask = ref("");
const tasks = ref<Task[]>([]);
const editingTaskId = ref<string | null>(null);
const editedTaskText = ref("");
// Added: State variables for subtask editing
const editingSubtaskId = ref<string | null>(null);
const editedSubtaskText = ref("");
// Added: State variable for date picker
const selectedDate = ref<Date | null>(null);

// Modified: Template refs for Vuetify components to manage focus and cursor position
const taskEditInput = ref<any>(null);
const subtaskEditInput = ref<any>(null);

// Added: Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Added: Get next Sunday date (end of current week)
const getNextSundayDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday.toISOString().split("T")[0];
};

// Added: Helper function to parse date string in local timezone to avoid UTC conversion issues
const parseLocalDate = (deadlineString: string): Date => {
  const deadlineParts = deadlineString.split("-");
  const deadlineYear = parseInt(deadlineParts[0]);
  const deadlineMonth = parseInt(deadlineParts[1]) - 1; // Month is 0-indexed
  const deadlineDay = parseInt(deadlineParts[2]);
  return new Date(deadlineYear, deadlineMonth, deadlineDay);
};

// Modified: Fix date calculation with proper timezone handling and debugging
const getDaysUntilDeadline = (task: Task) => {
  if (!task.deadline) return null;

  // Fixed: Create dates in local timezone to avoid UTC conversion issues
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const todayLocal = new Date(year, month, day); // Local date at midnight

  // Modified: Use parseLocalDate helper for consistent timezone handling
  const deadlineLocal = parseLocalDate(task.deadline);

  // Calculate difference in days
  const timeDiff = deadlineLocal.getTime() - todayLocal.getTime();
  const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

  return daysDiff;
};

// Added: Get deadline urgency color for icon
const getDeadlineUrgencyColor = (task: Task) => {
  const daysUntil = getDaysUntilDeadline(task);
  if (daysUntil === null) return "grey";
  if (daysUntil < 0) return "error";
  if (daysUntil === 0) return "warning";
  if (daysUntil === 1) return "orange";
  return "primary";
};

// Added: Get deadline icon based on urgency
const getDeadlineIcon = (task: Task) => {
  const daysUntil = getDaysUntilDeadline(task);
  if (daysUntil === null) return "mdi-star-outline";
  if (daysUntil < 0) return "mdi-alert-circle";
  if (daysUntil === 0) return "mdi-clock-alert";
  if (daysUntil <= 2) return "mdi-clock-fast";
  return "mdi-clock-outline";
};

// Added: Get deadline chip color
const getDeadlineChipColor = (task: Task) => {
  const daysUntil = getDaysUntilDeadline(task);
  if (daysUntil === null) return "grey-lighten-1";
  if (daysUntil < 0) return "error";
  if (daysUntil === 0) return "warning";
  if (daysUntil === 1) return "orange";
  if (daysUntil <= 2) return "blue";
  return "success";
};

// Modified: Fix formatDeadlineText to use timezone-safe date parsing
const formatDeadlineText = (task: Task) => {
  if (!task.deadline) return "No deadline";

  const daysUntil = getDaysUntilDeadline(task);
  if (daysUntil === null) return "No deadline";

  // Modified: Use parseLocalDate helper for consistent timezone handling
  const deadlineDate = parseLocalDate(task.deadline);

  const formattedDate = deadlineDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (daysUntil < 0) return `Overdue (${formattedDate})`;
  if (daysUntil === 0) return `Due today (${formattedDate})`;
  if (daysUntil === 1) return `Due tomorrow (${formattedDate})`;
  return `${daysUntil} days (${formattedDate})`;
};

// Modified: Remove debug logging from toggleDatePicker function
const toggleDatePicker = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].showDatePicker =
      !tasks.value[taskIndex].showDatePicker;
    if (tasks.value[taskIndex].showDatePicker && task.deadline) {
      // Modified: Use parseLocalDate helper for consistent timezone handling
      selectedDate.value = parseLocalDate(task.deadline);
    } else if (!tasks.value[taskIndex].showDatePicker) {
      selectedDate.value = null;
    }
  }
};

// Added: Close date picker function
const closeDatePicker = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].showDatePicker = false;
    selectedDate.value = null;
  }
};

// Modified: Remove debug logging from setDeadline function
const setDeadline = (task: Task) => {
  if (!selectedDate.value) return;

  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    // Fixed: Format date properly in local timezone
    const year = selectedDate.value.getFullYear();
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.value.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    tasks.value[taskIndex].deadline = formattedDate;
    tasks.value[taskIndex].showDatePicker = false;
    selectedDate.value = null;
  }
};

// Added: Remove deadline from task function
const removeDeadline = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    delete tasks.value[taskIndex].deadline;
    tasks.value[taskIndex].showDatePicker = false;
    selectedDate.value = null;
  }
};

// Add task function - Modified to handle comma-separated input and numbered lists
const addTask = () => {
  if (newTask.value.trim() === "") return;

  // Split by comma and trim whitespace from each part
  const parts = newTask.value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (parts.length === 0) return;

  // Modified: Simplified parsing - removed number-based sorting logic
  // First part becomes the main task title
  const mainTaskTitle = parts[0];

  // Remaining parts become subtasks
  const subtaskTexts = parts.slice(1);

  // Create subtasks array from the remaining parts
  const subtasks = subtaskTexts.map((text) => ({
    id: uuidv4(),
    text: text,
    done: false,
  }));

  // Create the main task with subtasks
  tasks.value.push({
    id: uuidv4(),
    text: mainTaskTitle,
    done: false,
    subtasks: subtasks, // Add the parsed subtasks
    subtasksCollapsed: false, // Show subtasks by default when they exist
    newSubtaskText: "",
    showSubtaskInput: false,
    showDatePicker: false, // Added: Initialize date picker state
  });

  newTask.value = "";
};

// Delete task function
const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter((task) => task.id !== id);
};

// Start editing a task
const startEditing = (task: Task) => {
  editingTaskId.value = task.id;
  editedTaskText.value = task.text;

  // Modified: Focus input and position cursor at end of text after DOM update
  nextTick(() => {
    if (taskEditInput.value && taskEditInput.value.$el) {
      const input = taskEditInput.value.$el.querySelector(
        "input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  });
};

// Save edited task
const saveEdit = (task: Task) => {
  if (editedTaskText.value.trim() === "") return;

  // Find the task in the tasks array and update it directly to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    // Update the task text in the reactive array to trigger watchers
    tasks.value[taskIndex].text = editedTaskText.value.trim();
  }

  // Clear editing state
  editingTaskId.value = null;
  editedTaskText.value = "";
};

// Cancel editing
const cancelEdit = () => {
  editingTaskId.value = null;
  editedTaskText.value = "";
};

// Load tasks from localStorage on component mount
onMounted(() => {
  const savedTasks = localStorage.getItem("weeklyProgressTasks");
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks);
    // Modified: Ensure existing tasks have all required properties including deadline fields
    tasks.value = tasks.value.map((task) => ({
      ...task,
      subtasksCollapsed: task.subtasksCollapsed ?? true, // default to collapsed if not set
      subtasks: task.subtasks || [],
      showSubtaskInput: false,
      showDatePicker: false, // Added: Initialize date picker state for existing tasks
    }));
  }
});

// Watch for task changes and update localStorage
watch(
  tasks,
  (newTasks) => {
    // Changed localStorage key from "otherTasks" to "weeklyProgressTasks"
    localStorage.setItem("weeklyProgressTasks", JSON.stringify(newTasks)); // <-- changed
  },
  { deep: true }
);

// Modified: Replace number-based sorting with deadline-based sorting
const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    // First sort by completion status (incomplete tasks first)
    const completionDiff = Number(a.done) - Number(b.done);
    if (completionDiff !== 0) return completionDiff;

    // Then sort by deadline urgency for incomplete tasks
    if (!a.done && !b.done) {
      const aDaysUntil = getDaysUntilDeadline(a);
      const bDaysUntil = getDaysUntilDeadline(b);

      // Tasks with no deadline go to the bottom
      if (aDaysUntil === null && bDaysUntil === null) return 0;
      if (aDaysUntil === null) return 1;
      if (bDaysUntil === null) return -1;

      // Sort by days until deadline (ascending - most urgent first)
      return aDaysUntil - bDaysUntil;
    }

    // For completed tasks, maintain original order
    return 0;
  });
});

// Modified: Toggle collapse/expand for subtasks with proper reactivity
const toggleSubtasksCollapse = (task: Task) => {
  // Find the task in the tasks array and update it directly to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    // Update the subtasksCollapsed property in the reactive array to trigger watchers
    tasks.value[taskIndex].subtasksCollapsed =
      !tasks.value[taskIndex].subtasksCollapsed;
  }
};

// Progress calculation for subtasks
const getSubtaskProgress = (task: Task) => {
  // Added: Calculate progress for subtasks
  if (!task.subtasks || task.subtasks.length === 0) return 0;
  const completed = task.subtasks.filter((s) => s.done).length;
  return Math.round((completed / task.subtasks.length) * 100);
};

// Modified: Toggle subtask input visibility with proper reactivity
const toggleSubtaskInput = (task: Task) => {
  // Find the task in the tasks array and update it directly to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    // Update the showSubtaskInput property in the reactive array to trigger watchers
    tasks.value[taskIndex].showSubtaskInput =
      !tasks.value[taskIndex].showSubtaskInput;
    if (tasks.value[taskIndex].showSubtaskInput) {
      tasks.value[taskIndex].newSubtaskText = "";
    }
  }
};

// Modified: Cancel subtask input with proper reactivity
const cancelSubtaskInput = (task: Task) => {
  // Find the task in the tasks array and update it directly to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].showSubtaskInput = false;
    tasks.value[taskIndex].newSubtaskText = "";
  }
};

// Modified: Add subtask with support for multiple comma-separated values
const addSubtask = (task: Task) => {
  // Find the task in the tasks array to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex === -1) return;

  const currentTask = tasks.value[taskIndex];
  if (!currentTask.newSubtaskText || currentTask.newSubtaskText.trim() === "")
    return;

  // Ensure subtasks array exists
  if (!currentTask.subtasks) {
    tasks.value[taskIndex].subtasks = [];
  }

  // Added: Split input by comma and add each as a separate subtask
  const subtaskTexts = currentTask.newSubtaskText
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");

  subtaskTexts.forEach((text) => {
    tasks.value[taskIndex].subtasks!.push({
      id: uuidv4(),
      text,
      done: false,
    });
  });

  // Clear input and hide the input field
  tasks.value[taskIndex].newSubtaskText = "";
  tasks.value[taskIndex].showSubtaskInput = false;
};

// Added: Start editing a subtask
const startSubtaskEditing = (subtask: Subtask) => {
  editingSubtaskId.value = subtask.id;
  editedSubtaskText.value = subtask.text;

  // Modified: Focus input and position cursor at end of text after DOM update
  nextTick(() => {
    if (subtaskEditInput.value && subtaskEditInput.value.$el) {
      const input = subtaskEditInput.value.$el.querySelector(
        "input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  });
};

// Modified: Save edited subtask with proper reactivity
const saveSubtaskEdit = (task: Task, subtask: Subtask) => {
  if (editedSubtaskText.value.trim() === "") return;

  // Find the task in the tasks array to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1 && tasks.value[taskIndex].subtasks) {
    // Find the subtask and update it in the reactive array
    const subtaskIndex = tasks.value[taskIndex].subtasks!.findIndex(
      (s) => s.id === subtask.id
    );
    if (subtaskIndex !== -1) {
      tasks.value[taskIndex].subtasks![subtaskIndex].text =
        editedSubtaskText.value.trim();
    }
  }

  // Clear editing state
  editingSubtaskId.value = null;
  editedSubtaskText.value = "";
};

// Added: Cancel subtask editing
const cancelSubtaskEdit = () => {
  editingSubtaskId.value = null;
  editedSubtaskText.value = "";
};

// Added: Delete subtask function with proper reactivity
const deleteSubtask = (task: Task, subtaskId: string) => {
  // Find the task in the tasks array to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1 && tasks.value[taskIndex].subtasks) {
    // Filter out the deleted subtask from the reactive array
    tasks.value[taskIndex].subtasks = tasks.value[taskIndex].subtasks!.filter(
      (subtask) => subtask.id !== subtaskId
    );
  }
};

// Fixed: Update function signature to handle boolean | null and provide proper type safety
const updateSubtaskDone = (
  task: Task,
  subtaskId: string,
  done: boolean | null
) => {
  // Convert null to false for consistent boolean handling
  const isDone = done ?? false;

  // Find the task in the tasks array to ensure reactivity
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1 && tasks.value[taskIndex].subtasks) {
    // Find the subtask and update it in the reactive array
    const subtaskIndex = tasks.value[taskIndex].subtasks!.findIndex(
      (s) => s.id === subtaskId
    );
    if (subtaskIndex !== -1) {
      // Use the converted boolean value
      tasks.value[taskIndex].subtasks![subtaskIndex].done = isDone;
    }
  }
};

// Added: Get subtask input text with proper reactivity
const getSubtaskInputText = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  return taskIndex !== -1 ? tasks.value[taskIndex].newSubtaskText || "" : "";
};

// Added: Update subtask input text with proper reactivity
const updateSubtaskInputText = (task: Task, text: string) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    // Added: Expand number ranges before updating the input field
    tasks.value[taskIndex].newSubtaskText = text;

    // Clear previous timer if exists
    const timerId = subtaskInputTimers.get(task.id);
    if (timerId) clearTimeout(timerId);

    // Set new timer for 2s debounce
    const newTimer = setTimeout(() => {
      // Only expand if the input still matches the original text
      // Fixed: Ensure expandNumberRanges always receives a string
      const currentText = tasks.value[taskIndex].newSubtaskText ?? "";
      const expandedText = expandNumberRanges(currentText);
      if (currentText !== expandedText) {
        // Replace with expanded value
        tasks.value[taskIndex].newSubtaskText = expandedText;
      }
    }, 2000);

    subtaskInputTimers.set(task.id, newTimer);
  }
};

// Added: Timer map to track debounce per task
const subtaskInputTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Modified: Helper function to expand number ranges with a max of 10 numbers
function expandNumberRanges(input: string): string {
  const rangeRegex = /(\d+),(\d+)\((\d+)\)/g;
  let expanded = input;
  let match;
  while ((match = rangeRegex.exec(input)) !== null) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    const step = parseInt(match[3]);
    if (step > 0 && start <= end) {
      const nums = [];
      for (let i = start; i <= end && nums.length < 10; i += step) {
        nums.push(i);
      }
      expanded = expanded.replace(match[0], nums.join(","));
    }
  }
  return expanded;
}

// Added: Get animation class based on task deadline urgency
const getTaskAnimationClass = (task: Task) => {
  // Only animate incomplete tasks with deadlines
  if (task.done || !task.deadline) return "";

  const daysUntil = getDaysUntilDeadline(task);
  if (daysUntil === null) return "";

  // Apply animations based on urgency
  if (daysUntil === 0) return "task-due-today"; // Due today - pulse + spotlight
  if (daysUntil === 1) return "task-due-tomorrow"; // Due tomorrow - gentle pulse

  return "";
};

// Added: Computed property to calculate total number of subtasks across all tasks
const totalSubtasksCount = computed(() => {
  return tasks.value.reduce((total, task) => {
    return total + (task.subtasks?.length || 0);
  }, 0);
});

// Added: Computed property to calculate number of completed subtasks
const completedSubtasksCount = computed(() => {
  return tasks.value.reduce((total, task) => {
    const completedInTask = task.subtasks?.filter((s) => s.done).length || 0;
    return total + completedInTask;
  }, 0);
});

// Added: Computed property to calculate overall completion percentage for progress circle
const overallProgress = computed(() => {
  if (totalSubtasksCount.value === 0) return 0;
  return Math.round(
    (completedSubtasksCount.value / totalSubtasksCount.value) * 100
  );
});
</script>

<style scoped>
.task-block {
  /* Added: Consistent task block styling */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  transition: box-shadow 0.2s;
}

.task-block:hover {
  /* Added: Subtle shadow on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Added: Task title decoration styles */
.task-title-container {
  text-align: left;
  margin-bottom: 8px;
}

.task-title {
  font-size: 1.1em;
  line-height: 1.3;
}

.task-underline {
  height: 2px;
  background: linear-gradient(90deg, #1976d2 0%, transparent 50%);
  margin-top: 4px;
  width: 60%;
}

/* Added: Deadline info styling */
.deadline-info {
  margin-top: 4px;
}

.task-due-today {
  border-color: #ff9800 !important;
}

.task-due-tomorrow {
  border-color: #2196f3 !important;
}

/* Added: Date picker card styling for compact layout */
.date-picker-card {
  max-width: 320px;
  margin: 0 auto;
}

/* Modified: Ensure date picker is properly centered and compact */
.date-picker-card .v-date-picker {
  margin: 0 auto;
}
</style>
