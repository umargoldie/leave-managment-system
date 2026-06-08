<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="font-weight-bold">
        <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
        Leave Management System
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isLoggedIn" color="error" variant="tonal" @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-if="isLoggedIn" permanent elevation="1">
      <v-list density="compact" nav>
        <v-list-item v-for="item in navItems" :key="item.to" :prepend-icon="item.icon" :title="item.title" :to="item.to" link />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = computed(() => JSON.parse(localStorage.getItem('user') || 'null'))
const isLoggedIn = computed(() => Boolean(localStorage.getItem('token')))

const navItems = computed(() => {
  if (!user.value) return [
    { title: 'Login', icon: 'mdi-login', to: '/login' },
    { title: 'Register', icon: 'mdi-account-plus', to: '/register' }
  ]

  if (user.value.role === 'Admin') {
    return [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
      { title: 'Employees', icon: 'mdi-account-group', to: '/employees' },
      { title: 'Leave Requests', icon: 'mdi-clipboard-list', to: '/leave-requests' },
      { title: 'Users', icon: 'mdi-account-cog', to: '/users' }
    ]
  }

  return [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
    { title: 'My Leaves', icon: 'mdi-calendar-account', to: '/my-leaves' },
    { title: 'Profile', icon: 'mdi-account-circle', to: '/profile' }
  ]
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
