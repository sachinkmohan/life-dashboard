<template>
  <!-- NEW: Modal dialog for component visibility settings -->
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <!-- NEW: Modal header -->
      <v-card-title class="text-h6 font-weight-bold bg-primary text-white pa-4">
        <v-icon start color="white">mdi-view-dashboard-outline</v-icon>
        Dashboard Components
      </v-card-title>

      <v-card-text class="pa-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Choose which components to display on your dashboard:
        </p>

        <!-- NEW: Checkbox list for each component -->
        <div class="component-list">
          <!-- Weather Component Toggle -->
          <v-checkbox
            v-model="localVisibility.weather"
            label="Weather Widget"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Weather Widget</div>
                <div class="text-caption text-medium-emphasis">
                  Current weather and forecast
                </div>
              </div>
            </template>
          </v-checkbox>

          <v-divider class="my-2" />

          <!-- Calendar Component Toggle -->
          <v-checkbox
            v-model="localVisibility.calendar"
            label="Calendar View"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Calendar View</div>
                <div class="text-caption text-medium-emphasis">
                  Monthly calendar with events
                </div>
              </div>
            </template>
          </v-checkbox>

          <v-divider class="my-2" />

          <!-- Daily Tasks Component Toggle -->
          <v-checkbox
            v-model="localVisibility.todos"
            label="Daily Tasks"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Daily Tasks</div>
                <div class="text-caption text-medium-emphasis">
                  Your daily to-do list
                </div>
              </div>
            </template>
          </v-checkbox>

          <v-divider class="my-2" />

          <!-- Habits Component Toggle -->
          <v-checkbox
            v-model="localVisibility.habits"
            label="Weekly Progress"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Weekly Progress</div>
                <div class="text-caption text-medium-emphasis">
                  Track weekly habits and goals
                </div>
              </div>
            </template>
          </v-checkbox>

          <v-divider class="my-2" />

          <!-- Notes Component Toggle -->
          <v-checkbox
            v-model="localVisibility.notes"
            label="Today's Focus"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Today's Focus</div>
                <div class="text-caption text-medium-emphasis">
                  Quick notes and focus area
                </div>
              </div>
            </template>
          </v-checkbox>

          <v-divider class="my-2" />

          <!-- Quotes Component Toggle -->
          <v-checkbox
            v-model="localVisibility.quotes"
            label="Reading Tracker"
            color="primary"
            hide-details
            class="mb-2"
          >
            <template v-slot:label>
              <div>
                <div class="font-weight-medium">Reading Tracker</div>
                <div class="text-caption text-medium-emphasis">
                  Track your reading progress
                </div>
              </div>
            </template>
          </v-checkbox>
        </div>
      </v-card-text>

      <!-- NEW: Action buttons -->
      <v-card-actions class="pa-4 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="handleReset"
          prepend-icon="mdi-refresh"
        >
          Reset to Defaults
        </v-btn>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="handleCancel">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSave"
          prepend-icon="mdi-check"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useComponentVisibility } from "../composables/useComponentVisibility";

// NEW: Props for v-model support
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// NEW: Emits for v-model support
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

// NEW: Get visibility composable
const { visibility, resetToDefaults } = useComponentVisibility();

// NEW: Local state to prevent unwanted changes until "Save" is clicked
const localVisibility = ref({ ...visibility.value });

// NEW: Computed property for dialog open state
const isOpen = ref(props.modelValue);

// NEW: Watch for prop changes to update local state
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
      // Reset local state when opening modal
      localVisibility.value = { ...visibility.value };
    }
  }
);

// NEW: Watch for local isOpen changes to emit to parent
watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
});

// NEW: Handle save button click
const handleSave = () => {
  // Commit local changes to actual visibility state
  visibility.value = { ...localVisibility.value };
  isOpen.value = false;
};

// NEW: Handle cancel button click
const handleCancel = () => {
  // Discard local changes and close modal
  localVisibility.value = { ...visibility.value };
  isOpen.value = false;
};

// NEW: Handle reset to defaults
const handleReset = () => {
  // Reset to default visibility
  resetToDefaults();
  localVisibility.value = { ...visibility.value };
};
</script>

<style scoped>
.component-list {
  max-height: 400px;
  overflow-y: auto;
}

/* NEW: Custom styling for checkbox labels */
:deep(.v-checkbox .v-label) {
  opacity: 1;
}
</style>
