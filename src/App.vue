<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import WeekNumber from "./components/WeekNumber.vue";
import DailyTasks from "./components/DailyTasks.vue";
import CustomCountdown from "./components/CustomCountdown.vue";
import OtherTasks from "./components/OtherTasks.vue";
import WeeklyProgressTasks from "./components/WeeklyProgressTasks.vue";
import ReadingTracker from "./components/ReadingTracker.vue";
import TodaysFocus from "./components/TodaysFocus.vue";
import DataControls from "./components/DataControls.vue"; // NEW: Import DataControls component

const isDarkMode = ref(false);

// NEW: Get all app data for export
const getAllAppData = () => {
  return {
    tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
    dailyTasks: JSON.parse(localStorage.getItem("dailyTasks") || "[]"),
    otherTasks: JSON.parse(localStorage.getItem("otherTasks") || "[]"),
    weeklyProgressTasks: JSON.parse(
      localStorage.getItem("weeklyProgressTasks") || "[]"
    ),
    readingTrackerTasks: JSON.parse(
      localStorage.getItem("readingTrackerTasks") || "[]"
    ),
    todaysFocusItems: JSON.parse(
      localStorage.getItem("todaysFocusItems") || "[]"
    ),
    countdowns: JSON.parse(localStorage.getItem("countdowns") || "[]"),
    otherTasksWeeklyStats: JSON.parse(
      localStorage.getItem("otherTasksWeeklyStats") || "{}"
    ),
  };
};

// NEW: Handle uploaded data and restore to localStorage
const handleDataUpload = (data: any) => {
  try {
    // Restore each data type to localStorage
    if (data.tasks) localStorage.setItem("tasks", JSON.stringify(data.tasks));
    if (data.dailyTasks)
      localStorage.setItem("dailyTasks", JSON.stringify(data.dailyTasks));
    if (data.otherTasks)
      localStorage.setItem("otherTasks", JSON.stringify(data.otherTasks));
    if (data.weeklyProgressTasks)
      localStorage.setItem(
        "weeklyProgressTasks",
        JSON.stringify(data.weeklyProgressTasks)
      );
    if (data.readingTrackerTasks)
      localStorage.setItem(
        "readingTrackerTasks",
        JSON.stringify(data.readingTrackerTasks)
      );
    if (data.todaysFocusItems)
      localStorage.setItem(
        "todaysFocusItems",
        JSON.stringify(data.todaysFocusItems)
      );
    if (data.countdowns)
      localStorage.setItem("countdowns", JSON.stringify(data.countdowns));
    if (data.otherTasksWeeklyStats)
      localStorage.setItem(
        "otherTasksWeeklyStats",
        JSON.stringify(data.otherTasksWeeklyStats)
      );

    // Reload page to reflect changes
    window.location.reload();
  } catch (error) {
    console.error("Failed to restore data:", error);
  }
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  updateBodyClass();
};

const updateBodyClass = () => {
  const body = document.body;
  if (isDarkMode.value) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
};

onMounted(() => {
  updateBodyClass();
});

onUnmounted(() => {
  document.body.classList.remove("dark-mode");
});
</script>

<template>
  <v-btn
    :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    @click="toggleDarkMode"
    :color="isDarkMode ? 'yellow' : 'primary'"
    size="large"
    class="dark-mode-toggle"
    elevation="4"
  >
  </v-btn>

  <v-container fluid class="pa-4">
    <!-- NEW: Data Management section at top with Vuetify 3 spacing -->
    <v-row class="mb-6">
      <v-col cols="12">
        <DataControls :data="getAllAppData()" @data-upload="handleDataUpload" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <TodaysFocus />
      </v-col>

      <v-col cols="4">
        <DailyTasks />
      </v-col>
      <v-col cols="4">
        <OtherTasks />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <WeeklyProgressTasks />
      </v-col>
      <v-col cols="4">
        <WeekNumber />
      </v-col>
      <v-col cols="4">
        <CustomCountdown />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <ReadingTracker />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dark-mode-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<style>
body.dark-mode {
  background-color: #121212 !important;
  color: #ffffff !important;
  transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  background-color: #ffffff;
  color: #000000;
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
