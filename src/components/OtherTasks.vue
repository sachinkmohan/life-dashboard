<template>
  <div>
    <h2>Other Tasks</h2>
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
                    <v-checkbox
                      v-model="task.done"
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
                    class="text-wrap break-word"
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
const newTask = ref("");
const tasks = ref<Task[]>([]);
const editingTaskId = ref<string | null>(null);
const editedTaskText = ref("");

// Add task function
const addTask = () => {
  if (newTask.value.trim() === "") return;
  tasks.value.push({ id: uuidv4(), text: newTask.value, done: false });
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
  const savedTasks = localStorage.getItem("otherTasks");
  if (savedTasks) tasks.value = JSON.parse(savedTasks);
});

// Watch for task changes and update localStorage
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
