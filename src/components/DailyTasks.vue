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
          <template v-if="tasks.length > 0">
            <v-card variant="outlined">
              <v-list>
                <v-list-item v-for="task in tasks" :key="task.id" lines="one">
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="task.done"
                      color="success"
                      hide-details
                    />
                  </template>
                  <v-list-item-title
                    :style="
                      task.done
                        ? 'text-decoration: line-through; color: #888;'
                        : ''
                    "
                  >
                    {{ task.text }}
                  </v-list-item-title>
                  <template v-slot:append>
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
import { ref, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  text: string;
  done: boolean;
}
const newTask = ref("");
const tasks = ref<Task[]>([]);
const addTask = () => {
  if (newTask.value.trim() === "") return;
  tasks.value.push({ id: uuidv4(), text: newTask.value, done: false });
  newTask.value = "";
};
const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter((task) => task.id !== id);
};
onMounted(() => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) tasks.value = JSON.parse(savedTasks);
});
watch(
  tasks,
  (newTasks) => {
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  },
  { deep: true }
);
</script>
