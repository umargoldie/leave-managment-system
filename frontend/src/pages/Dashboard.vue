<template>
  <v-container fluid>
    <h2 class="text-h5 font-weight-bold mb-4">Dashboard</h2>
    <p class="text-medium-emphasis mb-6">Welcome back, {{ user?.username || 'User' }}.</p>

    <v-row v-if="user?.role === 'Admin'">
      <v-col cols="12" sm="6" md="3"><v-card color="indigo-darken-1" theme="dark"><v-card-item title="Total Users" subtitle="Registered accounts"><div class="text-h3 font-weight-bold mt-2">{{ stats.users }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="teal-darken-1" theme="dark"><v-card-item title="Total Employees" subtitle="Employee records"><div class="text-h3 font-weight-bold mt-2">{{ stats.employees }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="amber-darken-1" theme="dark"><v-card-item title="Total Leave Requests" subtitle="All requests"><div class="text-h3 font-weight-bold mt-2">{{ stats.leaves }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="success-darken-1" theme="dark"><v-card-item title="Approved" subtitle="Granted requests"><div class="text-h3 font-weight-bold mt-2">{{ stats.approved }}</div></v-card-item></v-card></v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" sm="6" md="3"><v-card color="indigo-darken-1" theme="dark"><v-card-item title="My Leave Requests" subtitle="All your requests"><div class="text-h3 font-weight-bold mt-2">{{ myStats.total }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="warning" theme="dark"><v-card-item title="Pending" subtitle="Awaiting review"><div class="text-h3 font-weight-bold mt-2">{{ myStats.pending }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="success" theme="dark"><v-card-item title="Approved" subtitle="Granted leaves"><div class="text-h3 font-weight-bold mt-2">{{ myStats.approved }}</div></v-card-item></v-card></v-col>
      <v-col cols="12" sm="6" md="3"><v-card color="error" theme="dark"><v-card-item title="Rejected" subtitle="Declined leaves"><div class="text-h3 font-weight-bold mt-2">{{ myStats.rejected }}</div></v-card-item></v-card></v-col>
    </v-row>

    <v-card class="mt-6" elevation="2">
      <v-card-title>{{ user?.role === 'Admin' ? 'Recent Leave Requests' : 'My Leave Requests' }}</v-card-title>
      <v-card-text>
        <v-table>
          <thead>
            <tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleLeaves" :key="item.id">
              <td>{{ item.employeeId || item.employee || '—' }}</td>
              <td>{{ item.leaveType || '—' }}</td>
              <td>{{ item.startDate }} → {{ item.endDate }}</td>
              <td><v-chip :color="statusColor(item.status)" size="small">{{ item.status }}</v-chip></td>
            </tr>
            <tr v-if="visibleLeaves.length === 0"><td colspan="4" class="text-center py-4">No leave requests found.</td></tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { authFetch } from '../utils/api'

const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const leaves = ref([])
const employees = ref([])
const users = ref([])

const stats = computed(() => ({
  users: users.value.length,
  employees: employees.value.length,
  leaves: leaves.value.length,
  approved: leaves.value.filter(item => String(item.status).toLowerCase() === 'approved').length,
  pending: leaves.value.filter(item => String(item.status).toLowerCase() === 'pending').length,
  rejected: leaves.value.filter(item => String(item.status).toLowerCase() === 'rejected').length
}))

const myStats = computed(() => {
  const mine = leaves.value.filter(item => String(item.employeeId) === String(user.value?.id))
  return {
    total: mine.length,
    pending: mine.filter(item => String(item.status).toLowerCase() === 'pending').length,
    approved: mine.filter(item => String(item.status).toLowerCase() === 'approved').length,
    rejected: mine.filter(item => String(item.status).toLowerCase() === 'rejected').length
  }
})

const visibleLeaves = computed(() => {
  if (user.value?.role === 'Admin') return leaves.value
  return leaves.value.filter(item => String(item.employeeId) === String(user.value?.id))
})

const statusColor = (status) => ({ Pending: 'warning', Approved: 'success', Rejected: 'error' }[status] || 'primary')

const load = async () => {
  try {
    const [leaveData, employeeData, userData] = await Promise.all([
      authFetch('/leaves'),
      authFetch('/employees'),
      user.value?.role === 'Admin' ? authFetch('/users') : Promise.resolve([])
    ])

    leaves.value = leaveData
    employees.value = employeeData
    users.value = userData
  } catch (error) {
    console.error(error)
  }
}

onMounted(load)
</script>
