<template>
  <!-- NEW: Data controls section with Vuetify 3 card for visual hierarchy -->
  <v-card elevation="2" class="pa-4">
    <!-- NEW: Section heading -->
    <v-card-title class="text-h6 font-weight-bold pa-0 mb-4">
      Data Management
    </v-card-title>

    <!-- NEW: Button group with Vuetify 3 spacing utilities -->
    <v-card-text class="pa-0">
      <div class="d-flex ga-3 flex-wrap">
        <!-- NEW: Download button - primary action with elevated variant -->
        <v-btn
          @click="handleDownload"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-download"
          size="large"
          :loading="isDownloading"
        >
          Download Data
        </v-btn>

        <!-- NEW: Upload button - secondary action with outlined variant -->
        <v-btn
          @click="handleUploadClick"
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-upload"
          size="large"
          :disabled="isUploading"
        >
          Upload Data
        </v-btn>

        <!-- NEW: Hidden file input for upload functionality -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          @change="handleFileChange"
          style="display: none"
          aria-label="Upload JSON file"
        />
      </div>

      <!-- NEW: Status message alert with Vuetify 3 alert component -->
      <v-alert
        v-if="statusMessage"
        :type="statusType"
        class="mt-4"
        closable
        @click:close="statusMessage = ''"
        density="compact"
      >
        {{ statusMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { downloadJSON, uploadJSON } from "../utils/jsonHandler";
// NEW: Import data management functions from composable
import {
  getAllAppData,
  restoreAppData,
  validateAppData,
} from "../composables/useDataManagement";

// NEW: Component state management
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDownloading = ref(false);
const isUploading = ref(false);
const statusMessage = ref("");
const statusType = ref<"success" | "error" | "warning" | "info">("info");

// MODIFIED: Simplified - now uses composable function
const handleDownload = async () => {
  try {
    isDownloading.value = true;
    const data = getAllAppData(); // NEW: Use composable function
    const timestamp = new Date().toISOString().split("T")[0];
    await downloadJSON(data, `life-dashboard-${timestamp}.json`);
    statusMessage.value = "Data downloaded successfully!";
    statusType.value = "success";
  } catch (error) {
    statusMessage.value = "Failed to download data. Please try again.";
    statusType.value = "error";
    console.error("Download failed:", error);
  } finally {
    isDownloading.value = false;
  }
};

// NEW: Handle upload button click - triggers file input
const handleUploadClick = () => {
  fileInputRef.value?.click();
};

// MODIFIED: Enhanced with validation and uses composable
const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    isUploading.value = true;
    const uploadedData = await uploadJSON(file);

    // NEW: Validate data before restoring
    if (!validateAppData(uploadedData)) {
      throw new Error("Invalid data format");
    }

    // NEW: Use composable function to restore data
    restoreAppData(uploadedData);

    statusMessage.value = "Data uploaded successfully! Reloading...";
    statusType.value = "success";

    // Reset input
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  } catch (error) {
    statusMessage.value =
      error instanceof Error
        ? error.message
        : "Failed to upload JSON file. Please check the file format.";
    statusType.value = "error";
    console.error("Upload failed:", error);
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
/* NEW: Container styling with proper spacing */
.data-controls {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(25, 118, 210, 0.04);
}

/* NEW: Gap utility for spacing between buttons */
.gap-3 {
  gap: 12px;
}

/* NEW: Responsive adjustments for mobile screens */
@media (max-width: 600px) {
  .data-controls {
    padding: 12px;
  }

  .d-flex {
    flex-direction: column;
  }

  .d-flex > * {
    width: 100%;
  }
}
</style>
