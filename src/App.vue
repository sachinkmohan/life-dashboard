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

  <!-- SIMPLIFIED: Only container with dashboard components -->
  <v-container fluid class="mt-8">
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
