<script setup lang="ts">
import WeekNumber from "./components/WeekNumber.vue";
import DailyTasks from "./components/DailyTasks.vue";
import CustomCountdown from "./components/CustomCountdown.vue";
import OtherTasks from "./components/OtherTasks.vue";
import WeeklyProgressTasks from "./components/WeeklyProgressTasks.vue";
import ReadingTracker from "./components/ReadingTracker.vue";
import TodaysFocus from "./components/TodaysFocus.vue";
import HeaderControls from "./components/HeaderControls.vue"; // NEW: Import HeaderControls component
import { onMounted } from "vue";
// NEW: Import component visibility composable
import { useComponentVisibility } from "./composables/useComponentVisibility";

// NEW: Get component visibility state
const { visibility } = useComponentVisibility();

onMounted(() => {
  // Initialize dark mode based on saved preference
  const savedPreference = localStorage.getItem("darkMode");
  if (savedPreference === "true") {
    document.body.classList.add("dark-mode");
  }
});
// NEW: Handle dark mode change from HeaderControls component
const handleDarkModeChange = (value: boolean) => {
  const body = document.body;
  if (value) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
  // NEW: Persist dark mode preference
  localStorage.setItem("darkMode", value.toString());
};
</script>

<template>
  <!-- NEW: HeaderControls component replaces all previous header logic -->
  <HeaderControls @dark-mode-change="handleDarkModeChange" />

  <!-- REFACTORED: Single flowing row - components wrap naturally without gaps -->
  <v-container fluid class="mt-8">
    <v-row>
      <!-- Conditionally render TodaysFocus based on visibility -->
      <v-col cols="4" v-if="visibility.notes">
        <TodaysFocus />
      </v-col>

      <!-- Conditionally render DailyTasks based on visibility -->
      <v-col cols="4" v-if="visibility.todos">
        <DailyTasks />
      </v-col>

      <!-- Conditionally render OtherTasks (mapped to calendar) -->
      <v-col cols="4" v-if="visibility.calendar">
        <OtherTasks />
      </v-col>

      <!-- Conditionally render WeeklyProgressTasks based on visibility -->
      <v-col cols="4" v-if="visibility.habits">
        <WeeklyProgressTasks />
      </v-col>

      <!-- Conditionally render WeekNumber (mapped to weather) -->
      <v-col cols="4" v-if="visibility.weather">
        <WeekNumber />
      </v-col>

      <!-- Conditionally render CustomCountdown (mapped to weather) -->
      <v-col cols="4" v-if="visibility.weather">
        <CustomCountdown />
      </v-col>

      <!-- Conditionally render ReadingTracker based on visibility -->
      <v-col cols="4" v-if="visibility.quotes">
        <ReadingTracker />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
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
