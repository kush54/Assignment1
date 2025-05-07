const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); 

async function convertUSDToCrypto(usdAmount, cryptoType) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoType}&vs_currencies=usd`);
    const rate = response.data[cryptoType]?.usd;

    if (!rate) {
      throw new Error(`No exchange rate found for ${cryptoType}`);
    }

    const cryptoAmount = usdAmount / rate;
    return cryptoAmount;
  } catch (error) {
    console.error("❌ Error converting USD to crypto:", error.message);
    throw error;
  }
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("placeBet", async (data) => {
      const { amount, cryType, roundId, playerId } = data.data;
      console.log("🎯 Bet received:", data);

      const usdAmount = parseFloat(amount);
      let cryptoAmount = usdAmount;

      if (cryType && cryType !== 'USD') {
        try {
          cryptoAmount = await convertUSDToCrypto(usdAmount, cryType.toLowerCase());
        } catch (error) {
          io.to(roundId).emit('error', {
            playerId,
            message: "Error converting USD to crypto. Please try again.",
          });
          return;
        }
      }

      if (!currentBets[roundId]) currentBets[roundId] = [];
      currentBets[roundId].push({
        playerId,
        usdAmount,
        cryptoAmount,
        currency: cryType,
        cashedOut: false,
        cashOutMultiplier: null,
        earned: 0,
      });

      socket.join(roundId);
      io.to(roundId).emit("bet_placed", {
        message: "🎉 सभी श्रद्धालुओं का हार्दिक स्वागत है 🎉"
      });
    });

    socket.on('cash-out', async (data) => {
      const { roundId, multiplier, amount, cryType, playerId, didCashOut } = data;
      console.log(data, "aya");

      try {
        const response = await axios.post('http://localhost:5000/players/cashout', {
          playerId,
          amount,
          cryType,
          multiplier,
          didCashOut,
        });

        const { newBalance, earned, message } = response.data;

        if (!didCashOut) {
          console.log(`❌ Player ${playerId} lost the bet at ${multiplier}x`);
          io.to(roundId).emit('player-lost', {
            playerId,
            message: message || `❌ Player ${playerId} lost at ${multiplier}x.`,
            newBalance,
          });
          return;
        }

        io.to(roundId).emit('player-cashed-out', {
          playerId,
          message: message || `💸 Player ${playerId} cashed out at ${multiplier}x!`,
          earned,
          newBalance,
        });

        console.log(`💸 Player ${playerId} cashed out at ${multiplier}x. Earnings: ${earned} ${cryType}`);
      } catch (error) {
        console.error("❌ Error in cashout API call:", error.message);
        io.to(roundId).emit('error', {
          playerId,
          message: "Error processing cash-out. Please try again.",
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  setInterval(() => {
    const roundId = uuidv4();
    io.emit('round-starts', { roundId });
    console.log("🔁 New round started:", roundId);

    let multiplier = 1.00;
    const maxCrashMultiplier = (Math.random() * 3 + 2).toFixed(2); // 2x - 5x
    console.log(`🧨 Crash point for round ${roundId}: ${maxCrashMultiplier}x`);

    const interval = setInterval(() => {
      multiplier = parseFloat((multiplier + 0.01 * Math.pow(multiplier, 1.05)).toFixed(2));

      io.emit('multiplier-update', { multiplier });

      if (multiplier >= maxCrashMultiplier) {
        io.emit('round-crash', { crashedAt: multiplier }); // ✅ Emit to all
        console.log(`💥 Round ${roundId} crashed at ${multiplier}x`);
        clearInterval(interval);
      }
    }, 100); 
  }, 20000); 
};
