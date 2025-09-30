<template>
  <div>
    <h2>Weekly Focus</h2>
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
              <v-card variant="outlined" class="task-block">
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
                              <!-- Added: Decorative icon for main task -->
                              <v-icon color="primary" size="small" class="mr-2">
                                mdi-star-outline
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
                          />
                        </div>
                        <!-- Modified: Added show/hide toggle button to the action buttons group -->
                        <div class="d-flex" style="gap: 4px">
                          <!-- Modified: Grouped action buttons with consistent styling and spacing -->
                          <v-btn-group variant="outlined" density="compact">
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
                              <v-text-field
                                v-model="task.newSubtaskText"
                                label="Add subtask"
                                density="compact"
                                hide-details
                                variant="outlined"
                                @keyup.enter="addSubtask(task)"
                                style="font-size: 0.9em"
                                cl
                              />
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
                              <v-checkbox
                                v-model="subtask.done"
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
import { ref, watch, onMounted, computed } from "vue";
import { v4 as uuidv4 } from "uuid";

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}
interface Task {
  id: string;
  text: string;
  done: boolean;
  subtasks?: Subtask[];
  subtasksCollapsed?: boolean; // false = expanded by default
  newSubtaskText?: string; // for input binding
  showSubtaskInput?: boolean; // Added: control subtask input visibility
}
const newTask = ref("");
const tasks = ref<Task[]>([]);
const editingTaskId = ref<string | null>(null);
const editedTaskText = ref("");
// Added: State variables for subtask editing
const editingSubtaskId = ref<string | null>(null);
const editedSubtaskText = ref("");

// Add task function - Modified to handle comma-separated input
const addTask = () => {
  if (newTask.value.trim() === "") return;

  // Split by comma and trim whitespace from each part
  const parts = newTask.value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (parts.length === 0) return;

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

// Load tasks from localStorage on component mount
onMounted(() => {
  const savedTasks = localStorage.getItem("weeklyProgressTasks");
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks);
    // Added: Ensure existing tasks have the subtasksCollapsed property
    tasks.value = tasks.value.map((task) => ({
      ...task,
      subtasksCollapsed: task.subtasksCollapsed ?? true, // default to collapsed if not set
      subtasks: task.subtasks || [],
      showSubtaskInput: false,
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

const sortedTasks = computed(() =>
  tasks.value.slice().sort((a, b) => Number(a.done) - Number(b.done))
);

// Toggle collapse/expand for subtasks
const toggleSubtasksCollapse = (task: Task) => {
  // Added: Toggle collapse state
  task.subtasksCollapsed = !task.subtasksCollapsed;
};

// Progress calculation for subtasks
const getSubtaskProgress = (task: Task) => {
  // Added: Calculate progress for subtasks
  if (!task.subtasks || task.subtasks.length === 0) return 0;
  const completed = task.subtasks.filter((s) => s.done).length;
  return Math.round((completed / task.subtasks.length) * 100);
};

// Added: Toggle subtask input visibility
const toggleSubtaskInput = (task: Task) => {
  task.showSubtaskInput = !task.showSubtaskInput;
  if (task.showSubtaskInput) {
    task.newSubtaskText = "";
  }
};

// Added: Cancel subtask input
const cancelSubtaskInput = (task: Task) => {
  task.showSubtaskInput = false;
  task.newSubtaskText = "";
};

// Modified: Add subtask and hide input after adding
const addSubtask = (task: Task) => {
  if (!task.newSubtaskText || task.newSubtaskText.trim() === "") return;
  if (!task.subtasks) task.subtasks = [];
  task.subtasks.push({
    id: uuidv4(),
    text: task.newSubtaskText,
    done: false,
  });
  task.newSubtaskText = "";
  task.showSubtaskInput = false; // Added: hide input after adding
};

// Added: Start editing a subtask
const startSubtaskEditing = (subtask: Subtask) => {
  editingSubtaskId.value = subtask.id;
  editedSubtaskText.value = subtask.text;
};

// Added: Save edited subtask
const saveSubtaskEdit = (task: Task, subtask: Subtask) => {
  if (editedSubtaskText.value.trim() === "") return;
  subtask.text = editedSubtaskText.value;
  editingSubtaskId.value = null;
  editedSubtaskText.value = "";
};

// Added: Cancel subtask editing
const cancelSubtaskEdit = () => {
  editingSubtaskId.value = null;
  editedSubtaskText.value = "";
};

// Added: Delete subtask function
const deleteSubtask = (task: Task, subtaskId: string) => {
  if (!task.subtasks) return;
  task.subtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId);
};
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
</style>
