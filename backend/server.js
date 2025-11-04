const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const operative_router = require('./routes/operativesRoutes');
const { socketConnection } = require('./config/socket');

const app = express();
const server = http.createServer(app);

 
app.use(express.json());
app.use(cors());
app.use('/api', operative_router);

 
const io = new Server(server, {
  cors: {
    origin: "*",  
  },
});

 
socketConnection(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
