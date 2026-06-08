<template>
  <v-container>
    <h2 class="text-h5 font-weight-bold mb-4">Profile</h2>
    <v-card elevation="2" max-width="500">
      <v-card-text>
        <p><strong>Name:</strong> {{ user?.username }}</p>
        <p><strong>Email:</strong> {{ user?.email }}</p>
        <p><strong>Role:</strong> {{ user?.role }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
</script>
