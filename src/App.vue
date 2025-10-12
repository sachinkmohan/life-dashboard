<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import WeekNumber from "./components/WeekNumber.vue";
import DailyTasks from "./components/DailyTasks.vue";
import CustomCountdown from "./components/CustomCountdown.vue";
import OtherTasks from "./components/OtherTasks.vue";
import WeeklyProgressTasks from "./components/WeeklyProgressTasks.vue";
import ReadingTracker from "./components/Reading Tracker.vue";

const isDarkMode = ref(false);

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

  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <WeekNumber />
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
        <CustomCountdown />
      </v-col>
      <v-col cols="4">
        <WeeklyProgressTasks />
      </v-col>
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
