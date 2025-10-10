<template>
  <div>
    <!-- Added: Header with weekly statistics -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 font-weight-bold">Other Tasks</h2>
      <div class="text-right">
        <div class="d-flex align-center justify-end">
          <p class="text-body-2 text-medium-emphasis mr-2">
            This Week:
            <span class="font-weight-semibold text-high-emphasis">{{
              thisWeekCount
            }}</span>
          </p>
          <!-- Added: Conditional arrow and percentage change display -->
          <v-icon
            v-if="percentageChange !== 0"
            :color="percentageChange > 0 ? 'success' : 'error'"
            size="small"
            class="mr-1"
          >
            {{ percentageChange > 0 ? "mdi-arrow-up" : "mdi-arrow-down" }}
          </v-icon>
          <span
            v-if="percentageChange !== 0"
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
                      @update:model-value="handleTaskToggle(task, $event)"
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
import { ref, watch, onMounted, computed } from "vue";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  text: string;
  done: boolean;
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

// Added: Computed property for percentage change
const percentageChange = computed(() => {
  if (lastWeekCount.value === 0) {
    return thisWeekCount.value > 0 ? 100 : 0;
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

// Added: Function to handle task toggle (checking/unchecking)
const handleTaskToggle = (task: Task, newValue: boolean) => {
  if (newValue) {
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
  if (savedTasks) tasks.value = JSON.parse(savedTasks);

  loadWeeklyStats();
  checkAndResetWeek();
});

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
