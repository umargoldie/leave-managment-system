import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../pages/Register.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../pages/Dashboard.vue') },
  { path: '/employees', name: 'Employees', component: () => import('../pages/Employees.vue') },
  { path: '/leave-requests', name: 'LeaveRequests', component: () => import('../pages/LeaveRequests.vue') },
  { path: '/users', name: 'Users', component: () => import('../pages/Users.vue') },
  { path: '/my-leaves', name: 'MyLeaves', component: () => import('../pages/MyLeaves.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../pages/Profile.vue') },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token && to.path !== '/login' && to.path !== '/register') {
    return next('/login')
  }

  if (token && (to.path === '/login' || to.path === '/register')) {
    return next('/dashboard')
  }

  if (token && user?.role === 'Employee' && ['/employees', '/users'].includes(to.path)) {
    return next('/dashboard')
  }

  next()
})

export default router
