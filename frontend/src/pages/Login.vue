<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="420" elevation="4" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold mb-2">Sign In</v-card-title>
      <v-card-subtitle class="mb-4">Access your Leave Management dashboard</v-card-subtitle>

      <v-form @submit.prevent="submitLogin">
        <v-text-field v-model="form.email" label="Email" prepend-inner-icon="mdi-email" required />
        <v-text-field v-model="form.password" label="Password" prepend-inner-icon="mdi-lock" type="password" required />
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
        <v-btn color="primary" block type="submit" :loading="loading">Login</v-btn>
      </v-form>

      <div class="text-center mt-4">
        <router-link to="/register">Create an account</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authFetch } from '../utils/api'

const router = useRouter()
const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

const submitLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(form.value)
    })

    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
