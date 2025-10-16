<template>
  <div>
    <!-- Added: Header with weekly statistics -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 font-weight-bold ml-3">Other Tasks</h2>

      <div class="text-right">
        <div class="d-flex align-center justify-end">
          <p class="text-body-2 text-medium-emphasis">
            This Week:
            <span class="font-weight-semibold text-high-emphasis">{{
              thisWeekCount
            }}</span>
          </p>
          <!-- Modified: Check for null explicitly and use optional chaining -->
          <v-icon
            v-if="percentageChange !== null && percentageChange !== 0"
            :color="percentageChange > 0 ? 'success' : 'error'"
            size="small"
            class="mr-1"
          >
            {{ percentageChange > 0 ? "mdi-arrow-up" : "mdi-arrow-down" }}
          </v-icon>
          <span
            v-if="percentageChange !== null && percentageChange !== 0"
            class="text-body-2 font-weight-semibold"
            :class="percentageChange > 0 ? 'text-success' : 'text-error'"
          >
            {{ Math.abs(percentageChange).toFixed(1) }}%
          </span>
        </div>
        <p class="text-caption text-medium-emphasis">
          Last Week: {{ lastWeekCount }}
        </p>
      </div>
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
            class="ml-2"
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
          <v-btn
            v-if="tasks.length > 0"
            @click="uncheckAll"
            color="secondary"
            variant="outlined"
            class="mb-2"
            size="small"
          >
            Uncheck All
          </v-btn>
          <template v-if="tasks.length > 0">
            <v-card variant="outlined">
              <v-list>
                <v-list-item
                  v-for="task in sortedTasks"
                  :key="task.id"
                  lines="one"
                >
                  <template v-slot:prepend>
                    <!-- Modified: Added @update:model-value to track completions -->
                    <v-checkbox
                      v-model="task.done"
                      @update:model-value="handleTaskToggle($event)"
                      color="success"
                      hide-details
                    />
                  </template>
                  <v-list-item-title
                    v-if="editingTaskId !== task.id"
                    :style="
                      task.done
                        ? 'text-decoration: line-through; color: #888;'
                        : ''
                    "
                    class="text-wrap break-word border-b"
                  >
                    {{ task.text }}
                  </v-list-item-title>
                  <v-text-field
                    v-else
                    v-model="editedTaskText"
                    density="compact"
                    hide-details
                    style="max-width: 200px"
                  />
                  <template v-slot:append>
                    <!-- Added: Bullseye button to toggle task focus -->
                    <v-btn
                      icon="mdi-bullseye"
                      @click="toggleTaskFocus(task)"
                      :color="task.isFocused ? 'deep-orange' : 'grey-darken-1'"
                      variant="text"
                      size="small"
                    />
                    <v-btn
                      v-if="editingTaskId !== task.id"
                      icon="mdi-pencil"
                      @click="startEditing(task)"
                      color="primary"
                      variant="text"
                      size="small"
                    />
                    <v-btn
                      v-else
                      icon="mdi-check"
                      @click="saveEdit(task)"
                      color="success"
                      variant="text"
                      size="small"
                    />
                    <v-btn
                      v-if="editingTaskId === task.id"
                      icon="mdi-close"
                      @click="cancelEdit"
                      color="grey"
                      variant="text"
                      size="small"
                    />
                    <v-btn
                      icon="mdi-delete"
                      @click="deleteTask(task.id)"
                      color="error"
                      variant="text"
                      size="small"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
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
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";

// Modified: Add isFocused property to Task interface
interface Task {
  id: string;
  text: string;
  done: boolean;
  isFocused?: boolean; // Added: Track if task is in today's focus
}

// Added: Interface for weekly tracking data
interface WeeklyStats {
  thisWeek: number;
  lastWeek: number;
  weekStartDate: string; // ISO date string for Monday of current week
}

const newTask = ref("");
const tasks = ref<Task[]>([]);
const editingTaskId = ref<string | null>(null);
const editedTaskText = ref("");

// Added: Weekly statistics tracking
const thisWeekCount = ref(0);
const lastWeekCount = ref(0);
const weekStartDate = ref("");

// Modified: Explicitly type the return as number | null to handle TypeScript properly
const percentageChange = computed<number | null>(() => {
  if (lastWeekCount.value === 0) {
    return null;
  }
  return (
    ((thisWeekCount.value - lastWeekCount.value) / lastWeekCount.value) * 100
  );
});

// Added: Function to get the Monday of the current week
const getMondayOfWeek = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

