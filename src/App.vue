<script setup lang="ts">
import WeekNumber from "./components/WeekNumber.vue";
import DailyTasks from "./components/DailyTasks.vue";
import CustomCountdown from "./components/CustomCountdown.vue";
import OtherTasks from "./components/OtherTasks.vue";
import WeeklyProgressTasks from "./components/WeeklyProgressTasks.vue";
</script>

<template>
  <v-container fluid>
    <v-row>
      <!-- Changed: Only WeekNumber and DailyTasks in first row -->
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
      <!-- Changed: CustomCountdown in second row, full width -->
      <v-col cols="5">
        <CustomCountdown />
      </v-col>
      <v-col cols="7">
        <WeeklyProgressTasks />
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
