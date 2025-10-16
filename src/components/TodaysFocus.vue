<template>
  <div>
    <!-- Component header with title and optional clear all button -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="ml-4">Today's Focus</h2>
      <!-- Clear all focused items button, only shown when there are items -->
      <v-btn
        v-if="focusedItems.length > 0"
        @click="clearAllFocus"
        color="grey"
        variant="outlined"
        size="small"
        prepend-icon="mdi-close-circle"
      >
        Clear All
      </v-btn>
    </div>

    <v-container style="width: 400px; overflow-x: auto">
      <v-row>
        <v-col cols="12">
          <!-- Display focused items if any exist -->
          <template v-if="focusedItems.length > 0">
            <div v-for="item in focusedItems" :key="item.id" class="mb-3">
              <v-card variant="outlined" class="focus-item-card">
                <v-list density="compact">
                  <v-list-item class="py-2 px-4">
                    <template #prepend>
                      <!-- Checkbox to mark item as done -->
                      <v-checkbox
                        :model-value="item.done"
                        @update:model-value="
                          toggleItemDone(item, $event ?? false)
                        "
                        color="success"
                        hide-details
                        density="compact"
                        style="margin-right: 12px"
                      />
                    </template>

                    <template #default>
                      <div class="d-flex align-center justify-space-between">
                        <div class="flex-grow-1">
                          <!-- Display item text with strikethrough if done -->
                          <v-list-item-title
                            :style="
                              item.done
                                ? 'text-decoration: line-through; color: #888;'
                                : 'color: #333; font-weight: 500;'
                            "
                            class="text-wrap break-word"
                          >
                            {{ item.text }}
                          </v-list-item-title>

                          <!-- Show if this is a subtask and display parent task name -->
                          <v-list-item-subtitle
                            v-if="item.isSubtask"
                            class="mt-1"
                          >
                            <v-icon size="x-small" class="mr-1"
                              >mdi-subdirectory-arrow-right</v-icon
                            >
                            <span class="text-caption">{{
                              item.parentTaskText
                            }}</span>
                          </v-list-item-subtitle>
                        </div>

                        <!-- Remove from focus button (NOT delete) -->
                        <v-btn
                          @click="removeFromFocus(item)"
                          color="grey"
                          icon="mdi-close"
                          size="small"
                          variant="text"
                        />
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
          </template>

          <!-- Empty state message -->
          <template v-else>
            <v-card class="text-center pa-6" variant="outlined">
              <v-icon size="64" color="grey-lighten-1" class="mb-3">
                mdi-bullseye-arrow
              </v-icon>
              <v-card-text class="text-medium-emphasis">
                No items in focus yet.<br />
                Click the bullseye icon on tasks or subtasks to add them here.
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

// Interface for focused items stored in this component
interface FocusedItem {
  id: string; // Unique ID for the focused item entry
  taskId: string; // ID of the task in WeeklyProgressTasks
  subtaskId?: string; // ID of the subtask if this is a subtask focus
  text: string; // Display text
  done: boolean; // Completion status
  isSubtask: boolean; // Whether this is a subtask or main task
  parentTaskText?: string; // Parent task text if this is a subtask
}

// Reactive array to hold all focused items
const focusedItems = ref<FocusedItem[]>([]);

// Load focused items from localStorage on component mount
onMounted(() => {
  const saved = localStorage.getItem("todaysFocusItems");
  if (saved) {
    focusedItems.value = JSON.parse(saved);
  }

  // Listen for custom events from WeeklyProgressTasks component
  window.addEventListener("task-focused", handleTaskFocused as EventListener);
  window.addEventListener(
    "task-unfocused",
    handleTaskUnfocused as EventListener
  );
});

// Handle when a task/subtask is focused from WeeklyProgressTasks
const handleTaskFocused = (event: CustomEvent) => {
  const { taskId, subtaskId, text, isSubtask, parentTaskText } = event.detail;

  // Check if already in focus to prevent duplicates
  const exists = focusedItems.value.some(
    (item) => item.taskId === taskId && item.subtaskId === subtaskId
  );

  if (!exists) {
    // Add new focused item
    focusedItems.value.push({
      id: `${taskId}-${subtaskId || "main"}`,
      taskId,
      subtaskId,
      text,
      done: false,
      isSubtask,
      parentTaskText,
    });
  }
};

// Handle when a task/subtask is unfocused from WeeklyProgressTasks
const handleTaskUnfocused = (event: CustomEvent) => {
  const { taskId, subtaskId } = event.detail;

  // Remove from focused items
  focusedItems.value = focusedItems.value.filter(
    (item) => !(item.taskId === taskId && item.subtaskId === subtaskId)
  );
};

// Remove item from today's focus (does NOT delete from WeeklyProgressTasks)
const removeFromFocus = (item: FocusedItem) => {
  // Dispatch event to notify WeeklyProgressTasks to update its focus state
  window.dispatchEvent(
    new CustomEvent("remove-from-focus", {
      detail: { taskId: item.taskId, subtaskId: item.subtaskId },
    })
  );

  // Remove from local array
  focusedItems.value = focusedItems.value.filter((i) => i.id !== item.id);
};

// Clear all focused items
const clearAllFocus = () => {
  // Notify WeeklyProgressTasks for each item
  focusedItems.value.forEach((item) => {
    window.dispatchEvent(
      new CustomEvent("remove-from-focus", {
        detail: { taskId: item.taskId, subtaskId: item.subtaskId },
      })
    );
  });

  // Clear local array
  focusedItems.value = [];
};

// Toggle done status for a focused item
const toggleItemDone = (item: FocusedItem, done: boolean) => {
  const itemIndex = focusedItems.value.findIndex((i) => i.id === item.id);
  if (itemIndex !== -1) {
    focusedItems.value[itemIndex].done = done;

    // Sync with WeeklyProgressTasks
    window.dispatchEvent(
      new CustomEvent("sync-focus-done", {
        detail: {
          taskId: item.taskId,
          subtaskId: item.subtaskId,
          done,
        },
      })
    );
  }
};

// Watch for changes and save to localStorage
watch(
  focusedItems,
  (newItems) => {
    localStorage.setItem("todaysFocusItems", JSON.stringify(newItems));
  },
  { deep: true }
);
</script>

<style scoped>
/* Styling for focused item cards */
.focus-item-card {
  border: 2px solid #1976d2;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f9ff 0%, #ffffff 100%);
  transition: all 0.2s;
}

.focus-item-card:hover {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  transform: translateY(-2px);
}
</style>
