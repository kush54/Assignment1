 Installation & Setup
1. Clone the repo: git clone https://github.com/kush54/Assignment1

2. Frontend Setup
 cd frontend 
 npm i 
 npm start

3. Backend Setup
cd backend
nodemon index.js
create a database in mongodbCompass and replace its name with crashGame in this connection string  || create a database in mongodbCompass with name crashGame
mongoose.connect('mongodb://localhost:27017/crashGame')


Next Step : 
A page asking for a 10 digit playeriD will appear , make a id to create account , or put Id if you already have to get your pre-existing account.
as you type Id and enter game , if (new account) u will be given  100$  to play. 

Check Wallet:
there is a check Wallet button to check current balanche is USD.

round starts at every 10 or 20 second .

one can place bet when round is active .(put amount and select crypto currenct type)

can cashOut before round crash .

if cashout before crash , then wallet amount will increase with multiplier * betAmount (conversion happening internally in socket.js)
else equivalent deduct in wallet .

multiiple accounts can play in single round simultaneously
 


 Crypto Crash Game 

A real-time multiplayer crash game built using the node,express  and cryptocurrency integration, dynamic socket-based gameplay, wallet management, and conversion logic.

---

 Overview

Crypto Crash is an interactive betting game where users place bets in cryptocurrencies (BTC, ETH, DOGE) and try to cash out before the crash point. It features:
 Real-time betting with Socket.IO
 Wallet and balance management
 Live multiplier animation
 Crypto-to-USD conversion
Smooth UI with React Toastify notifications

---

 Tech Stack

Frontend: React.js, CSS, React Toastify
Backend: Node.js, Express.js, MongoDB, Socket.IO
APIs: CoinGecko (for crypto conversion)
Database: MongoDB

---

 Features

 Player authentication(basic) using a 10-character Player ID
 Auto-enrollment if the Player ID doesn’t exist
 Wallet balance management per player
 Place bets in crypto and earn based on multiplier
 Cash out before crash to win
 If crash occurs before cash out → lose
 Live crash/multiplier updates with WebSocket
 Real-time updates stored in MongoDB

---

