# Reference — repo map (stack overview skill)

## Route groups

| Group | URLs | Layout |
|-------|------|--------|
| `(dashboard)` | `/`, `/tasks`, `/ai-chat`, `/workflows` | `app/(dashboard)/layout.tsx` |
| `(auth)` | `/login`, `/register` | No shared auth layout yet |

## Directory tree (mental model)

```
app/
  (auth)/           # Auth pages
  (dashboard)/      # Main app shell + feature pages
  api/              # Route handlers (REST, webhooks, MCP placeholders)
  layout.tsx        # Root: fonts, dark class, globals
  page.tsx          # Dashboard home
  globals.css       # Tailwind + shadcn theme
actions/            # Server Actions
components/ui/      # shadcn
lib/
  db.ts             # Prisma singleton
  redis.ts          # ioredis singleton
  button-variants.ts# CVA for Server Components + Link
  ai/               # agent, tools, skills, sub-agents
prisma/
workers/            # BullMQ (run outside Next)
```

## Cross-skill pointers

- UI tokens / shadcn → `ai-workspace-ui-shadcn-rsc`
- DB / API → `ai-workspace-prisma-api`
- AI chat → `ai-workspace-vercel-ai-agent`
- Docker → `ai-workspace-docker-next`
