# Shop Management SaaS — Starter

This repository is a starter scaffold for the Shop Management SaaS described by the project specification.

What's included in this initial commit:

- Next.js + TypeScript starter
- Tailwind CSS config
- Prisma schema (PostgreSQL) with Decimal usage for money
- NextAuth (credentials) scaffold
- Zod for validation
- Basic Product API (CRUD) with ownership checks (business isolation)
- Simple mobile-first dashboard page
- .env.example and README with setup steps

Quick start

1. Clone the repo and install:

   npm install

2. Create a `.env` from `.env.example` and set DATABASE_URL and NEXTAUTH_SECRET

3. Generate Prisma client and run migrations:

   npx prisma generate
   npx prisma migrate dev --name init

4. Start the dev server:

   npm run dev

Notes

- This is an initial scaffold. Continue implementing authentication flows (registration/business creation), more API endpoints, tests, and UI components as next steps.

