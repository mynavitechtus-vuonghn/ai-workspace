# AI Dev Workspace — NextJS Full-stack Project

> Personal productivity platform cho developer: manage task, tự động hoá workflow, và AI agent trợ lý riêng.

---

## Mục tiêu dự án

| Mục tiêu | Cách project đáp ứng |
|---|---|
| FE → Full-stack | Tự làm toàn bộ từ UI đến DB, học App Router, Server Actions, SSR, streaming, auth, drag-drop |
| Vận dụng AI | **Vercel AI SDK** (`streamText`, `useChat`, …) + provider (mặc định **Anthropic** qua `@ai-sdk/anthropic`) — chat, tóm tắt email, tạo task |
| SKILL + MCP + Sub-agent | MCP/HTTP lấy dữ liệu (Gmail, Calendar, …) → xử lý bằng AI SDK; BullMQ cho workflow/sub-agent nền |

---

## Vercel AI SDK — vai trò trong kiến trúc

**Vercel AI SDK** (`ai`) là **lớp thống nhất** cho:

| Thành phần | Vai trò |
|------------|---------|
| **Server** | `streamText` / `generateText` / tools — file `lib/ai/agent.ts` |
| **Route Handler** | Trả streaming UI: `app/api/chat/route.ts` → `toUIMessageStreamResponse()` |
| **Provider** | `@ai-sdk/anthropic`, hoặc sau này `@ai-sdk/google`, OpenAI-compatible, Groq, v.v. |
| **Client (khi làm UI chat)** | `useChat` từ `@ai-sdk/react` (cùng ecosystem với `ai`) |

**Model mặc định (code hiện tại):** `anthropic('claude-sonnet-4-20250514')` trong `runChatAgent`.

**Lưu ý:** MCP (Gmail/Calendar) thường là **nguồn dữ liệu** hoặc **server riêng**; app Next.js gọi API của bạn → pipeline vẫn dùng **AI SDK** để sinh văn bản / tool calls, không thay thế nhau.

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────┐
│         Frontend Layer — Next.js 16 (App Router)         │
│  Dashboard UI │ AI Chat (useChat) │ Workflow Builder │ Auth│
└────────────────────────┬────────────────────────────────┘
                         │ API / Server Actions
┌────────────────────────▼────────────────────────────────┐
│     Backend — Route Handlers + Server Actions              │
│  /api/chat (Vercel AI SDK streaming) │ MCP adapters │ Jobs│
└──────────────┬────────────────────────────┬───────────────┘
               │                            │
