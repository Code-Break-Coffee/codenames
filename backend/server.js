const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const operative_router = require('./routes/operativesRoutes');
const { socketConnection } = require('./config/socket');
const { mongoose } = require("mongoose");
const cardRoutes = require('./routes/cardRoutes'); 
require('dotenv').config();
const app = express();
const server = http.createServer(app);
 
app.use(express.json());
app.use(cors());

// Health check route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api', operative_router);
app.use("/api", cardRoutes);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));
 
const io = new Server(server, {
  cors: {
    origin: "*",  
  },
});

 
// make io available to express routes/controllers via app locals
app.set('io', io);

socketConnection(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
