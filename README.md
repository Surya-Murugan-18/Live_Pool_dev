# LivePoll

A real-time polling platform. Create a poll, share the link, and watch votes arrive live — no page refresh needed.

[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## Features

| Feature | Detail |
|---|---|
| **Live results** | Votes push instantly to every open browser via WebSocket — no polling, no refresh |
| **Create polls** | Multi-option polls with optional one-vote-per-device enforcement |
| **Shareable links** | Every poll gets a public `/poll/:id` voting URL you can share anywhere |
| **Real QR codes** | Scannable QR code generated client-side for every poll with one-click PNG download |
| **Profile photo** | Upload, preview, and remove a profile picture — resized client-side to 256 × 256 px JPEG before upload |
| **Full authentication** | JWT-based signup / login with remember-me toggle (localStorage vs sessionStorage) |
| **Poll management** | Close polls, delete polls (cascades to all votes), view live and final results |
| **Settings** | Change password, notification preferences, sign out of all sessions, delete account |
| **Protected routes** | Unauthenticated users redirected to `/login` and returned to their original destination after sign-in |
| **WebSocket reconnect** | Client reconnects automatically with exponential back-off (1 s → 2 s → 4 s → 30 s cap) |
| **Loading skeletons** | Every async data fetch shows skeleton placeholders — no layout shift |

---

## Tech Stack

### Backend — `backend/`

| Package | Version | Purpose |
|---|---|---|
| [Go](https://go.dev) | 1.23 | Language / runtime |
| [Gin](https://github.com/gin-gonic/gin) | 1.12.0 | HTTP router & middleware |
| [MongoDB Go Driver](https://github.com/mongodb/mongo-go-driver) | 1.17.1 | Database client |
| [go-redis](https://github.com/redis/go-redis) | v9.6.1 | Pub/sub fan-out for WebSocket |
| [gorilla/websocket](https://github.com/gorilla/websocket) | 1.5.3 | WebSocket connections |
| [golang-jwt/jwt](https://github.com/golang-jwt/jwt) | v5.2.1 | JWT signing & validation |
| [x/crypto bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt) | x/crypto | Password hashing |
| [godotenv](https://github.com/joho/godotenv) | 1.5.1 | `.env` file loading |
| [gin-contrib/cors](https://github.com/gin-contrib/cors) | 1.7.8 | CORS middleware |

### Frontend — `frontend/`

| Package | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18.3 | UI framework |
| [Vite](https://vitejs.dev) | 5.2 | Build tool & HMR dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first styling |
| [React Router DOM](https://reactrouter.com) | 6.26 | Client-side routing |
| [Framer Motion](https://www.framer.com/motion) | 11.5 | Page & component animations |
| [Lucide React](https://lucide.dev) | 0.522 | Icon library |
| [Sonner](https://sonner.emilkowal.ski) | 2.0 | Toast notifications |
| [qrcode](https://github.com/soldair/node-qrcode) | 1.5.4 | Real QR code generation on canvas |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | latest | Conditional Tailwind class merging |

---

## Project Structure

```
backend-livepool/
│
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go           # Entry point — MongoDB, Redis, Gin, auto-indexes
│   ├── config/
│   │   └── config.go             # Loads env vars into a typed Config struct
│   ├── handlers/
│   │   └── handlers.go           # All HTTP + WebSocket handlers
│   ├── middleware/
│   │   └── auth.go               # JWT Bearer auth middleware
│   ├── models/
│   │   └── models.go             # User, Poll, Option, Vote structs
│   ├── realtime/
│   │   └── hub.go                # WebSocket hub — Redis pub/sub fan-out
│   ├── routes/
│   │   └── routes.go             # Route registration (public + private groups)
│   ├── .env                      # Local secrets — never commit this
│   ├── .env.example              # Safe template to copy from
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # AppNav, AuthLayout, PublicNav, Footer, MarketingNav
│   │   │   ├── poll/             # PollCard, ClosePollModal, DeletePollModal,
│   │   │   │                     # LiveResultsPanel, LivePollPreview, VoteOption
│   │   │   ├── ui/               # Button, Input, PasswordInput, Card, Modal,
│   │   │   │                     # Avatar, QRCodeCard, Skeleton, Dropdown,
│   │   │   │                     # StatusBadge, StatsCard, ShareCard, EmptyState …
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx   # Token storage, login, signup, logout, updateUser
│   │   │   ├── PollsContext.jsx  # Polls list, poll cache, all mutations (create / close / delete / vote)
│   │   │   └── AppConfigContext.jsx
│   │   ├── hooks/
│   │   │   ├── useLiveFeed.js    # Real WebSocket connection with exponential reconnect
│   │   │   └── useDelayedReady.js
│   │   ├── lib/
│   │   │   └── api.js            # authApi + pollsApi typed fetch wrappers
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Overview — live spotlight, stats, recent polls
│   │   │   ├── MyPolls.jsx       # Full list with search, filter, close & delete
│   │   │   ├── CreatePoll.jsx    # New poll form
│   │   │   ├── PollCreated.jsx   # Post-create share / QR page
│   │   │   ├── PollManagement.jsx# Live results, actions sidebar, QR modal
│   │   │   ├── LiveResults.jsx   # Full-screen live results view
│   │   │   ├── PublicPoll.jsx    # Public voting page (no auth required)
│   │   │   ├── Profile.jsx       # Edit name, upload/remove photo, activity stats
│   │   │   ├── Settings.jsx      # Password, notifications, security, delete account
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── PollNotFound.jsx
│   │   ├── utils/
│   │   │   └── poll.js           # pollUrl, totalVotes, pluralize, date formatters
│   │   ├── App.jsx               # BrowserRouter + all context providers + routes
│   │   └── index.jsx             # React DOM root
│   ├── .env                      # Local secrets — never commit this
│   ├── .env.example              # Safe template to copy from
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure these are installed **and running** before starting:

| Dependency | Minimum version | Install |
|---|---|---|
| Go | 1.23 | https://go.dev/dl |
| Node.js | 18 | https://nodejs.org |
| npm | 9 | Bundled with Node.js |
| MongoDB | 6 | https://www.mongodb.com/try/download/community |
| Redis | 7 | https://redis.io/download |

> **Windows users** — [Memurai](https://www.memurai.com/) is a Redis-compatible server that installs as a Windows service and requires no WSL.

---

## Local Setup

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/backend-livepool.git
cd backend-livepool
```

### 2 — Configure the backend

```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=livepoll
REDIS_URL=localhost:6379
JWT_SECRET=replace-with-a-long-random-string
PORT=8081
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Always use a strong random `JWT_SECRET` in production — every user token is signed with it.

### 3 — Configure the frontend

```bash
cd ../frontend
cp .env.example .env   # Windows: copy .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8081/api
VITE_APP_URL=http://localhost:5173
```

### 4 — Install frontend dependencies

```bash
# run from the frontend/ directory
npm install
```

---

## Running the Project

Start **MongoDB** and **Redis** (or Memurai) first, then open two terminals:

```bash
# Terminal 1 — Go API server
cd backend
go run ./cmd/server
# Listening on http://localhost:8081
```

```bash
# Terminal 2 — Vite dev server
cd frontend
npm run dev
# Listening on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

Verify the API is healthy:

```bash
curl http://localhost:8081/health
# {"status":"ok"}
```

---

## Pages & Routes

| Path | Auth | Description |
|---|---|---|
| `/` | Public | Marketing landing page |
| `/signup` | Public | Create an account |
| `/login` | Public | Sign in |
| `/poll/:id` | Public | Voting page — no account required |
| `/poll-not-found` | Public | Shown when a poll ID doesn't exist |
| `/dashboard` | 🔒 | Overview: live spotlight poll, stats, recent activity |
| `/polls` | 🔒 | Full list of your polls with search, filter, close & delete |
| `/create` | 🔒 | Create a new poll |
| `/polls/:id` | 🔒 | Poll management: live results, share tools, QR code, close & delete |
| `/polls/:id/results` | 🔒 | Full-screen live results with vote counter animation |
| `/polls/:id/created` | 🔒 | Post-create confirmation with share link and QR code |
| `/profile` | 🔒 | Edit display name, upload / remove profile photo, view activity stats |
| `/settings` | 🔒 | Change password, notification prefs, session management, delete account |

---

## API Reference

All endpoints are prefixed with `/api`.  
Endpoints marked **🔒** require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Request body | Response |
|---|---|---|---|---|
| `POST` | `/auth/signup` | — | `{ name, email, password }` | `{ token, user }` |
| `POST` | `/auth/login` | — | `{ email, password }` | `{ token, user }` |
| `GET` | `/auth/me` | 🔒 | — | `User` |
| `PATCH` | `/auth/profile` | 🔒 | `{ name }` | Updated `User` |
| `PATCH` | `/auth/avatar` | 🔒 | `{ avatarUrl }` base64 data-URI ≤ 200 KB | Updated `User` |
| `PATCH` | `/auth/password` | 🔒 | `{ current, new }` | `{ message }` |
| `DELETE` | `/auth/account` | 🔒 | `{ password }` | `{ message }` |

### Polls

| Method | Endpoint | Auth | Request body | Response |
|---|---|---|---|---|
| `GET` | `/polls` | 🔒 | — | `Poll[]` |
| `POST` | `/polls` | 🔒 | `{ question, options[], allowOneVote }` | Created `Poll` |
| `GET` | `/polls/:id` | — | — | `Poll` |
| `PATCH` | `/polls/:id/close` | 🔒 | — | Updated `Poll` |
| `DELETE` | `/polls/:id` | 🔒 | — | `{ message }` |
| `POST` | `/polls/:id/vote` | — | `{ optionId }` | Updated `Poll` |
| `GET` | `/polls/:id/stream` | — | — | WebSocket upgrade |

### Data shapes

**User**
```json
{
  "id":        "6aacfc9f94e3e0fc94444b4c",
  "name":      "Jane Doe",
  "email":     "jane@example.com",
  "avatarUrl": "data:image/jpeg;base64,…",
  "createdAt": "2026-09-18T10:00:00Z"
}
```

**Poll**
```json
{
  "id":           "6aacfc9f94e3e0fc94444b55",
  "question":     "What is your favourite language?",
  "options": [
    { "id": "abc123", "label": "Go",         "votes": 42 },
    { "id": "def456", "label": "JavaScript", "votes": 31 },
    { "id": "ghi789", "label": "Python",     "votes": 18 }
  ],
  "status":       "active",
  "allowOneVote": true,
  "createdAt":    "2026-09-18T10:00:00Z",
  "updatedAt":    "2026-09-18T11:05:00Z"
}
```

**WebSocket vote event** — broadcast to all `/polls/:id/stream` subscribers on every vote:
```json
{
  "pollId":     "6aacfc9f94e3e0fc94444b55",
  "optionId":   "abc123",
  "votes": [
    { "id": "abc123", "label": "Go",         "votes": 43 },
    { "id": "def456", "label": "JavaScript", "votes": 31 },
    { "id": "ghi789", "label": "Python",     "votes": 18 }
  ],
  "totalVotes": 92
}
```

---

## Architecture

```
Browser
  │
  ├── REST (HTTP/HTTPS) ──────▶  Gin Router
  │                                   │
  │                       ┌───────────┴───────────┐
  │                       │                       │
  │                 REST handlers           WebSocket handler
  │                       │                       │
  │                       ▼                       ▼
  │                    MongoDB              Redis Pub/Sub
  │              (users, polls, votes)    (one channel per poll ID)
  │                                               │
  │                                               ▼
  └── WebSocket ◀───────────────────  Hub fans out to all
      (live results update)           connected browsers
```

**Vote flow, step by step:**

1. A voter's browser sends `POST /api/polls/:id/vote`.
2. The handler validates the option, checks one-vote dedup via MongoDB, and writes a vote document.
3. It increments `options.$.votes` on the poll document with a targeted `$inc` update.
4. It publishes a JSON payload to a Redis channel keyed by `pollId`.
5. The WebSocket hub receives the Redis message and writes it to every open `GET /api/polls/:id/stream` connection.
6. `useLiveFeed` in each browser merges the updated counts into React state — result bars animate instantly with no page reload.

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `MONGO_DATABASE` | ✅ | — | Database name |
| `REDIS_URL` | ✅ | — | Redis address as `host:port` |
| `JWT_SECRET` | ✅ | — | HS256 signing secret — use a long random string |
| `PORT` | — | `8080` | HTTP listen port |
| `FRONTEND_URL` | — | `*` | Allowed WebSocket upgrade origin |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL, e.g. `http://localhost:8081/api` |
| `VITE_APP_URL` | — | Public app origin used when generating poll share links |

---

## Scripts

### Backend

```bash
go run ./cmd/server      # Start dev server (auto-recompiles on change with air/gow)
go build -o livepoll ./cmd/server  # Compile to a single binary
go mod tidy              # Sync go.mod and go.sum
gofmt -w .               # Format all Go files
```

### Frontend

```bash
npm run dev              # Start Vite dev server with hot module replacement
npm run build            # Production build → frontend/dist/
npm run preview          # Serve the production build locally
npm run lint             # Run ESLint across all src files
```

---

## Database Indexes

Created automatically at server startup in `main.go → ensureIndexes()`:

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `users` | `email` | Unique | Prevents duplicate registrations |
| `polls` | `ownerId` | Standard | Fast per-user poll list queries |
| `votes` | `{ pollId, voterKey }` | Compound | One-vote-per-IP deduplication |

---

## Security Notes

- Passwords are hashed with **bcrypt** (cost 10) — never stored in plaintext.
- JWTs expire after **7 days** and are signed with `HS256`.
- `passwordHash` is tagged `json:"-"` in the User model — it never appears in any API response.
- Avatar images are resized client-side to **256 × 256 px JPEG** before upload and rejected server-side if the payload exceeds **200 KB**.
- Vote deduplication is IP-based. Users behind a shared NAT share one vote slot — replace with a signed session-cookie approach for stricter per-person dedup.
- Set `FRONTEND_URL` to your exact production origin in production to prevent unauthorised WebSocket upgrades.
- Account deletion is fully cascading: all owned polls and their votes are deleted before the user document is removed.

---

## Contributing

1. Fork the repo and create a feature branch from `main`.
2. **Backend** — run `gofmt -w .` before committing. Follow the existing handler patterns in `handlers.go`.
3. **Frontend** — match the Tailwind design token system (`brand-*`, `ink-*`, `canvas`, `line`, etc.) and the component patterns in `src/components/`.
4. Open a pull request with a clear title (under 70 chars) and a description that explains the change and how it was tested.

---


