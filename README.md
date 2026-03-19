# testing-maps

A workspace mapping and visualization tool built with **Next.js**, **Supabase**, and **React Flow**.

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, SSR, Middleware
- [Supabase](https://supabase.com/) — Auth + PostgreSQL database
- [React Flow (@xyflow/react)](https://reactflow.dev/) — Node-based graph visualization
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Radix UI](https://www.radix-ui.com/) — Accessible component primitives
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling

---

## Local Development

### 1. Prerequisites

- [Node.js 20+](https://nodejs.org/)
- A [Supabase](https://supabase.com) project

### 2. Clone & install

```bash
git clone <your-repo-url>
cd testing-maps
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values — find them at **Supabase → Settings → API**:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API Keys → `anon / public` |

### 4. Set up the database schema

Run the SQL file against your Supabase project:

```bash
# Via the Supabase CLI
supabase db push

# Or paste supabase/schema.sql into the Supabase SQL editor
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright) — requires a running dev server
npm run test:e2e

# Playwright UI mode
npm run test:e2e:ui
```

---

## Deploying to Vercel

### One-click via Vercel dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. In the **Environment Variables** step, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — Vercel auto-detects Next.js, no configuration needed

### Via Vercel CLI

```bash
npm i -g vercel
vercel
# Follow the prompts, then set env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

> **Note:** Never commit your `.env` file. It is included in `.gitignore`.

---

## Project Structure

```
src/
├── app/          # Next.js App Router pages & layouts
│   ├── auth/     # Auth pages (sign in / sign up)
│   └── workspace/# Main workspace view
├── components/   # Reusable UI components
├── context/      # React context providers
├── hooks/        # Custom React hooks
└── lib/          # Supabase client, utilities
supabase/
└── schema.sql    # Database schema
e2e/              # Playwright end-to-end tests
```
