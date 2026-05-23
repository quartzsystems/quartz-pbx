<p align="center">
  <img src="apps/web/public/logo.svg" alt="Quartz PBX" width="480" />
</p>

An open-source Asterisk management panel built with Node.js and Next.js. Configure extensions, trunks, and call routing through a clean web UI — no config file editing required.

---

## Features

- **Extensions** — Create and manage PJSIP endpoints for phones and softphones, with optional voicemail
- **Trunks** — Configure SIP, PJSIP, and IAX2 upstream provider connections
- **Inbound Routes** — Route incoming calls by DID or caller ID to any extension
- **Outbound Routes** — Match dial patterns, set caller ID overrides, and define ordered trunk failover chains
- **Live Calls** — Monitor active calls via Asterisk ARI with one-click hangup
- **Config generation** — Automatically writes Asterisk `.conf` files and reloads the relevant modules on every change

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js 18+, TypeScript, Fastify 4 |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS 3 |
| Database | PostgreSQL via Prisma 5 |
| Asterisk integration | ARI (REST + WebSocket) |
| Monorepo | npm workspaces + Turborepo 2 |
| Forms | React Hook Form + TanStack Query v5 |

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 10
- **PostgreSQL** database
- **Asterisk** 18+ with ARI enabled (`ari.conf`)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/quartzsystems/quartz-pbx.git
cd quartz-pbx
npm install
```

### 2. Configure environment variables

**API** — create `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/quartz_pbx"

# Asterisk ARI connection
ASTERISK_HOST=localhost
ASTERISK_ARI_PORT=8088
ASTERISK_ARI_USER=asterisk
ASTERISK_ARI_PASSWORD=asterisk
ASTERISK_ARI_APP=quartz-pbx

# Optional
PORT=4000
HOST=0.0.0.0
```

**Web** — create `apps/web/.env.local`:

```env
API_URL=http://localhost:4000
```

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. Start the development servers

```bash
npm run dev
```

This starts both the API (port `4000`) and the web UI (port `3000`) concurrently via Turborepo.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
quartz-pbx/
├── apps/
│   ├── api/                    # Fastify REST API
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/
│   │       ├── ari/            # Asterisk ARI WebSocket client
│   │       ├── routes/         # REST route handlers
│   │       ├── config-gen.ts   # Asterisk .conf file generation
│   │       ├── asterisk.ts     # reloadAll() — write configs & reload modules
│   │       ├── db.ts           # Prisma client singleton
│   │       └── server.ts       # Fastify app setup
│   └── web/                    # Next.js 14 frontend
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/     # UI components
│           └── lib/            # API client, types, utilities
└── package.json                # Workspace root
```

---

## API Reference

All routes are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats` | Dashboard counts |
| GET/POST | `/api/extensions` | List / create extensions |
| GET/PUT/DELETE | `/api/extensions/:id` | Get / update / delete extension |
| GET/POST | `/api/trunks` | List / create trunks |
| GET/PUT/DELETE | `/api/trunks/:id` | Get / update / delete trunk |
| GET/POST | `/api/inbound-routes` | List / create inbound routes |
| GET/PUT/DELETE | `/api/inbound-routes/:id` | Get / update / delete inbound route |
| GET/POST | `/api/outbound-routes` | List / create outbound routes |
| GET/PUT/DELETE | `/api/outbound-routes/:id` | Get / update / delete outbound route |
| GET | `/api/calls` | List active calls |
| DELETE | `/api/calls/:id` | Hang up a call |

---

## Asterisk Configuration

Quartz PBX writes four include files into your Asterisk config directory. Add these includes to your main Asterisk configuration:

**`pjsip.conf`**
```ini
#include pjsip_quartz.conf
```

**`sip.conf`**
```ini
#include sip_quartz.conf
```

**`iax.conf`**
```ini
#include iax_quartz.conf
```

**`extensions.conf`**
```ini
#include extensions_quartz.conf
```

Every time you save a change in the UI, Quartz rewrites the relevant `.conf` file and issues an Asterisk `module reload` automatically.

### ARI setup

Enable ARI in `ari.conf`:

```ini
[general]
enabled = yes
pretty = yes

[asterisk]
type = user
read_only = no
password = asterisk
```

---

## Available Scripts

Run from the workspace root:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run lint` | Type-check all packages |

---

## License

MIT
