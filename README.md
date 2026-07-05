# AAIA — LLM-Powered Automotive Reasoning Engine
### Built by Achtrex | achtrex.com

> The automotive industry's first enterprise-grade LLM automotive reasoning engine.

---

## Architecture Overview

```
aaia/
├── server.js                    # Entry point — Express + Socket.IO
├── .env.example                 # Copy to .env and fill in keys
│
├── config/
│   ├── database.js              # PostgreSQL connection pool
│   ├── redis.js                 # Redis caching layer
│   └── logger.js                # Winston structured logging
│
├── middleware/
│   ├── auth.js                  # JWT authentication + RBAC
│   ├── rateLimiter.js           # Per-endpoint rate limiting
│   └── errorHandler.js          # Global error handling
│
├── routes/
│   ├── auth.js                  # Register, login, logout, profile
│   ├── chat.js                  # AAIA chat (stream + standard)
│   ├── vehicles.js              # VIN decode, pricing, history, recalls
│   ├── fleet.js                 # Fleet management + AI analysis
│   ├── diagnostics.js           # Damage assessment, maintenance, TCO
│   ├── workflows.js             # Intent detection + routing
│   └── analytics.js             # Usage stats and reporting
│
├── services/
│   ├── AAIAService.js         # Core Claude API integration + system prompt
│   ├── VehicleDataService.js    # AutomotiveDataset.com API integration
│   ├── ConversationService.js   # Conversation history management
│   └── SocketService.js         # Real-time WebSocket handlers
│
├── database/
│   └── migrations/
│       └── 001_create_tables.sql  # Complete PostgreSQL schema
│
└── frontend/
    └── src/
        └── services/
            └── api.js           # React API client
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Anthropic API key (Claude)
- AutomotiveDataset.com API key

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/achtrex/aaia.git
cd aaia
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
AUTOMOTIVE_DATASET_API_KEY=your-automotivedata set-api-key
DB_PASSWORD=your-postgres-password
JWT_SECRET=your-random-32-char-secret
```

### 3. Create database

```bash
psql -U postgres -c "CREATE DATABASE aaia;"
psql -U postgres -d aaia -f database/migrations/001_create_tables.sql
```

### 4. Start Redis

```bash
# macOS
brew services start redis

# Ubuntu
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Start AAIA

```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

Server starts on `http://localhost:3001`

Health check: `GET http://localhost:3001/health`

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login — returns JWT |
| POST | `/api/auth/logout` | Logout — blacklists token |
| GET  | `/api/auth/me` | Get current user |

### Chat (AAIA)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Standard chat message |
| POST | `/api/chat/stream` | Streaming SSE response |
| GET  | `/api/chat/conversations` | List conversations |
| GET  | `/api/chat/conversations/:id` | Get conversation + messages |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |

### Vehicles (AutomotiveDataset.com)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles/decode/:vin` | Decode a single VIN |
| GET | `/api/vehicles/:vin/full` | Full vehicle report (specs + history + pricing) |
| GET | `/api/vehicles/:vin/pricing?mileage=50000` | Market pricing |
| GET | `/api/vehicles/:vin/history` | Vehicle history |
| GET | `/api/vehicles/:vin/recalls` | Open recalls |
| GET | `/api/vehicles/:vin/depreciation` | Depreciation forecast |
| POST | `/api/vehicles/batch` | Batch VIN decode (max 50) |
| GET | `/api/vehicles/search` | Search by make/model/year |
| POST | `/api/vehicles/:vin/ask` | Ask AAIA about a vehicle |

### Fleet

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fleet` | Create fleet |
| GET  | `/api/fleet` | List user fleets |
| POST | `/api/fleet/:id/vehicles` | Add vehicles to fleet |
| GET  | `/api/fleet/:id/vehicles` | Get fleet vehicles |
| POST | `/api/fleet/:id/analyse` | Run AAIA fleet analysis |
| PUT  | `/api/fleet/:id/vehicles/:vin` | Update vehicle data |

### Diagnostics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnostics/assess` | Damage assessment (SEV-0 to SEV-5) |
| POST | `/api/diagnostics/maintenance` | Maintenance schedule |
| POST | `/api/diagnostics/tco` | Total Cost of Ownership |

---

## Example Requests

### Send a chat message to AAIA

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the total cost of ownership for a 2022 Toyota Camry over 5 years?",
    "vin": "4T1BF1FK0EU123456"
  }'
```

### Decode a VIN

```bash
curl http://localhost:3001/api/vehicles/decode/4T1BF1FK0EU123456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Run fleet analysis

```bash
curl -X POST http://localhost:3001/api/fleet/FLEET_UUID/analyse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "maintenance"}'
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key from console.anthropic.com |
| `ANTHROPIC_MODEL` | ✅ | Claude model (claude-sonnet-4-20250514) |
| `AUTOMOTIVE_DATASET_API_KEY` | ✅ | AutomotiveDataset.com API key |
| `DB_HOST / DB_NAME / DB_USER / DB_PASSWORD` | ✅ | PostgreSQL credentials |
| `REDIS_HOST / REDIS_PORT` | ✅ | Redis connection |
| `JWT_SECRET` | ✅ | Min 32 chars — use a random string |
| `PORT` | ❌ | Default 3001 |
| `FRONTEND_URL` | ❌ | Default http://localhost:3000 |

---

## Production Deployment

```bash
# Set NODE_ENV
NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "aaia"
pm2 save
pm2 startup
```

---

## Built By

**Achtrex** — Engineering the Intelligence Layer Behind Modern Automotive Platforms

- Website: achtrex.com
- AAIA: aaiaautomotive.com
- Contact: achim@achtrex.com

---

*AAIA — The automotive industry's first enterprise LLM reasoning engine.*
