# Leave Management System

This project now includes Phase 1.5 authentication, JWT handling, role-based access control, and protected frontend routes.

## What is included

### 1. Authentication APIs
- POST /auth/register
  - Validates username, email, and password
  - Requires a valid email format
  - Requires password length of at least 6 characters
  - Hashes passwords with bcrypt before saving
- POST /auth/login
  - Verifies email and password
  - Returns a JWT token and safe user metadata

### 2. JWT Token handling
- The backend signs JWTs with the user payload: id, username, and role.
- The frontend stores the token and user object in localStorage after login.
- Protected API requests use the Authorization: Bearer <token> header automatically.

### 3. Role-Based Access Control (RBAC)
- Admin
  - Can access dashboard, employees, leave requests, and users management routes
  - Can approve or reject leave requests
  - Can manage users
- Employee
  - Can access the dashboard, personal leave information, and profile
  - Cannot access admin-only pages such as /employees or /users

### 4. Frontend Route Guards
- Unauthenticated users are redirected to /login
- Authenticated users visiting /login or /register are redirected to /dashboard
- Employees are blocked from admin-only routes and sent back to the dashboard

### 5. Admin and leave workflow improvements
- Admin-only user CRUD routes are available under /users
- Admin approval/rejection endpoints are available under /leaves/:id/approve and /leaves/:id/reject
- Finalized leave requests cannot be updated or deleted

## Setup Instructions

### Backend
1. Go to the backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Start the backend server:
   node server.js

### Frontend
1. Go to the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Start the Vite app:
   npm run dev

### Default URLs
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Notes
- The backend uses Fastify, bcrypt, and @fastify/jwt.
- The frontend uses Vue 3 + Vite + Vuetify and stores auth state in localStorage.
