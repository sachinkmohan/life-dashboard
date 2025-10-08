<template>
  <div class="text-h2">
    <p>WN - {{ currentWeekNumber }}</p>
    <p class="text-h4">Date - {{ currentDate }}</p>
    <!-- Added Vuetify linear progress bar for week progress -->
    <v-row class="mt-4" align="center">
      <v-col cols="12">
        <v-progress-linear
          :model-value="weekProgressPercent"
          height="20"
          color="#8AAFF9"
          rounded
        >
          <template #default>
            <span class="text-body-2 font-weight-bold">
              {{ weekProgressPercent }}% &mdash; {{ daysLeft }} day{{
                daysLeft > 1 ? "s" : ""
              }}
              left
            </span>
          </template>
        </v-progress-linear>
      </v-col>
    </v-row>
    <!-- End of progress bar addition -->

    <!-- Added: Calendar section with navigation and reduced size -->
    <v-row class="mt-6" align="center">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <!-- Added: Month navigation header -->
          <div class="d-flex align-center justify-space-between mb-4">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="previousMonth"
            />
            <h3 class="text-h5">{{ currentMonthYear }}</h3>
            <v-btn icon="mdi-chevron-right" variant="text" @click="nextMonth" />
          </div>
          <!-- Added: v-date-picker component -->
          <v-date-picker
            v-model="selectedDate"
            color="primary"
            show-adjacent-months
            show-week
            hide-header
            elevation="0"
            max-width="350"
            first-day-of-week="1"
          />
        </v-card>
      </v-col>
    </v-row>
    <!-- End of calendar addition -->
  </div>
</template>

<script setup lang="ts">
import { getISOWeek, format } from "date-fns";
import { ref, computed } from "vue";

const currentWeekNumber: number = getISOWeek(new Date());
const currentDate = format(new Date(), "dd-MM-yyyy");

// Added logic to calculate week progress and days left until Sunday
const today = new Date();
const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
const daysLeft = 8 - isoDayOfWeek; // Including today

const weekProgressPercent = Math.round((isoDayOfWeek / 7) * 100); // Including today

// Added: Calendar state management
const selectedDate = ref(new Date());

// Added: Computed property for month/year display
const currentMonthYear = computed(() => {
  return format(selectedDate.value, "MMMM yyyy");
});

// Added: Function to navigate to previous month
const previousMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  selectedDate.value = newDate;
};

// Added: Function to navigate to next month
const nextMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  selectedDate.value = newDate;
};
</script>