// Added: Function to check if we need to reset weekly counter
const checkAndResetWeek = () => {
  const currentMonday = getMondayOfWeek(new Date());

  if (weekStartDate.value !== currentMonday) {
    // New week detected, move this week's count to last week
    lastWeekCount.value = thisWeekCount.value;
    thisWeekCount.value = 0;
    weekStartDate.value = currentMonday;
    saveWeeklyStats();
  }
};

// Modified: Accept boolean | null and add type guard to handle both cases
const handleTaskToggle = (newValue: boolean | null) => {
  // Type guard: only proceed if newValue is explicitly true
  if (newValue === true) {
    // Task was checked (completed)
    thisWeekCount.value++;
    saveWeeklyStats();
  }
};

// Added: Function to save weekly stats to localStorage
const saveWeeklyStats = () => {
  const stats: WeeklyStats = {
    thisWeek: thisWeekCount.value,
    lastWeek: lastWeekCount.value,
    weekStartDate: weekStartDate.value,
  };
  localStorage.setItem("otherTasksWeeklyStats", JSON.stringify(stats));
};

// Added: Function to load weekly stats from localStorage
const loadWeeklyStats = () => {
  const saved = localStorage.getItem("otherTasksWeeklyStats");
  if (saved) {
    const stats: WeeklyStats = JSON.parse(saved);
    thisWeekCount.value = stats.thisWeek;
    lastWeekCount.value = stats.lastWeek;
    weekStartDate.value = stats.weekStartDate;
  } else {
    // Initialize with current Monday if no data exists
    weekStartDate.value = getMondayOfWeek(new Date());
  }
};

const addTask = () => {
  if (newTask.value.trim() === "") return;
  tasks.value.push({ id: uuidv4(), text: newTask.value, done: false });
  newTask.value = "";
};

const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter((task) => task.id !== id);
};

const startEditing = (task: Task) => {
  editingTaskId.value = task.id;
  editedTaskText.value = task.text;
};

const saveEdit = (task: Task) => {
  if (editedTaskText.value.trim() === "") return;
  task.text = editedTaskText.value;
  editingTaskId.value = null;
  editedTaskText.value = "";
};

const cancelEdit = () => {
  editingTaskId.value = null;
  editedTaskText.value = "";
};

// Modified: Load both tasks and weekly stats on mount, then check for week reset
onMounted(() => {
  const savedTasks = localStorage.getItem("otherTasks");
  if (savedTasks) {
    // Modified: Ensure isFocused property exists for backward compatibility
    const loaded = JSON.parse(savedTasks);
    tasks.value = loaded.map((t: any) => ({
      ...t,
      isFocused: t.isFocused ?? false, // Added: Initialize focus state
    }));
  }

  loadWeeklyStats();
  checkAndResetWeek();

  // Added: Listen for events from TodaysFocus component
  window.addEventListener(
    "remove-from-focus",
    handleRemoveFromFocus as EventListener
  );
  window.addEventListener(
    "sync-focus-done",
    handleSyncFocusDone as EventListener
  );
});

onUnmounted(() => {
  window.removeEventListener(
    "remove-from-focus",
    handleRemoveFromFocus as EventListener
  );
  window.removeEventListener(
    "sync-focus-done",
    handleSyncFocusDone as EventListener
  );
});

// Added: Handle when item is removed from TodaysFocus
const handleRemoveFromFocus = (event: CustomEvent) => {
  const { taskId } = event.detail;

  const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].isFocused = false;
  }
};

// Added: Sync done status from TodaysFocus back to this component
const handleSyncFocusDone = (event: CustomEvent) => {
  const { taskId, done } = event.detail;

  const taskIndex = tasks.value.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].done = done;
  }
};

// Added: Toggle focus state for task
const toggleTaskFocus = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    const newFocusState = !tasks.value[taskIndex].isFocused;
    tasks.value[taskIndex].isFocused = newFocusState;

    if (newFocusState) {
      // Dispatch event to add to TodaysFocus
      window.dispatchEvent(
        new CustomEvent("task-focused", {
          detail: {
            taskId: task.id,
            text: task.text,
            isSubtask: false,
            sourceComponent: "Other Tasks", // Added: Identify source component
          },
        })
      );
    } else {
      // Dispatch event to remove from TodaysFocus
      window.dispatchEvent(
        new CustomEvent("task-unfocused", {
          detail: { taskId: task.id },
        })
      );
    }
  }
};

watch(
  tasks,
  (newTasks) => {
    localStorage.setItem("otherTasks", JSON.stringify(newTasks));
  },
  { deep: true }
);

const sortedTasks = computed(() =>
  tasks.value.slice().sort((a, b) => Number(a.done) - Number(b.done))
);

const uncheckAll = () => {
  tasks.value = tasks.value.map((task) => ({
    ...task,
    done: false,
  }));
};
</script>
