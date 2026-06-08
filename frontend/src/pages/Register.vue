<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="420" elevation="4" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold mb-2">Create Account</v-card-title>
      <v-card-subtitle class="mb-4">Register a new employee account</v-card-subtitle>

      <v-form @submit.prevent="submitRegister">
        <v-text-field v-model="form.username" label="Username" prepend-inner-icon="mdi-account" required />
        <v-text-field v-model="form.email" label="Email" prepend-inner-icon="mdi-email" required />
        <v-text-field v-model="form.password" label="Password" prepend-inner-icon="mdi-lock" type="password" :rules="[v => v.length >= 6 || 'Minimum 6 characters']" required />
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" variant="tonal" class="mb-4">{{ success }}</v-alert>
        <v-btn color="primary" block type="submit" :loading="loading">Register</v-btn>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/login">Already have an account?</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authFetch } from '../utils/api'

const router = useRouter()
const form = ref({ username: '', email: '', password: '' })
const error = ref('')
const success = ref('')
const loading = ref(false)

const submitRegister = async () => {
  error.value = ''
  success.value = ''

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true

  try {
    await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(form.value)
    })

    success.value = 'Registration successful. You can now login.'
    setTimeout(() => router.push('/login'), 700)
  } catch (err) {
    error.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
