const Player = require('../models/Player');
const { getConversionRate } = require('../utils/convertCurrency');
const Transaction = require('../models/Transactions');
const crypto = require('crypto'); 


// api to get player account having correct playerID 
exports.getPlayer = async (req, res) => {
  const { playerId } = req.params;
  try {
    const player = await Player.findOne({ playerId });
    if (player) {
      res.status(200).json({ exists: true, player });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// api to ctreate player 
exports.createPlayer = async (req, res) => {
  const { playerId } = req.body;
  try {
    // check again to avoid duplicates
    const existing = await Player.findOne({ playerId });
    if (existing) {
      return res.status(400).json({ message: 'Player ID already exists' });
    }

    const newPlayer = new Player({ playerId });
    await newPlayer.save();
    res.status(201).json({ player: newPlayer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create player' });
  }
};

// api to fetch user balanche in dollar 
exports.getWalletBalance = async (req, res) => {
    const { playerId } = req.params;
    try {
      const player = await Player.findOne({ playerId });
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ amount: player.amount });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };

// api to handle transaction increment and deduction in player account   
  exports.handleCashout = async (req, res) => {
    console.log("dekha");
    const { playerId, amount, cryType, multiplier, didCashOut } = req.body;
  
    try {
      const player = await Player.findOne({ playerId });
      if (!player) return res.status(404).json({ message: "Player not found" });
  
      const betAmount = parseFloat(amount); 
      let updatedWallet = player.amount;
  
      const mockCryptoPrice = 2000;
      const usd_amount = betAmount;
      const crypto_amount = parseFloat((usd_amount / mockCryptoPrice).toFixed(6));
      const transaction_hash = crypto.randomBytes(16).toString('hex');
  
      if (didCashOut) {
        const earnedCrypto = betAmount * multiplier;
        updatedWallet += earnedCrypto;
  
        const tx = new Transaction({
          player_id: playerId,
          usd_amount: earnedCrypto,
          crypto_amount: parseFloat((earnedCrypto / mockCryptoPrice).toFixed(6)),
          currency: cryType,
          transaction_type: 'cashout',
          transaction_hash,
          price_at_time: mockCryptoPrice,
        });
        await tx.save();
  
        res.json({
          success: true,
          message: `✅ Cashed out at ${multiplier}x!`,
          earned: earnedCrypto.toFixed(2),
          newBalance: updatedWallet.toFixed(2),
        });
      } else {
        updatedWallet -= betAmount;
  
        const tx = new Transaction({
          player_id: playerId,
          usd_amount: betAmount,
          crypto_amount,
          currency: cryType,
          transaction_type: 'bet',
          transaction_hash,
          price_at_time: mockCryptoPrice,
        });
        await tx.save();
  
        console.log("hor");
        res.json({
          success: false,
          message: `💥 You lost! Bet of $${betAmount} deducted.`,
          newBalance: updatedWallet.toFixed(2),
        });
      }
  
      player.amount = updatedWallet;
      await player.save();
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error during cashout." });
    }
  };
  