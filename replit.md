# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Labz5 — InfoFi KOL management platform with KOL dashboard and Project zone.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS
- **Telegram**: @twa-dev/sdk (Telegram Mini App)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── labz-app/           # React + Vite frontend (Telegram Mini App)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + custom hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## DB Schema Tables

- `users` — login/passwordHash, evmWallet, bio, rank
- `kols` — influencer profiles
- `campaigns` — campaign listings with form fields
- `campaign_submissions` — KOL applications to campaigns
- `applications` — user applications (KOL/project role requests)
- `cases` — case studies
- `sections` — navigation sections
- `tags` — campaign tags
- `posts` — feed posts
- `project_requests` — **NEW** project zone campaign requests (userId, projectName, twitterLink, websiteLink, projectInfo, campaignInfo, offer, selectedKolIds, status)

## API Routes

- `GET/POST /api/auth/register`, `/api/auth/login` — auth
- `GET/POST /api/kols` — KOL CRUD
- `GET/POST /api/campaigns` — campaign CRUD
- `GET/POST /api/submissions` — campaign submissions
- `GET/POST /api/applications` — applications
- `GET/POST /api/users` — user profiles
- `GET/POST /api/posts` — feed
- `GET/POST /api/project-requests` — **NEW** project campaign requests
- `PATCH /api/project-requests/:id/status` — **NEW** admin approve/reject

## User Zones

### Public Zone
- Browse KOLs and campaigns by section
- Login/register

### KOL Dashboard (verified KOL users)
- Profile (identity, socials, EVM wallet, bio)
- Feed (InfoFi posts)
- Campaigns (apply to campaigns by category)
- My Applications (track application status)

### Project Zone (verified project users) — **NEW**
- Profile (identity, socials, EVM wallet, bio, MY REQUESTS with status tracking)
- Feed (same InfoFi posts)
- KOLs (browse all KOLs with + add-to-cart buttons)
- Cart (selected KOLs + Submit Campaign form with: project name, Twitter, website, project info, campaign info, compensation type)

## Admin Panel (`/dhbesjxbx`)
- KOLs, Campaigns, Cases, Sections, Tags management
- Applications (inbox) — approve/reject/verify users
- Campaign Submissions management
- **Project Requests** — **NEW** review and approve/reject project campaign requests
- Members management with rank system
- Feed posts

## Design System
- Terminal/hacker aesthetic
- Black background (#0D0D0D)
- Green accent (#00FF00)
- Monospace fonts
- No rounded corners (square borders)
