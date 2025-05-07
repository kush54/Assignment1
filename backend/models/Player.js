const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerId:{
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    default: 100
  },
 
});

module.exports = mongoose.model('Player', playerSchema);
