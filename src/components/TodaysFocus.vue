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

                          <!-- Added: Display source component and parent task info -->
                          <div
                            class="mt-1 d-flex align-center"
                            style="gap: 4px"
                          >
                            <!-- Added: Source component badge -->
                            <v-chip
                              :color="getSourceColor(item.sourceComponent)"
                              size="x-small"
                              variant="flat"
                            >
                              <v-icon start size="x-small">{{
                                getSourceIcon(item.sourceComponent)
                              }}</v-icon>
                              {{ item.sourceComponent }}
                            </v-chip>

                            <!-- Show parent task name for subtasks -->
                            <v-chip
                              v-if="item.isSubtask"
                              size="x-small"
                              variant="outlined"
                              color="grey"
                            >
                              <v-icon start size="x-small"
                                >mdi-subdirectory-arrow-right</v-icon
                              >
                              {{ item.parentTaskText }}
                            </v-chip>
                          </div>
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

// Modified: Added sourceComponent field to track which component the item came from
interface FocusedItem {
  id: string;
  taskId: string;
  subtaskId?: string;
  text: string;
  done: boolean;
  isSubtask: boolean;
  parentTaskText?: string;
  sourceComponent: string; // Added: "Daily Tasks", "Other Tasks", or "Weekly Focus"
}

// Reactive array to hold all focused items
const focusedItems = ref<FocusedItem[]>([]);

// Load focused items from localStorage on component mount
onMounted(() => {
  const saved = localStorage.getItem("todaysFocusItems");
  if (saved) {
    focusedItems.value = JSON.parse(saved);
  }

  // Listen for custom events from all task components
  window.addEventListener("task-focused", handleTaskFocused as EventListener);
  window.addEventListener(
    "task-unfocused",
    handleTaskUnfocused as EventListener
  );
});

// Modified: Extract sourceComponent from event detail
const handleTaskFocused = (event: CustomEvent) => {
  const {
    taskId,
    subtaskId,
    text,
    isSubtask,
    parentTaskText,
    sourceComponent,
  } = event.detail;

  // Check if already in focus to prevent duplicates
  const exists = focusedItems.value.some(
    (item) => item.taskId === taskId && item.subtaskId === subtaskId
  );

  if (!exists) {
    // Modified: Include sourceComponent in the focused item
    focusedItems.value.push({
      id: `${taskId}-${subtaskId || "main"}`,
      taskId,
      subtaskId,
      text,
      done: false,
      isSubtask,
      parentTaskText,
      sourceComponent, // Added: Store source component name
    });
  }
};

// Handle when a task/subtask is unfocused
const handleTaskUnfocused = (event: CustomEvent) => {
  const { taskId, subtaskId } = event.detail;

  // Remove from focused items
  focusedItems.value = focusedItems.value.filter(
    (item) => !(item.taskId === taskId && item.subtaskId === subtaskId)
  );
};

// Remove item from today's focus (does NOT delete from source component)
const removeFromFocus = (item: FocusedItem) => {
  // Dispatch event to notify source component to update its focus state
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
  // Notify source components for each item
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

    // Sync with source component
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

// Added: Get color for source component badge
const getSourceColor = (sourceComponent: string) => {
  switch (sourceComponent) {
    case "Daily Tasks":
      return "blue";
    case "Other Tasks":
      return "purple";
    case "Weekly Focus":
      return "green";
    default:
      return "grey";
  }
};

// Added: Get icon for source component badge
const getSourceIcon = (sourceComponent: string) => {
  switch (sourceComponent) {
    case "Daily Tasks":
      return "mdi-calendar-check";
    case "Other Tasks":
      return "mdi-clipboard-list";
    case "Weekly Focus":
      return "mdi-target";
    default:
      return "mdi-star";
  }
};
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
