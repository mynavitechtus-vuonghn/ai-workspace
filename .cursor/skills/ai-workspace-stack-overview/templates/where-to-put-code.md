# Template — where to put new code

Copy the checklist when planning a feature.

## Decision tree

1. **User-triggered mutation + needs session/DB write?**
   - Prefer **Server Action** in `actions/<domain>.ts` (`"use server"`, Zod validate).
2. **External system or mobile client needs HTTP?**
   - Add **`app/api/<name>/route.ts`** (GET/POST/…).
3. **UI only, no new server logic?**
   - **Page** under `app/(dashboard)/` or `app/(auth)/`; shared UI in `components/`.
4. **Background / scheduled / long-running?**
   - **Queue** in `lib/ai/sub-agents.ts` (or dedicated `lib/jobs/*`) + **worker** in `workers/*.ts` (separate process).

## File naming

- One route per folder: `app/api/tasks/route.ts` not `tasks.ts` at api root.
- Actions: `actions/task.ts` groups task-related mutations.
