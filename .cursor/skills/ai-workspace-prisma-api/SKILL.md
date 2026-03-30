---
name: ai-workspace-prisma-api
description: >-
  Database and API patterns for ai-dev-workspace—Prisma client, schema enums, Server Actions,
  and REST route handlers. Use when changing models, migrations, task CRUD, or API routes
  under app/api.
---

# Data layer — Prisma & API

## Client

- Singleton: `import { db } from "@/lib/db"` — never instantiate `PrismaClient` per request in app code.

## Schema

- Models: `User`, `Task`, `Workflow` — see `prisma/schema.prisma`.
- Enums: `Status`, `Priority` — in Server Actions, prefer **Zod enums** or string literals that match Prisma until `prisma generate` has run in the environment.

## Workflow after schema edits

1. `npx prisma migrate dev --name <desc>` (local DB)
2. `npx prisma generate`
3. Ensure `DATABASE_URL` in `.env.local` points at a running Postgres.

## Server Actions

- Location: `actions/*.ts` with `"use server"` at top.
- Example: `actions/task.ts` — validate input with Zod, call `db.task.*`.

## API routes

- `app/api/tasks/route.ts`, `workflows/route.ts` — thin handlers; prefer auth checks once NextAuth is wired.
- MCP placeholders: `app/api/mcp/gmail`, `calendar` — extend with real integrations later.

## Redis / queues

- `lib/redis.ts` — shared connection for BullMQ.
- `lib/ai/sub-agents.ts` — enqueue pattern; workers in `workers/` run as separate processes (not Next.js).

## Additional resources (chi tiết / detail)

**Reference**

- [reference/schema-and-migrations.md](reference/schema-and-migrations.md)
- [reference/redis-and-queues.md](reference/redis-and-queues.md)

**Templates**

- [templates/server-action-zod.md](templates/server-action-zod.md)
- [templates/api-route-get-list.md](templates/api-route-get-list.md)
