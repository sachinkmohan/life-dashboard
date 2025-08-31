<template>
  <div class="text-h2">
    <p>Week Number - {{ currentWeekNumber }}</p>
    <p class="text-h4">Date - {{ currentDate }}</p>
  </div>
</template>

<script setup lang="ts">
import { getISOWeek, format } from "date-fns";

const currentWeekNumber: number = getISOWeek(new Date());
const currentDate = format(new Date(), "dd-MM-yyyy");
</script>
