<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="font-weight-bold">
        <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
        Leave Management System
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-bell"></v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent elevation="1">
      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-view-dashboard" 
          title="Dashboard" 
          :active="currentTab === 'dashboard'"
          @click="currentTab = 'dashboard'"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-account-plus" 
          title="Add Employee" 
          :active="currentTab === 'add-employee'"
          @click="currentTab = 'add-employee'"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-file-document-plus" 
          title="Apply Leave" 
          :active="currentTab === 'apply-leave'"
          @click="currentTab = 'apply-leave'"
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-clipboard-list" 
          title="Leave Requests" 
          :active="currentTab === 'leave-requests'"
          @click="currentTab = 'leave-requests'"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        
        <div v-if="currentTab === 'dashboard'">
          <h2 class="text-h5 font-weight-bold mb-4">System Overview</h2>
          <v-row>
            <v-col cols="12" sm="4">
              <v-card color="indigo-darken-1" theme="dark" elevation="3">
                <v-card-item title="Total Employees">
                  <template v-slot:subtitle>Registered in System</template>
                  <div class="text-h3 font-weight-bold mt-2">{{ totalEmployees }}</div>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card color="warning" theme="dark" elevation="3">
                <v-card-item title="Pending Requests">
                  <template v-slot:subtitle>Awaiting Approval</template>
                  <div class="text-h3 font-weight-bold mt-2">{{ pendingLeaves }}</div>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card color="success" theme="dark" elevation="3">
                <v-card-item title="Approved Leaves">
                  <template v-slot:subtitle>Active / Granted</template>
                  <div class="text-h3 font-weight-bold mt-2">{{ approvedLeaves }}</div>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-if="currentTab === 'add-employee'">
          <v-card max-width="600" class="mx-auto pa-4" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-2">Register New Employee</v-card-title>
            <v-form @submit.prevent="submitEmployee">
              <v-text-field v-model="employeeForm.fullName" label="Full Name" prepend-inner-icon="mdi-account" required></v-text-field>
              <v-text-field v-model="employeeForm.designation" label="Designation" prepend-inner-icon="mdi-briefcase" required></v-text-field>
              <v-text-field v-model="employeeForm.department" label="Department" prepend-inner-icon="mdi-office-building" required></v-text-field>
              <v-btn type="submit" color="primary" block class="mt-4">Save Employee</v-btn>
            </v-form>
          </v-card>
        </div>

        <div v-if="currentTab === 'apply-leave'">
          <v-card max-width="600" class="mx-auto pa-4" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-2">Submit Leave Application</v-card-title>
            <v-form @submit.prevent="submitLeave">
              <v-select v-model="leaveForm.employeeId" :items="employees" item-title="name" item-value="id" label="Select Employee" prepend-inner-icon="mdi-account-box" required></v-select>
              <v-select v-model="leaveForm.leaveType" :items="leaveTypes" label="Leave Type" prepend-inner-icon="mdi-calendar-range" required></v-select>
              <v-text-field v-model="leaveForm.startDate" type="date" label="Start Date" prepend-inner-icon="mdi-calendar-start" required></v-text-field>
              <v-text-field v-model="leaveForm.endDate" type="date" label="End Date" prepend-inner-icon="mdi-calendar-end" :error="leaveForm.endDate && leaveForm.startDate && leaveForm.endDate < leaveForm.startDate" :error-messages="leaveForm.endDate && leaveForm.startDate && leaveForm.endDate < leaveForm.startDate ? 'End Date cannot be before Start Date' : ''" required></v-text-field>
              <v-textarea v-model="leaveForm.reason" label="Reason for Leave" prepend-inner-icon="mdi-comment-text" rows="3" required></v-textarea>
              <v-btn type="submit" color="warning" block class="mt-4" :disabled="!leaveForm.employeeId || (leaveForm.endDate && leaveForm.startDate && leaveForm.endDate < leaveForm.startDate)">Submit Application</v-btn>
            </v-form>
          </v-card>
        </div>

        <div v-if="currentTab === 'leave-requests'">
          <h2 class="text-h5 font-weight-bold mb-4">Manage Leave Applications</h2>
          <v-card elevation="2">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Emp ID</th>
                  <th class="text-left font-weight-bold">Leave Type</th>
                  <th class="text-left font-weight-bold">Duration</th>
                  <th class="text-left font-weight-bold">Reason</th>
                  <th class="text-left font-weight-bold">Status</th>
                  <th class="text-center font-weight-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in leaves" :key="leave.id">
                  <td>{{ leave.employeeId }}</td>
                  <td>{{ leave.leaveType }}</td>
                  <td>{{ leave.startDate }} to {{ leave.endDate }}</td>
                  <td class="text-truncate" style="max-width: 200px;">{{ leave.reason }}</td>
                  <td>
                    <v-chip
                      :color="leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'error' : 'warning'"
                      size="small"
                      class="font-weight-bold"
                    >
                      {{ leave.status }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn v-if="leave.status === 'Pending'" color="success" size="small" class="mr-2" icon="mdi-check" @click="approveLeave(leave.id)"></v-btn>
                    <v-btn v-if="leave.status === 'Pending'" color="error" size="small" icon="mdi-close" @click="rejectLeave(leave.id)"></v-btn>
                    <span v-else class="text-caption">—</span>
                  </td>
                </tr>
                <tr v-if="leaves.length === 0">
                  <td colspan="6" class="text-center py-4">No leave requests found.</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'http://localhost:3000'
const currentTab = ref('dashboard')
const employees = ref([])
const leaves = ref([])

const employeeForm = ref({
  fullName: '',
  designation: '',
  department: ''
})

const leaveForm = ref({
  employeeId: null,
  leaveType: 'Casual Leave',
  startDate: '',
  endDate: '',
  reason: ''
})

const leaveTypes = ['Casual Leave', 'Sick Leave', 'Annual Leave']

const totalEmployees = computed(() => employees.value.length)
const pendingLeaves = computed(() => leaves.value.filter(leave => String(leave.status).toLowerCase() === 'pending').length)
const approvedLeaves = computed(() => leaves.value.filter(leave => String(leave.status).toLowerCase() === 'approved').length)

const fetchEmployees = async () => {
  try {
    const response = await fetch(`${API_BASE}/employees`)
    if (!response.ok) throw new Error('Failed to load employees')
    employees.value = await response.json()

    if (!leaveForm.value.employeeId && employees.value.length > 0) {
      leaveForm.value.employeeId = employees.value[0].id
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchLeaves = async () => {
  try {
    const response = await fetch(`${API_BASE}/leaves`)
    if (!response.ok) throw new Error('Failed to load leaves')
    leaves.value = await response.json()
  } catch (error) {
    console.error(error)
  }
}

const fetchDashboardData = async () => {
  await Promise.all([fetchEmployees(), fetchLeaves()])
}

const resetEmployeeForm = () => {
  employeeForm.value.fullName = ''
  employeeForm.value.designation = ''
  employeeForm.value.department = ''
}

const resetLeaveForm = () => {
  leaveForm.value.leaveType = 'Casual Leave'
  leaveForm.value.startDate = ''
  leaveForm.value.endDate = ''
  leaveForm.value.reason = ''
  if (employees.value.length > 0) {
    leaveForm.value.employeeId = employees.value[0].id
  }
}

const submitEmployee = async () => {
  try {
    const payload = {
      fullName: employeeForm.value.fullName,
      designation: employeeForm.value.designation,
      department: employeeForm.value.department
    }

    const response = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed to submit employee')

    await fetchEmployees()
    resetEmployeeForm()
    currentTab.value = 'dashboard'
  } catch (error) {
    console.error(error)
  }
}

const submitLeave = async () => {
  try {
    const payload = {
      employeeId: leaveForm.value.employeeId,
      leaveType: leaveForm.value.leaveType,
      startDate: leaveForm.value.startDate,
      endDate: leaveForm.value.endDate,
      reason: leaveForm.value.reason
    }

    const response = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed to submit leave')

    await fetchLeaves()
    resetLeaveForm()
    currentTab.value = 'dashboard'
  } catch (error) {
    console.error(error)
  }
}

const approveLeave = async (leaveId) => {
  try {
    const response = await fetch(`${API_BASE}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    })

    if (!response.ok) throw new Error('Failed to approve leave')

    await fetchLeaves()
  } catch (error) {
    console.error(error)
  }
}

const rejectLeave = async (leaveId) => {
  try {
    const response = await fetch(`${API_BASE}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' })
    })

    if (!response.ok) throw new Error('Failed to reject leave')

    await fetchLeaves()
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchDashboardData)
</script>

<style>
/* Pure project ka default font smooth karne ke liye */
body {
  font-family: 'Roboto', sans-serif;
}
</style>