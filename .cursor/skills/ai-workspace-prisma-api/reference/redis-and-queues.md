# Reference — Redis & queues (Prisma / API skill)

## Redis (`lib/redis.ts`)

- Single shared `ioredis` instance; `maxRetriesPerRequest: null` for BullMQ compatibility.

## BullMQ

- **Producer:** e.g. `lib/ai/sub-agents.ts` — enqueue jobs.
- **Consumer:** `workers/*.ts` — must run as **separate Node process**, not inside Next.js request lifecycle.

## API routes

- Keep handlers thin: parse → auth (future) → `db` / queue → JSON response.
- Return `NextResponse.json()` with appropriate HTTP status codes.
