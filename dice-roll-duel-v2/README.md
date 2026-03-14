# Dice Roll Duel 🎲

A real-time 1v1 ranked dice game. Two players queue up, get paired live, and battle in a best-of-3 match. Win rounds by rolling higher than your opponent. ELO goes up or down after every match.

🎮 **Live at [dicerollduel.com](https://dicerollduel.com)**

---

## Features

- Real-time matchmaking queue via Socket.io
- Live BO3 match — both players must confirm each roll
- ELO ranking system (standard chess formula, K=32)
- Leaderboard with clickable player profiles
- ELO history chart on profile pages
- Email verification and password reset via SendGrid
- Google OAuth and email/password authentication
- Protected routes with NextAuth middleware
- Full match history with round-by-round breakdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Realtime | Socket.io |
| Auth | NextAuth v4, bcryptjs |
| Database | PostgreSQL, Prisma v7 |
| Email | SendGrid |
| Hosting | Render |
| Database hosting | Neon |
| DNS | Cloudflare |

---

## Architecture

The app runs as a custom Node.js server (`server.ts`) that hosts both Next.js and Socket.io on the same port. This is necessary because Vercel's serverless platform doesn't support persistent WebSocket connections.

Game state is managed entirely server-side — dice rolls happen on the server and are broadcast to both players simultaneously. Each client identifies its own result by player ID.
```
server.ts                  ← Custom Node server (Next.js + Socket.io)
app/
├── api/
│   ├── auth/              ← Register, verify, forgot/reset password
│   ├── players/           ← Player lookup
│   └── matches/           ← Match history
├── game/
│   ├── page.tsx           ← Server component, auth check
│   └── GameClient.tsx     ← Client component, Socket.io game logic
├── leaderboard/           ← Rankings page
├── profile/               ← Authenticated user profile
├── players/[id]/          ← Public player profiles
└── lib/
    ├── auth.ts            ← NextAuth config
    ├── db.ts              ← Prisma client singleton
    ├── elo.ts             ← ELO calculation
    └── email.ts           ← SendGrid helpers
```

---

## Getting Started

### Prerequisites

- Node.js 20.19+
- Docker (for local Postgres)
- A SendGrid account
- A Google OAuth app

### 1. Clone the repo
```bash
git clone https://github.com/yourhandle/dice-roll-duel.git
cd dice-roll-duel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://dice:dice@localhost:5432/dice_duel"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="you@yourdomain.com"
```

Generate a `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Start the database
```bash
docker compose up -d
```

### 5. Run migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

The app is deployed on [Render](https://render.com) using Docker. The `Dockerfile` in the project root handles the build.

Database is hosted on [Neon](https://neon.tech) (serverless Postgres).

To deploy your own instance:

1. Create a Neon database and run `npx prisma migrate deploy` against it
2. Create a Render web service pointing to your repo, using the Docker runtime
3. Add all environment variables to Render
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Render URL
5. Add your Render URL to Google OAuth authorized redirect URIs

---

## Local Development Notes

- The dev server runs on `http://localhost:3000`
- Socket.io runs on the same port as Next.js via the custom server
- Prisma Studio doesn't work with Prisma v7 — use `psql` or a DB client to inspect data
- Node.js 20.19+ is required for Prisma v7

---

## License

MIT
