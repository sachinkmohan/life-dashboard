<template>
  <v-app class="ml-15">
    <v-btn
      @click="isHidden = !isHidden"
      class="ma-5"
      max-width="200px"
      color="green"
    >
      Show Add button
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
                <p class="ml-5">{{ item.title }}</p>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn icon @click="deleteCountdown(item.id)" color="red">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <Countdown
              :deadline="item.countdown"
              countdownSize="1.5rem"
              labelSize="0.9rem"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
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

// Helper: Get today's date in YYYY-MM-DD 00:00:00 format
function getToday(): string {
  // Added: Helper to get today's date as required string
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 22:30:00`;
}

// State variables
const newTitle = ref<string>("");
const newCountdown = ref<string>(getToday()); // Changed: default to today
const countdowns = ref<CountdownItem[]>([]);
const isHidden = ref<boolean>(true);
const defaultInputCountdownText = ref<string>("Today");

// Helper: Generate unique ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Load countdowns from localStorage
function fetchCountdowns() {
  // Added: localStorage fetch logic
  const stored = localStorage.getItem("countdowns");
  countdowns.value = stored ? JSON.parse(stored) : [];
}

// Save countdowns to localStorage
function saveCountdowns() {
  // Added: localStorage save logic
  localStorage.setItem("countdowns", JSON.stringify(countdowns.value));
}

// Add new countdown
function addCountdown() {
  // ...existing code...
  const title = newTitle.value.trim();
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
  newTitle.value = "";
  newCountdown.value = getToday(); // Changed: reset to today after add
}

// Delete countdown by id
function deleteCountdown(id: string) {
  // Changed: Remove from localStorage
  countdowns.value = countdowns.value.filter((item) => item.id !== id);
  saveCountdowns();
}

// On mount, fetch countdowns
onMounted(() => {
  fetchCountdowns();
});
</script>
