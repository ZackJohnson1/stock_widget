// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const yf = require('yahoo-finance2').default;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Serve static files (like index.html) from "public" folder
app.use(express.static('public'));

// Default route (not strictly necessary if index.html exists in public/)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// List of tickers to monitor
const tickers = ['AAPL', 'TSLA', 'GOOGL', 'AMZN'];

async function fetchPrices() {
  const prices = {};
  for (const ticker of tickers) {
    try {
      const data = await yf.quote(ticker);
      prices[ticker] = data.regularMarketPrice;
    } catch (err) {
      prices[ticker] = 'N/A';
    }
  }
  return prices;
}

// Emit stock prices every 5 seconds
setInterval(async () => {
  const prices = await fetchPrices();
  io.emit('stock update', prices);
}, 5000);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
