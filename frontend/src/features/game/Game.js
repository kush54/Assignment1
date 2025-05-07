import React, { useEffect, useState } from 'react';
import socket from '../../Socket';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Game.css';

export function Game() {
  const [playerId, setPlayerId] = useState('');
  const [player, setPlayer] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  const [roundMessage, setRoundMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [cryType, setCryType] = useState('');
  const [inGame, setInGame] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [multiplier, setMultiplier] = useState(null);
  const [crashPoint, setCrashPoint] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRoundActive, setIsRoundActive] = useState(false);

  useEffect(() => {
    let timerInterval;

    if (player) {
      socket.on('connect', () => {
        console.log('Connected:', socket.id);
      });

      socket.on('round-starts', ({ roundId }) => {
        setRoundMessage(roundId);
        setHasCashedOut(false);
        setInGame(false);
        setMultiplier(1);
        setIsRoundActive(true);
        setCrashPoint(null);
        setTimer(0);
        timerInterval = setInterval(() => setTimer(prev => prev + 0.1), 100);
      });

      socket.on('multiplier-update', ({ multiplier }) => {
        setMultiplier(multiplier);
      });

      socket.on('round-crash', ({ crashedAt }) => {
        setCrashPoint(crashedAt);
        setIsRoundActive(false);

        if (!hasCashedOut && inGame) {
          socket.emit("cash-out", {
            roundId: roundMessage,
            multiplier: crashedAt,
            amount,
            cryType,
            playerId: player.playerId,
            didCashOut: false,
          });

          toast.error(`💥 Round crashed at ${crashedAt}x! You lost!`);
        }

        setInGame(false);
        clearInterval(timerInterval);
      });

      socket.on('player-lost', ({ playerId: lostId, message }) => {
        if (player?.playerId === lostId) {
          toast.error(`😓 You lost the round! ${message}`);
        }
      });

      return () => {
        socket.off('connect');
        socket.off('round-starts');
        socket.off('multiplier-update');
        socket.off('round-crash');
        socket.off('player-lost');
        clearInterval(timerInterval);
      };
    }
  }, [player, hasCashedOut, inGame]);

  const handleCheck = async () => {
    if (playerId.length !== 10) {
      toast.warning("Player ID must be exactly 10 characters.");
      return;
    }

    setIsChecking(true);
    try {
      const res = await axios.get(`http://localhost:5000/players/${playerId}`);
      if (res.data.exists) {
        setPlayer(res.data.player);
        toast.success("✅ Welcome back!");
      } else {
        const confirm = window.confirm("No account found. Do you want to enroll?");
        if (confirm) {
          const enrollRes = await axios.post('http://localhost:5000/players', { playerId });
          setPlayer(enrollRes.data.player);
          toast.success("🎉 Account created successfully!");
        }
      }
    } catch (err) {
      toast.error("❌ Something went wrong.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckWallet = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/players/wallet/${player.playerId}`);
      if (res.data?.amount) {
        setWalletBalance(res.data.amount);
        toast.info(`💼 Wallet: $${res.data.amount}`);
      } else {
        toast.error("❌ Wallet info not found.");
      }
    } catch {
      toast.error("❌ Failed to fetch wallet balance.");
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (amount !== "" && cryType !== "") {
      const data = {
        amount,
        cryType,
        roundId: roundMessage,
        playerId: player.playerId,
      };
      socket.emit("placeBet", { data });
      setInGame(true);
      setHasCashedOut(false);
    } else {
      toast.warning("Please enter amount and select crypto");
    }
  };

  const handleCashOut = async () => {
    if (inGame && !hasCashedOut) {
      socket.emit("cash-out", {
        roundId: roundMessage,
        multiplier,
        amount,
        cryType,
        playerId: player.playerId,
      });

      try {
        const res = await axios.post('http://localhost:5000/players/cashout', {
          playerId: player.playerId,
          amount,
          cryType,
          multiplier,
          didCashOut: true,
        });

        toast.success(`${res.data.message} 💰 New balance: $${res.data.newBalance}`);
      } catch {
        toast.error("❌ Failed to update balance.");
      }

      setHasCashedOut(true);
      setInGame(false);
    }
  };

  if (!player) {
    return (
      <div className="start-page enhanced">
        <div className="login-card">
          <h1 className="title">🎮 Crypto Crash Login</h1>
          <p className="subtitle">Enter your 10-character Player ID to continue</p>
          <input
            type="text"
            maxLength={10}
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="e.g., ABC123XYZ9"
            className="input"
          />
          <button onClick={handleCheck} disabled={isChecking} className="login-button">
            {isChecking ? "Checking..." : "Enter Game"}
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }
  

  return (
    <div className="game-container">
      <ToastContainer />
      <h1>💥 Crypto Crash Game 💥</h1>

      <button className="wallet-button" onClick={handleCheckWallet}>
        💼 Check Wallet
      </button>

      {walletBalance !== null && (
        <p className="wallet-balance">Balance: ${walletBalance}</p>
      )}

      {isRoundActive ? (
        <>
          <h2 className="multiplier-display">🔥 Multiplier: {multiplier}x</h2>
          <p className="timer">⏱️ Timer: {timer.toFixed(1)}s</p>
        </>
      ) : (
        <h2 className="waiting-round">🕒 Round not started</h2>
      )}

      {crashPoint !== null && (
        <p className="crash-info">💥 Last crash at: {crashPoint}x</p>
      )}

      {inGame ? (
        <div>
          <p className="in-game-msg">🎮 You're in the game!</p>
          {!hasCashedOut && (
            <button className="cashout-button" onClick={handleCashOut}>
              💸 Cash Out at {multiplier}x
            </button>
          )}
        </div>
      ) : (
        <div className="round-info">
          <h2>🔁 Round ID</h2>
          <p className="rm">{roundMessage || "Waiting..."}</p>
        </div>
      )}

      <form className="bet-form" onSubmit={handleClick}>
        <label>💰 Amount in USD</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label>🪙 Select Crypto</label>
        <select value={cryType} onChange={(e) => setCryType(e.target.value)}>
          <option value="">--Choose Crypto--</option>
          <option value="ETH">ETH</option>
          <option value="BTC">BTC</option>
          <option value="DOGE">DOGE</option>
        </select>

        <button type="submit" disabled={!isRoundActive}>
          🚀 Place Bet
        </button>
      </form>
    </div>
  );
}

export default Game;
