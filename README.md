# mantisHigh

A real-time leveraged CFD trading platform built on Solana. Users deposit SOL on-chain, trade BTC, ETH, and SOL price movements with up to 10x leverage, and withdraw their balance back to their Phantom wallet — all with live P&L updates and automated liquidation.



## What It Actually Does

mantisHigh is a **CFD (Contract for Difference) trading platform**. Users never own real crypto — they speculate on price movements using SOL as collateral. When a user "buys BTC", no real BTC changes hands. The platform records a position, tracks the BTC price in real time, and settles profit or loss in SOL when the position closes.

The only on-chain activity is depositing and withdrawing SOL. Everything else — orders, positions, P&L — runs on an internal ledger in MongoDB.

---

## Architecture

```
Binance WebSocket API
        │
        ▼
Node.js Backend  ──────────────────────────────────────┐
        │                                               │
        ├── Stores live price in Redis                  │
        ├── Emits candle data via Socket.io             │
        ├── Runs P&L engine on every price tick         │
        │     ├── Calculates unrealized P&L             │
        │     ├── Checks liquidation                    │
        │     ├── Checks stop loss / take profit        │
        │     └── Executes waiting limit orders         │
        └── Emits P&L updates to private Socket.io rooms│
                                                        │
        ▼                                               │
Next.js Frontend  ◄─────────────────────────────────────┘
        │
        ├── TradingView Lightweight Charts (live candles)
        ├── Zustand (global state — price, PnL, auth)
        └── Solana Wallet Adapter (Phantom)
```

**Key architectural decision:** One Binance WebSocket connection on the backend fans out to all connected clients via Socket.io. The frontend never connects to Binance directly. This prevents rate limiting and ensures all users see consistent, synchronized data. The data is personalized for each user using the socket.io rooms.

**P&L engine design:** Instead of polling on a timer, the liquidation and P&L checks run on every single price update from Binance. This means liquidations can never miss a price wick — every data point is checked.

**Redis as position cache:** All open positions are cached in Redis so the P&L engine never hits MongoDB on every price tick. MongoDB is only written to when positions open, close, or get liquidated.

---

## Features

**Trading**
- Market orders — fill instantly at current price
- Limit orders — execute automatically when price hits target
- Long and short positions
- Up to 10x leverage
- Stop loss and take profit — auto-close at user-defined thresholds
- Automated liquidation — positions force-closed when loss equals margin
- Pre-calculated liquidation price stored on every position

**Real-Time**
- Live candlestick chart (TradingView Lightweight Charts)
- P&L updates on every price tick via Socket.io private rooms
- 24h market stats (high, low, volume, change %)
- Live position monitoring with current price and unrealized P&L

**Wallet & Funds**
- Solana wallet authentication — no email or password
- Cryptographic nonce signing for tamper-proof login
- On-chain SOL deposits with transaction verification
- On-chain SOL withdrawals
- Double-spend protection via transaction signature deduplication

**Platform**
- Trading pairs: BTC/USDT, ETH/USDT, SOL/USDT
- Trade history with full position details
- Order history
- Markets overview page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Zustand |
| Charts | TradingView Lightweight Charts |
| Real-Time | Socket.io |
| Blockchain | Solana Web3.js, Wallet Adapter, SPL Tokens |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (positions, orders, users, trade history) |
| Cache | Redis (live prices, position cache, Pub/Sub) |
| Job Queue | BullMQ (limit order expiry processing) |
| Market Data | Binance WebSocket API (public, no key required) |
| Validation | Zod |

---

## How Authentication Works

mantisHigh uses **cryptographic wallet authentication** — no passwords, no OAuth.

```
1. User connects Phantom wallet
2. Frontend sends wallet public key to backend
3. Backend generates a random nonce, stores it against the wallet address
4. Frontend asks Phantom to sign the nonce
5. Backend verifies the signature using the public key
   (only the holder of the private key could have produced that signature)
6. Nonce deleted — cannot be reused
7. JWT issued and stored client-side
8. Every subsequent API call verified via JWT middleware
```

This prevents replay attacks — each nonce is single-use and expires. The private key never leaves the user's wallet.

---

## How The P&L Engine Works

Every time a price update arrives from Binance:

```
1. Price stored in Redis
2. All open positions for that symbol fetched from Redis cache
3. For each position:
   a. Check liquidation: long → price <= liquidationPrice
                         short → price >= liquidationPrice
   b. Check stop loss trigger
   c. Check take profit trigger
   d. Calculate unrealized P&L in USDT:
      long:  (currentPrice - entryPrice) × quantity
      short: (entryPrice - currentPrice) × quantity
   e. Emit P&L update to user's private Socket.io room
4. Check waiting limit orders for this symbol
   Execute any whose price condition is now met
```

Liquidation price is pre-calculated in USDT when the position opens:

```
long:  liquidationPrice = entryPrice - (margin / quantity)
short: liquidationPrice = entryPrice + (margin / quantity)
```

---

## How On-Chain Deposits Work

```
1. User enters deposit amount in the UI
2. Frontend creates a Solana SystemProgram.transfer transaction
3. Phantom signs and sends it — SOL goes to platform hot wallet
4. Frontend receives the transaction signature
5. Frontend sends signature to POST /api/deposit
6. Backend calls connection.getTransaction(signature)
7. Backend finds platform wallet in accountKeys
8. Calculates received amount: postBalance - preBalance (in lamports)
9. Checks deposits collection — signature must not already exist
10. Credits user's internal balance in MongoDB
11. Saves transaction signature to prevent double-spend
```

The backend independently verifies every deposit with the Solana RPC. The frontend cannot lie about amounts.

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)
- Phantom wallet browser extension
- Solana CLI (for devnet SOL airdrop)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
JWT_SECRET=your_jwt_secret_here
PRIVATE_KEY=your_platform_wallet_private_key_array
PUBLIC_KEY=EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK
connection=your_mongo_db_URL

```

> ⚠️ The PRIVATE_KEY is the platform hot wallet used for withdrawals. Never commit this to version control.

```bash
npx tsx src/index.ts
```

### Frontend

```bash
cd frontend/my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Getting Devnet SOL

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

Or use the [Solana Devnet Faucet](https://faucet.solana.com)

---

## What I Would Improve With More Time

**1. UI Polish and Responsiveness**
The trading terminal is desktop-only. A proper mobile layout with a collapsible order form would make the platform usable on phones, which is how most retail traders actually trade.

**2. Redis Data Structure Migration**
Current position cache uses hashmaps. Migrating to Redis Sorted Sets (ZSET) would allow O(log N) range queries — useful for finding all positions with liquidation prices within a certain range rather than scanning the entire set on every tick.

**3. Ticker Tape**
A horizontal scrolling price ticker across the top of every page showing live prices for all pairs — similar to financial news sites. Small UI detail but makes the platform feel alive.

**4. Insurance Fund**
Real CFD platforms maintain an insurance fund to cover liquidation slippage — cases where price moves so fast the liquidation engine fires slightly past the liquidation price. Currently the platform absorbs this loss silently.

**5. WebSocket Reconnection Handling**
If the Binance WebSocket drops, the backend currently reconnects but there's a brief window where price data is stale. A proper reconnection strategy with client notification would make this production-grade.

---

## Disclaimer

mantisHigh runs on **Solana Devnet** with test SOL only. This is a portfolio project — not a real financial product. Do not use real funds.

---

Built by [Priyanshu Joshi](https://github.com/Tass-1)