┌──────────────▼──────────┐  ┌──────────────▼──────────────┐
│       Data Layer         │  │   External (Gmail, Cal, …)   │
│  PostgreSQL (Prisma)     │  │  + MCP / OAuth / webhooks    │
│  Redis (cache / queue)   │  │                              │
└─────────────────────────┘  └──────────────────────────────┘
```

---

## Tech Stack

### Frontend

- **Next.js 16** — App Router, Server Components, streaming routes
- **React 19** — `useOptimistic`, `useFormStatus`
- **Tailwind CSS v4** — utility-first
- **shadcn/ui** — component library
- **React Flow** — workflow builder
- **Zustand** — client state
- **TanStack Query** — server state
- **Framer Motion** *(optional)* — animations

### AI (Vercel AI SDK)

- **`ai`** — core: `streamText`, `generateText`, `ModelMessage`, response helpers
- **`@ai-sdk/anthropic`** — Claude provider (`anthropic('...')`)
- **Có thể mở rộng** — `@ai-sdk/google`, `@openai/ai-sdk-provider`, v.v. (cùng pattern `streamText({ model: ... })`)

### Backend

- **Route Handlers** — REST (`app/api/**/route.ts`)
- **Server Actions** — mutations (`actions/*.ts`)
- **BullMQ** — job queue (workers tách process)
- **tRPC** *(optional)*

### Data

- **PostgreSQL** + **Prisma**
- **Redis** — cache / queue
- **NextAuth.js** — OAuth (Google, GitHub) *(lộ trình)*
- **Vercel Blob** *(optional)* — uploads

### External / MCP

- Gmail, Calendar, GitHub, Slack, Notion, Linear — qua MCP hoặc API trực tiếp; **tóm tắt / agent** luôn đi qua **Vercel AI SDK** trong app.

### Deploy

- **Vercel**, **Neon/Supabase**, **Upstash Redis**

---

## 4 Core Features & Lộ trình build

### Phase 1 — FE Core (Tuần 1–2)

**Mục tiêu học:** React 19, App Router, auth, responsive

- [ ] Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] NextAuth (Google OAuth)
- [ ] Dashboard layout (sidebar, header, breadcrumb)
- [ ] Kanban (dnd-kit hoặc React Flow)
- [ ] Task CRUD
- [ ] Dark mode toggle

### Phase 2 — Backend & Database (Tuần 3–4)

- [ ] PostgreSQL + Prisma
- [ ] Server Actions (Task, User, …)
- [ ] API Routes cho tích hợp
- [ ] Redis + Zod + error handling

**DB schema cơ bản:** (giữ như `prisma/schema.prisma` — User, Task, Workflow, enums Status / Priority)

### Phase 3 — AI Chat & Agent (Tuần 5–6)

**Mục tiêu học:** **Vercel AI SDK** end-to-end (server stream + client chat)

- [ ] UI chat dùng **`useChat`** (default API `/api/chat`)
- [ ] Context-aware (inject tasks user vào `system` hoặc messages)
- [ ] Tool calling — `streamText({ tools: { ... } })` + execute DB (cần khớp API `tool()` của `ai` đúng version)
- [ ] Prompt templates / daily standup

**Luồng hiện có (reference):**

- Server: `lib/ai/agent.ts` — `streamText({ model: anthropic(...), system, messages })`
- API: `app/api/chat/route.ts` — `POST` body `{ userId, messages }` → `toUIMessageStreamResponse()`

**Ví dụ tool calling (mẫu — kiểm tra `ai` package version khi chạy):**

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";

const result = streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: `Bạn là AI assistant. Tasks: ${JSON.stringify(userTasks)}`,
  messages,
  tools: {
    createTask: tool({
      description: "Tạo task mới",
      inputSchema: z.object({
        title: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        dueDate: z.string().optional(),
      }),
      execute: async ({ title, priority, dueDate }) => {
        return db.task.create({
          data: { title, priority, dueDate: dueDate ? new Date(dueDate) : undefined, userId },
        });
      },
    }),
  },
});
```

*(Nếu build báo lỗi `tool`/`inputSchema`, đối chiếu [AI SDK docs](https://sdk.vercel.ai/docs) cho đúng version `ai` đang cài.)*

### Phase 4 — MCP + Workflow (Tuần 7–8)

- [ ] Gmail — đọc / tóm tắt / tạo task (dữ liệu Gmail → pipeline **AI SDK**)
- [ ] Google Calendar
- [ ] Workflow Builder (React Flow)
- [ ] BullMQ sub-agent + cron “Morning briefing”
- [ ] Notifications

---

## SKILL System

Custom skills — prompt template có thể tái sử dụng (xem `lib/ai/skills.ts`):

```typescript
const skills = {
  analyzePR: {
    name: "Phân tích Pull Request",
    description: "Review code quality, suggest improvements",
    prompt: `Bạn là senior developer. Phân tích PR...`,
    tools: ["github_get_pr", "github_get_diff"],
  },
  // ...
};
```

Skills được gọi từ logic agent của bạn (sau khi đã có `streamText` / orchestration).

---

## Folder Structure (đã có / lộ trình)

```
ai-dev-workspace/
├── app/
│   ├── (auth)/login|register
│   ├── (dashboard)/layout.tsx, page.tsx, tasks, ai-chat, workflows
│   └── api/
│       ├── chat/route.ts          # Vercel AI SDK streaming
│       ├── tasks|workflows/
│       └── mcp/gmail|calendar|webhooks
├── components/ui/                 # shadcn
├── lib/
│   ├── db.ts, redis.ts
│   ├── ai/agent.ts, tools.ts, skills.ts, sub-agents.ts
│   └── button-variants.ts
├── actions/task.ts
├── prisma/
├── workers/
└── context.md
```

---

## Những gì bạn học được

### AI (trọng tâm: Vercel AI SDK)

- **`streamText` / `generateText`** — server
- **`useChat`** — client streaming tới Route Handler
- **Providers** — `@ai-sdk/anthropic` và các provider khác cùng API
- **Tool calling** — gắn với Prisma / Server Actions
- MCP — tích hợp làm **data plane**; AI plane = AI SDK

---

## Getting Started

```bash
cd ai-dev-workspace
npm install
cp .env.example .env.local
# Bắt buộc cho AI chat: ANTHROPIC_API_KEY=
# DB: DATABASE_URL= | Redis: REDIS_URL=

npx prisma generate
npx prisma migrate dev --name init   # khi đã có Postgres

npm run dev
# Nếu lỗi resolve tailwindcss: npm run dev:webpack
```

**Packages AI chính (đã có trong project):** `ai`, `@ai-sdk/anthropic`.

---

## Tài nguyên tham khảo

- [Next.js Docs](https://nextjs.org/docs)
- **[Vercel AI SDK](https://sdk.vercel.ai)** — `streamText`, `useChat`, providers
- [AI SDK Providers](https://sdk.vercel.ai/providers) — Anthropic, Google, OpenAI, Groq, …
- [Anthropic API](https://docs.anthropic.com)
- [Prisma](https://www.prisma.io/docs)
- [React Flow](https://reactflow.dev)
- [BullMQ](https://docs.bullmq.io)
- [shadcn/ui](https://ui.shadcn.com)
- [MCP](https://modelcontextprotocol.io)
