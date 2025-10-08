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
  </div>
</template>

<script setup lang="ts">
import { getISOWeek, format } from "date-fns";
// Added import for Vuetify components
import { ref, computed } from "vue";

const currentWeekNumber: number = getISOWeek(new Date());
const currentDate = format(new Date(), "dd-MM-yyyy");

// Added logic to calculate week progress and days left until Sunday
const today = new Date();
const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
const daysLeft = 7 - dayOfWeek; // Including today

const weekProgressPercent = Math.round(((dayOfWeek + 1) / 7) * 100); // Including today
</script>
