<template>
  <!-- NEW: Fixed header container for top-right controls -->
  <div class="header-controls">
    <!-- NEW: Burger menu with data management options -->
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom end"
      offset="8"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-menu"
          color="primary"
          size="large"
          elevation="4"
          class="menu-button"
        />
      </template>

      <!-- NEW: Menu content with data controls -->
      <v-card min-width="280" max-width="320">
        <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
          Data Management
        </v-card-title>

        <v-card-text class="pa-4 pt-2">
          <!-- NEW: Download button in menu -->
          <v-btn
            @click="handleDownload"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-download"
            block
            class="mb-3"
            :loading="isDownloading"
          >
            Download Data
          </v-btn>

          <!-- NEW: Upload button in menu -->
          <v-btn
            @click="handleUploadClick"
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-upload"
            block
            :disabled="isUploading"
          >
            Upload Data
          </v-btn>

          <!-- NEW: Delete All Data button with warning color -->
          <v-btn
            @click="showDeleteDialog = true"
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete-forever"
            block
            class="mt-3"
          >
            Delete All Data
          </v-btn>

          <!-- NEW: Hidden file input -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            @change="handleFileChange"
            style="display: none"
            aria-label="Upload JSON file"
          />

          <!-- NEW: Status message in menu -->
          <v-alert
            v-if="statusMessage"
            :type="statusType"
            class="mt-3"
            density="compact"
            closable
            @click:close="statusMessage = ''"
          >
            {{ statusMessage }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- NEW: Dark mode toggle with proper spacing -->
    <v-btn
      :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      @click="toggleDarkMode"
      :color="isDarkMode ? 'yellow' : 'primary'"
      size="large"
      elevation="4"
      class="dark-mode-toggle"
    />
  </div>

  <!-- NEW: Confirmation dialog for delete all data -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold bg-error text-white pa-4">
        <v-icon start color="white">mdi-alert-circle</v-icon>
        Delete All Data?
      </v-card-title>

      <v-card-text class="pa-6">
        <p class="text-body-1 mb-3">
          This will permanently delete <strong>all your data</strong> including:
        </p>
        <ul class="text-body-2 ml-4 mb-4">
          <li>All tasks (Daily, Other, Weekly Progress)</li>
          <li>Reading tracker data</li>
          <li>Today's focus items</li>
          <li>Countdowns</li>
          <li>Weekly statistics</li>
          <li>All preferences</li>
        </ul>
        <v-alert type="warning" density="compact" class="mb-0">
          <strong>This action cannot be undone!</strong><br />
          Make sure you have downloaded a backup if needed.
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="handleDeleteAllData"
          prepend-icon="mdi-delete-forever"
        >
          Delete All Data
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { downloadJSON, uploadJSON } from "../utils/jsonHandler";
import {
  getAllAppData,
  restoreAppData,
  validateAppData,
} from "../composables/useDataManagement";

// NEW: Component emits for parent communication
interface Emits {
  (e: "darkModeChange", value: boolean): void;
}

const emit = defineEmits<Emits>();

// NEW: Dark mode state
const isDarkMode = ref(false);

// NEW: Menu state
const menuOpen = ref(false);

// NEW: File input ref
const fileInputRef = ref<HTMLInputElement | null>(null);

// NEW: Status state for user feedback
const isDownloading = ref(false);
const isUploading = ref(false);
const statusMessage = ref("");
const statusType = ref<"success" | "error" | "warning" | "info">("info");

// NEW: State for delete confirmation dialog
const showDeleteDialog = ref(false);

// NEW: Handle download from burger menu
const handleDownload = async () => {
  try {
    isDownloading.value = true;
    const data = getAllAppData();
    const timestamp = new Date().toISOString().split("T")[0];
    await downloadJSON(data, `life-dashboard-${timestamp}.json`);
    statusMessage.value = "Data downloaded successfully!";
    statusType.value = "success";
    setTimeout(() => (statusMessage.value = ""), 3000);
  } catch (error) {
    statusMessage.value = "Failed to download data.";
    statusType.value = "error";
    console.error("Download failed:", error);
  } finally {
    isDownloading.value = false;
  }
};

// NEW: Handle upload click
const handleUploadClick = () => {
  fileInputRef.value?.click();
};

// NEW: Handle file change
const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    isUploading.value = true;
    const uploadedData = await uploadJSON(file);

    if (!validateAppData(uploadedData)) {
      throw new Error("Invalid data format");
    }

    restoreAppData(uploadedData);
    statusMessage.value = "Data uploaded successfully! Reloading...";
    statusType.value = "success";

    // Give user time to see the success message before reloading
    setTimeout(() => {
      globalThis.location.reload();
    }, 1000);

    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  } catch (error) {
    statusMessage.value =
      error instanceof Error ? error.message : "Failed to upload JSON file.";
    statusType.value = "error";
    console.error("Upload failed:", error);
  } finally {
    isUploading.value = false;
  }
};

// NEW: Handle delete all data with localStorage clearing
const handleDeleteAllData = () => {
  try {
    // Close the dialog first
    showDeleteDialog.value = false;

    // Clear all localStorage keys related to the app
    const keysToDelete = [
      "tasks",
      "otherTasks",
      "weeklyProgressTasks",
      "readingTrackerTasks",
      "todaysFocusItems",
      "countdowns",
      "otherTasksWeeklyStats",
      "timeByUser",
      "darkMode", // Also clear dark mode preference
    ];

    keysToDelete.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Show success message
    statusMessage.value = "All data deleted successfully! Reloading...";
    statusType.value = "success";

    // Reload page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    statusMessage.value = "Failed to delete data. Please try again.";
    statusType.value = "error";
    console.error("Delete failed:", error);
  }
};

// NEW: Toggle dark mode and emit to parent
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", String(isDarkMode.value));
  emit("darkModeChange", isDarkMode.value);
};

// NEW: Load dark mode preference on mount
onMounted(() => {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  isDarkMode.value = savedDarkMode;
  emit("darkModeChange", savedDarkMode);
});
</script>

<style scoped>
/* NEW: Fixed header container for top-right controls */
.header-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 12px; /* Standard spacing between buttons */
  align-items: center;
}
</style>
