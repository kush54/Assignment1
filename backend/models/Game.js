const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  playerId: String,
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  cashedOut: Boolean,
  cashOutMultiplier: Number,
  earned: Number,
});

const GameRoundSchema = new mongoose.Schema({
  roundId: String,
  crashPoint: Number,
  bets: [BetSchema],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameRound', GameRoundSchema);
