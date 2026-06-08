const fastify = require('fastify')({ logger: true });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

fastify.register(require('@fastify/jwt'), {
  secret: 'super-secret-key'
});

// Frontend connection allow karne ke liye CORS register karein
fastify.register(require('@fastify/cors'), { 
  origin: ['http://localhost:5175', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// JSON files ke paths define kar diye
const employeesPath = path.join(__dirname, 'data', 'employees.json');
const leavesPath = path.join(__dirname, 'data', 'leaves.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

// Helper function: JSON file se data read karne ke liye
const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        return [];
    }
};

// Helper function: JSON file mein data write (save) karne ke liye
const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// ==========================================
// AUTH ROUTES
// ==========================================
fastify.post('/auth/register', async (request, reply) => {
    const { username, email, password, role } = request.body || {};

    if (!username || !username.trim()) {
        return reply.code(400).send({ error: 'Username is required' });
    }

    if (!email || !email.trim()) {
        return reply.code(400).send({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return reply.code(400).send({ error: 'Email format is invalid' });
    }

    if (!password || password.length < 6) {
        return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }

    const users = readData(usersPath);
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        return reply.code(409).send({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role || 'Employee'
    };

    users.push(newUser);
    writeData(usersPath, users);

    const { password: _, ...userWithoutPassword } = newUser;
    return reply.code(201).send({ message: 'User registered successfully', user: userWithoutPassword });
});

fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !email.trim()) {
        return reply.code(400).send({ error: 'Email is required' });
    }

    if (!password) {
        return reply.code(400).send({ error: 'Password is required' });
    }

    const users = readData(usersPath);
    const user = users.find(item => item.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
        return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = fastify.jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
});

// ==========================================
// EMPLOYEES CRUD ROUTES
// ==========================================

// 1. POST: Naya Employee add karne ke liye
fastify.post('/employees', async (request, reply) => {
    const employees = readData(employeesPath);
    const newEmployee = request.body;
    
    // Generate unique ID using timestamp
    newEmployee.id = Date.now().toString();
    
    employees.push(newEmployee);
    writeData(employeesPath, employees);
    
    return reply.code(201).send(newEmployee);
});

// 2. GET: Saare Employees dekhne ke liye
fastify.get('/employees', async (request, reply) => {
    const employees = readData(employeesPath);
    return employees;
});

// 3. GET (by ID): Kisi ek Employee ko ID se dhoondne ke liye
fastify.get('/employees/:id', async (request, reply) => {
    const employees = readData(employeesPath);
    const employeeId = parseInt(request.params.id);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
        return reply.code(404).send({ error: 'Employee not found' });
    }
    return employee;
});

// 4. PUT: Employee ki details update karne ke liye
fastify.put('/employees/:id', async (request, reply) => {
    const employees = readData(employeesPath);
    const employeeId = parseInt(request.params.id);
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index === -1) {
        return reply.code(404).send({ error: 'Employee not found' });
    }
    
    employees[index] = { ...employees[index], ...request.body };
    writeData(employeesPath, employees);
    
    return employees[index];
});

// 5. DELETE: Employee ko delete karne ke liye
fastify.delete('/employees/:id', async (request, reply) => {
    const employees = readData(employeesPath);
    const employeeId = parseInt(request.params.id);
    const filteredEmployees = employees.filter(e => e.id !== employeeId);
    
    if (employees.length === filteredEmployees.length) {
        return reply.code(404).send({ error: 'Employee not found' });
    }
    
    writeData(employeesPath, filteredEmployees);
    return { message: 'Employee deleted successfully' };
});

// ==========================================
// LEAVE REQUESTS CRUD ROUTES
// ==========================================

// 1. POST: Leave apply karne ke liye
fastify.post('/leaves', async (request, reply) => {
    const leaves = readData(leavesPath);
    const newLeave = request.body;
    
    // Auto-increment ID logic aur default status 'Pending' set karna
    newLeave.id = leaves.length > 0 ? leaves[leaves.length - 1].id + 1 : 1;
    newLeave.status = newLeave.status || 'Pending';
    
    leaves.push(newLeave);
    writeData(leavesPath, leaves);
    
    return reply.code(201).send(newLeave);
});

// 2. GET: Saari Leave requests dekhne ke liye
fastify.get('/leaves', async (request, reply) => {
    const leaves = readData(leavesPath);
    return leaves;
});

// 3. PUT: Leave request ka status update karne ke liye (Approve/Reject)
fastify.put('/leaves/:id', async (request, reply) => {
    const leaves = readData(leavesPath);
    const leaveId = parseInt(request.params.id);
    const index = leaves.findIndex(l => l.id === leaveId);
    
    if (index === -1) {
        return reply.code(404).send({ error: 'Leave request not found' });
    }
    
    leaves[index] = { ...leaves[index], ...request.body };
    writeData(leavesPath, leaves);
    
    return leaves[index];
});

// 4. DELETE: Leave request ko delete karne ke liye
fastify.delete('/leaves/:id', async (request, reply) => {
    const leaves = readData(leavesPath);
    const leaveId = parseInt(request.params.id);
    const filteredLeaves = leaves.filter(l => l.id !== leaveId);
    
    if (leaves.length === filteredLeaves.length) {
        return reply.code(404).send({ error: 'Leave request not found' });
    }
    
    writeData(leavesPath, filteredLeaves);
    return { message: 'Leave request deleted successfully' };
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log("Server is running on http://localhost:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();