const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const socketHandler = require('./socket');
const mongoose = require('mongoose');
const playerRoutes = require('./routes/playerRoutes');
const Player = require('./models/Player'); 


const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

socketHandler(io);
app.use('/players', playerRoutes);

mongoose.connect('mongodb://localhost:27017/crashGame')
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.get('players/wallet/:playerId', async (req, res) => {
    const { playerId } = req.params;
    try {
      const player = await Player.findOne({ playerId });
      if (!player) return res.status(404).json({ message: "Player not found" });
      res.json({ wallet: player.wallet }); 
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
  

app.get("/", (req, res) => {
  res.send("jai baba ki");
});

server.listen(5000, () => {
  console.log("🚀 Server started at port 5000");
});
