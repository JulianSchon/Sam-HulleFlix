# Sam-Hulle-Flix

Dark cinema tracker for classic multi-film franchises. Built with Next.js 14, Prisma, PostgreSQL, NextAuth.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (dark cinema theme)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4 (invite-only, JWT sessions)
- **Data:** TMDB API (server-side only, 24h cache)
- **Deploy:** Vercel + Railway/Supabase

## Setup

1. Clone and install:
   ```bash
   git clone https://github.com/JulianSchon/Sam-HulleFlix
   cd Sam-HulleFlix
   npm install
   ```

2. Copy env file and fill in values:
   ```bash
   cp .env.example .env.local
   ```

3. Run database migration:
   ```bash
   npx prisma migrate dev
   ```

4. Seed initial data (requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.local`):
   ```bash
   npx prisma db seed
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL (e.g. `https://your-app.vercel.app`) |
| `TMDB_API_KEY` | API key from [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `SEED_ADMIN_EMAIL` | Email for the first admin account |
| `SEED_ADMIN_PASSWORD` | Password for the first admin account |

## First Run

After deploying:
1. Run `npx prisma migrate deploy` on your production database
2. Run `npx prisma db seed` to create the 10 seed franchises and the admin user
3. Log in with your admin credentials at `/login`
4. Go to `/admin/franchises` — franchises are created with no movies yet
5. For each franchise, click Edit and the films will need to be imported. To populate a franchise with its films:
   - Go to `/admin/franchises/new`, search TMDB, import the collection
   - Or delete the empty seeded franchise and re-add it via the TMDB import flow

> **Note:** The seed script creates franchise records but no movies (TMDB IDs for movies come from the collection import in the admin panel). Use the admin panel to add/import films.

## Pages

| Route | Description |
|---|---|
| `/` | Home — featured hero + franchise grid |
| `/franchise/[slug]` | Franchise detail — films, watch order, trivia, streaming |
| `/movie/[id]` | Movie detail — trailer, cast, ratings, reviews |
| `/profile` | Personal hub — watchlist, seen films, stats |
| `/login` | Sign in |
| `/register` | Create account (invite code required) |
| `/admin` | Admin dashboard |
| `/admin/franchises` | Manage franchises |
| `/admin/franchises/new` | Add franchise via TMDB import |
| `/admin/franchises/[id]/edit` | Edit franchise, reorder films, manage trivia |
| `/admin/users` | Manage users, generate invite links |
