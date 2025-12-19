# Education Portal (education-portal-starter)

A Next.js starter for an education portal using Next 13, Prisma, NextAuth and Tailwind CSS.

## Tech stack
- Next.js 13
- React 18
- Prisma (Postgres / MySQL / SQLite)
- NextAuth.js for authentication
- Tailwind CSS for styling

## Prerequisites
- Node.js 18+ (recommended)
- npm or pnpm
- A database (Postgres/MySQL/SQLite) and a DATABASE_URL

## Environment
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required env vars (see `.env.example` for keys):
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET

## Install & run (development)
```bash
npm install
# generate prisma client
npx prisma generate
# run migrations (if any) and start dev server
npm run migrate:dev
npm run seed        # optional: seed initial data (if prisma/seed.js exists)
npm run dev
```

The app runs at http://localhost:3000 by default.

## Scripts
- `npm run dev` — Next development server (port 3000)
- `npm run build` — Build production assets
- `npm run start` — Start built Next app
- `npm run prisma` — Proxy to prisma CLI
- `npm run seed` — Run prisma/seed.js
- `npm run migrate:dev` — Run `prisma migrate dev`
- `npm run migrate:deploy` — Run `prisma migrate deploy`
- `npm run prisma:generate` — Run `prisma generate`
- `npm run lint` — Run ESLint (add ESLint deps)
- `npm run format` — Run Prettier (add Prettier deps)

## Prisma
- Schema is in `prisma/schema.prisma`.
- Use `npx prisma migrate dev` to create and apply migrations during development.
- Use `npx prisma migrate deploy` in CI/production.

## Authentication
This project uses NextAuth. Make sure `NEXTAUTH_SECRET` is set and provider credentials (if any) are in your `.env.local`.

## Deployment
- For Vercel: set the environment variables in project settings and run `vercel` or push to a connected repo.
- For other hosts: build with `npm run build` and run `npm run start`.

## Contributing
- Add an issue or open a PR.
- Add tests and CI for new features.

## License
Add a LICENSE file (e.g., MIT) if you want this repo to be open-source.
