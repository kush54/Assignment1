const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  player_id: {
    type: String,
    required: true,
  },
  usd_amount: {
    type: Number,
    required: true,
  },
  crypto_amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true, // e.g., 'BTC', 'ETH'
  },
  transaction_type: {
    type: String,
    enum: ['bet', 'cashout'],
    required: true,
  },
  transaction_hash: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 9), // Mock hash
  },
  price_at_time: {
    type: Number, 
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
