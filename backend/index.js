const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const configureDB = require('./config/db')
const morgan = require('morgan');
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5050
const authenticateUser = require('./app/middleware/authenticate')
const authorizeUser = require('./app/middleware/authorize')
const usersCltr = require('./app/controller/user-cltr')
const complaintCtrl = require('./app/controller/complaint-cltr')
const groupMessageCtrl = require('./app/controller/group-message-cltr');
app.use(express.json())
app.use(cors())
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('Socket user connected:', socket.id);
    socket.on('joinAdminManagerGroup', () => {
        socket.join('admin-manager-group');
        console.log(`Socket ${socket.id} joined admin-manager-group`);
    });
    socket.on('disconnect', () => {
        console.log('Socket user disconnected:', socket.id);
    });
});

configureDB();

// User links

app.post('/api/users/register', usersCltr.register);
app.post('/api/users/login', usersCltr.login);
app.get('/api/users/account', authenticateUser, usersCltr.account);
app.get('/api/users/all', authenticateUser, authorizeUser(['admin', 'manager']), usersCltr.list);
app.put('/api/users/:id', authenticateUser, authorizeUser(['admin']), usersCltr.update);
app.delete('/api/users/:id', authenticateUser, authorizeUser(['admin']), usersCltr.remove);

// Complaint links
app.post('/api/analyze-complaint', authenticateUser, authorizeUser(['admin', 'manager']), complaintCtrl.analyzeComplaint);
app.post('/api/complaints', authenticateUser, complaintCtrl.create);
app.get('/api/complaints', authenticateUser, authorizeUser(['admin', 'manager']), complaintCtrl.getAll);
app.get('/api/complaints/assigned', authenticateUser, authorizeUser(['technician']), complaintCtrl.getAssigned);
app.get('/api/complaints/my', authenticateUser, complaintCtrl.getByUserId);
app.put('/api/complaints/:id/assign', authenticateUser, authorizeUser(['admin', 'manager']), complaintCtrl.assignTechnician);
app.put('/api/complaints/:id', authenticateUser, authorizeUser(['admin', 'manager', 'technician']), complaintCtrl.updateStatus);
app.delete('/api/complaints/:id', authenticateUser, authorizeUser(['admin']), complaintCtrl.delete);

// Group Messenger links
app.post('/api/group-messages', authenticateUser, authorizeUser(['admin', 'manager']), groupMessageCtrl.create);
app.get('/api/group-messages', authenticateUser, authorizeUser(['admin', 'manager']), groupMessageCtrl.getAll);

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});