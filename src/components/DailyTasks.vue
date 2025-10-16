<template>
  <div>
    <h2>Daily Tasks</h2>
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
          <div class="d-flex align-center mb-2" v-if="tasks.length > 0">
            <!-- Uncheck All Button -->
            <v-btn
              @click="uncheckAll"
              color="secondary"
              variant="outlined"
              size="small"
              class="mr-2"
            >
              Uncheck All
            </v-btn>
            <!-- Reset Count Button -->
            <v-btn
              @click="showResetDialog = true"
              color="warning"
              variant="outlined"
              size="small"
            >
              Reset Count
            </v-btn>
          </div>
          <template v-if="tasks.length > 0">
            <v-card variant="outlined">
              <v-list>
                <v-list-item
                  v-for="task in sortedTasks"
                  :key="task.id"
                  lines="one"
                  class="py-1"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="task.done"
                      color="success"
                      hide-details
                      @update:model-value="onTaskCheck(task)"
                    />
                  </template>
                  <!-- Fix: Always use v-list-item-title for main content -->
                  <v-list-item-title
                    v-if="editingTaskId !== task.id"
                    :style="
                      task.done
                        ? 'text-decoration: line-through; color: #888;'
                        : ''
                    "
                    class="d-flex flex-row align-center justify-space-between w-100 border-b text-wrap break-word"
                    style="border-color: #eee !important"
                  >
                    <span class="text-body-1 text-left">{{ task.text }}</span>
                    <span
                      class="text-body-2 font-weight-bold text-primary ml-2 text-right task-count-badge"
                    >
                      {{ task.count }}x
                    </span>
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
      <!-- Reset Count Confirmation Dialog -->
      <v-dialog v-model="showResetDialog" max-width="350">
        <v-card>
          <v-card-title class="headline">Reset All Counts?</v-card-title>
          <v-card-text>
            Are you sure you want to reset all task counts to 0?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showResetDialog = false">
              Cancel
            </v-btn>
            <v-btn color="warning" variant="text" @click="resetAllCounts">
              Reset
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, computed } from "vue";
import { v4 as uuidv4 } from "uuid";

// Modified: Add isFocused property to Task interface
interface Task {
  id: string;
  text: string;
  done: boolean;
  count: number;
  isFocused?: boolean; // Added: Track if task is in today's focus
}

const newTask = ref("");
const tasks = ref<Task[]>([]);
const editingTaskId = ref<string | null>(null);
const editedTaskText = ref("");
const showResetDialog = ref(false); // For reset count dialog

// Add task function
const addTask = () => {
  if (newTask.value.trim() === "") return;
  // Added: initialize count to 0
  tasks.value.push({
    id: uuidv4(),
    text: newTask.value,
    done: false,
    count: 0,
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
};

// Save edited task
const saveEdit = (task: Task) => {
  if (editedTaskText.value.trim() === "") return;
  task.text = editedTaskText.value;
  // Added: finish editing after saving
  editingTaskId.value = null;
  editedTaskText.value = "";
};

// Cancel editing
const cancelEdit = () => {
  editingTaskId.value = null;
  editedTaskText.value = "";
};

// When a task is checked, increment count if it transitions from not done to done
const onTaskCheck = (task: Task) => {
  // Only increment if marking as done
  if (task.done) {
    task.count = (task.count || 0) + 1;
  }
};

// Load tasks from localStorage on component mount
onMounted(() => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    // Modified: ensure count and isFocused properties exist for backward compatibility
    const loaded = JSON.parse(savedTasks);
    tasks.value = loaded.map((t: any) => ({
      ...t,
      count: typeof t.count === "number" ? t.count : 0,
      isFocused: t.isFocused ?? false, // Added: Initialize focus state
    }));
  }

  // Modified: Use globalThis instead of window for event listeners
  globalThis.addEventListener(
    "remove-from-focus",
    handleRemoveFromFocus as EventListener
  );
  globalThis.addEventListener(
    "sync-focus-done",
    handleSyncFocusDone as EventListener
  );
});

onBeforeUnmount(() => {
  // Modified: Use globalThis instead of window for event listeners
  globalThis.removeEventListener(
    "remove-from-focus",
    handleRemoveFromFocus as EventListener
  );
  globalThis.removeEventListener(
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
    const wasDone = tasks.value[taskIndex].done;
    tasks.value[taskIndex].done = done;
    // Increment count if transitioning from not done to done
    if (done && !wasDone) {
      tasks.value[taskIndex].count = (tasks.value[taskIndex].count || 0) + 1;
    }
  }
};

// Added: Toggle focus state for task
const toggleTaskFocus = (task: Task) => {
  const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex !== -1) {
    const newFocusState = !tasks.value[taskIndex].isFocused;
    tasks.value[taskIndex].isFocused = newFocusState;

    if (newFocusState) {
      // Modified: Use globalThis instead of window
      // Dispatch event to add to TodaysFocus
      globalThis.dispatchEvent(
        new CustomEvent("task-focused", {
          detail: {
            taskId: task.id,
            text: task.text,
            isSubtask: false,
            sourceComponent: "Daily Tasks",
          },
        })
      );
    } else {
      // Modified: Use globalThis instead of window
      // Dispatch event to remove from TodaysFocus
      globalThis.dispatchEvent(
        new CustomEvent("task-unfocused", {
          detail: { taskId: task.id },
        })
      );
    }
  }
};

const sortedTasks = computed(() =>
  tasks.value.slice().sort((a, b) => Number(a.done) - Number(b.done))
);

const uncheckAll = () => {
  // Uncheck all tasks, but do not reset count
  tasks.value = tasks.value.map((task) => ({
    ...task,
    done: false,
  }));
};

// Reset all counts to 0, with confirmation
const resetAllCounts = () => {
  tasks.value = tasks.value.map((task) => ({
    ...task,
    count: 0,
  }));
  showResetDialog.value = false;
};
</script>

<style scoped>
/* Added: Styling for the count badge */
.task-count-badge {
  background: #f5f5f5;
  color: #1976d2;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.85em;
  margin-left: 8px;
  font-weight: 600;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
</style>
