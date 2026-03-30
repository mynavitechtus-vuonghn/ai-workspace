# Reference — schema & migrations (Prisma skill)

## Models (current)

- `User` — `email` unique, relations to `Task`, `Workflow`.
- `Task` — `status` (`Status` enum), `priority` (`Priority`), `userId` FK.
- `Workflow` — `nodes`, `edges` as `Json`; `userId` FK.

## Commands

| Command | When |
|---------|------|
| `npx prisma migrate dev --name <msg>` | Local dev, creates migration SQL |
| `npx prisma migrate deploy` | CI / production / container |
| `npx prisma generate` | After pull or schema edit (generates client) |
| `npx prisma studio` | Inspect data (optional) |

## Enums in TS

- After `generate`, Prisma exports enums — if build runs before generate, use Zod `enum([...])` matching Prisma names (see `actions/task.ts` pattern).
