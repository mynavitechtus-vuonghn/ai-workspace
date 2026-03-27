# AI Dev Workspace

Starter implementation for your Next.js full-stack productivity platform.

## What is included

- Next.js App Router setup with dashboard/auth route groups
- Prisma schema for `User`, `Task`, `Workflow`
- AI chat API route (`app/api/chat/route.ts`) using Vercel AI SDK + Anthropic
- AI tool-calling starter (`lib/ai/tools.ts`)
- Redis + BullMQ queue starter (`lib/redis.ts`, `lib/ai/sub-agents.ts`)
- Task server actions (`actions/task.ts`)

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Setup environment:

```bash
cp .env.example .env.local
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Run database migration (after PostgreSQL is ready):

```bash
npx prisma migrate dev --name init
```

5. Start development server:

```bash
npm run dev
```

## Next recommended steps

1. Implement NextAuth config + session guards for dashboard pages.
2. Build Kanban board UI in `app/(dashboard)/tasks/page.tsx`.
3. Create chat client component with `useChat` for `app/(dashboard)/ai-chat/page.tsx`.
4. Add BullMQ workers in `workers/` for workflow jobs.

## Docker Compose

1. Build images:

```bash
docker compose build
```

2. Start all services:

```bash
docker compose up -d
```

3. View logs:

```bash
docker compose logs -f app
```

4. Stop services:

```bash
docker compose down
```
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
