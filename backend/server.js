const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const socket_router = require('./routes');
const { socketConnection } = require('./config/socket');

const app = express();
const server = http.createServer(app);

 
app.use(express.json());
app.use('/api', socket_router);

 
const io = new Server(server, {
  cors: {
    origin: "*",  
  },
});

 
socketConnection(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
