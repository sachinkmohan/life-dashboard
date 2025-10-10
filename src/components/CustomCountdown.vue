<template>
  <div>
    <v-btn
      @click="isHidden = !isHidden"
      class="ma-5"
      max-width="200px"
      color="green"
    >
      Toggle CountDown
    </v-btn>
    <v-container>
      <!-- Add a hide toggle button-->
      <v-row v-if="isHidden === false">
        <v-col cols="12" sm="6">
          <v-text-field
            label="Title"
            v-model="defaultInputCountdownText"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            label="Target Date"
            hint="YYYY-MM-DD 24:59:59"
            v-model="newCountdown"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn color="primary" @click="addCountdown">Add Countdown</v-btn>
        </v-col>
      </v-row>

      <v-row>
        <!-- Changed: Use full width for each countdown card -->
        <v-col cols="12" v-for="item in countdowns" :key="item.id">
          <!-- Changed: Use Vuetify 3 card for countdown display -->
          <v-card class="mb-4 pa-4">
            <v-row align="center">
              <v-col>
                <p class="ml-5 text-h6">{{ item.title }}</p>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn
                  icon="mdi-delete"
                  @click="deleteCountdown(item.id)"
                  color="red-lighten-2"
                  size="small"
                  variant="text"
                >
                </v-btn>
              </v-col>
            </v-row>
            <Countdown
              :deadline="item.countdown"
              countdownSize="1.5rem"
              labelSize="0.9rem"
              mainColor="#e08996"
              secondFlipColor="orange"
            />
            <v-card-text class="mt-2 pulse">
              {{ item.countdown }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
//@ts-ignore
import { Countdown } from "vue3-flip-countdown";

// Type for countdown item
interface CountdownItem {
  id: string;
  title: string;
  countdown: string;
}

// State variables
// timeByUser should be fetched from localStorage, default value "00:00:00"
const timeByUser = ref<string>(
  localStorage.getItem("timeByUser") || "00:00:00"
);
const newCountdown = ref<string>(getToday()); // Changed: default to today
const countdowns = ref<CountdownItem[]>([]);
const isHidden = ref<boolean>(true);
const defaultInputCountdownText = ref<string>("Today");

// Helper: Get today's date in YYYY-MM-DD 00:00:00 format
function getToday(): string {
  // Added: Helper to get today's date as required string
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${timeByUser.value}`;
}

// Helper: Generate unique ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11);
}

// Load countdowns from localStorage
function fetchCountdowns() {
  // Added: localStorage fetch logic
  const stored = localStorage.getItem("countdowns");
  countdowns.value = stored ? JSON.parse(stored) : [];
}

function resetTodaysCountdown() {
  const stored = localStorage.getItem("countdowns");
  countdowns.value = stored ? JSON.parse(stored) : [];
  for (let item of countdowns.value) {
    if (item.title === "Today") {
      item.countdown = getToday();
      saveCountdowns();
      break;
    }
  }
}

// Save countdowns to localStorage
function saveCountdowns() {
  localStorage.setItem("countdowns", JSON.stringify(countdowns.value));
}

function addCountdown() {
  const title = defaultInputCountdownText.value.trim(); // Changed from newTitle.value
  const countdownVal = newCountdown.value.trim();
  if (!title || !countdownVal) {
    return;
  }
  const newItem: CountdownItem = {
    id: generateId(),
    title,
    countdown: countdownVal,
  };
  countdowns.value.push(newItem);
  saveCountdowns();
  defaultInputCountdownText.value = "Today"; // Changed: reset title input
  timeByUser.value = newCountdown.value.slice(11); //set new time set by user for new countdown
  localStorage.setItem("timeByUser", timeByUser.value);
  newCountdown.value = getToday();
}

// Delete countdown by id
function deleteCountdown(id: string) {
  // Changed: Remove from localStorage
  countdowns.value = countdowns.value.filter((item) => item.id !== id);
  saveCountdowns();
}

// On mount, fetch countdowns
onMounted(() => {
  resetTodaysCountdown();
  fetchCountdowns();
});
</script>

<style scoped>
.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
