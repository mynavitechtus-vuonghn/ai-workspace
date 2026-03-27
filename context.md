# AI Dev Workspace — NextJS Full-stack Project

> Personal productivity platform cho developer: manage task, tự động hoá workflow, và AI agent trợ lý riêng.

---

## Mục tiêu dự án

| Mục tiêu | Cách project đáp ứng |
|---|---|
| FE → Full-stack | Tự làm toàn bộ từ UI đến DB, học App Router, Server Actions, SSR, streaming, auth, drag-drop |
| Vận dụng AI | Tích hợp Claude làm AI agent thực sự — chat, tóm tắt email, tạo task từ cuộc họp |
| SKILL + MCP + Sub-agent | Kết nối Gmail/Calendar qua MCP, build workflow automation, sub-agent chạy nền |

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────┐
│              Frontend Layer — NextJS 15 (App Router)     │
│  Dashboard UI │ AI Chat Interface │ Workflow Builder │ Auth│
└────────────────────────┬────────────────────────────────┘
                         │ API / Server Actions
┌────────────────────────▼────────────────────────────────┐
│          Backend Layer — NextJS API Routes + Server Actions│
│  AI Agent API │ MCP Integration │ Sub-agent Engine │ Webhooks│
└──────────────┬────────────────────────────┬────────────┘
               │                            │
┌──────────────▼──────────┐  ┌─────────────▼──────────────┐
│       Data Layer         │  │   External Services (MCP)   │
│  PostgreSQL (Prisma ORM) │  │  Gmail · Calendar · GitHub  │
│  Redis Cache             │  │  Slack · Notion · Linear    │
└─────────────────────────┘  └────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **NextJS 15** — App Router, Server Components, Streaming
- **React 19** — useOptimistic, useFormStatus
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component library
- **React Flow** — workflow builder drag-drop
- **Zustand** — client state management
- **TanStack Query** — server state, caching
- **Framer Motion** — animations

### Backend
- **NextJS Route Handlers** — REST API endpoints
- **NextJS Server Actions** — form mutations, DB writes
- **Vercel AI SDK** — streaming AI responses (`streamText`, `useChat`)
- **Anthropic Claude API** — AI agent core
- **BullMQ** — job queue cho sub-agent chạy nền
- **tRPC** *(optional)* — end-to-end type-safe API

### Data
- **PostgreSQL** — primary database
- **Prisma ORM** — type-safe DB client, migrations
- **Redis** — session, cache, job queue
- **NextAuth.js** — authentication (OAuth Google, GitHub)
- **Vercel Blob Storage** — file uploads

### External Services (qua MCP)
- Gmail MCP Server
- Google Calendar MCP Server
- GitHub API + MCP
- Slack, Notion, Linear *(mở rộng)*

### Deploy
- **Vercel** — hosting, edge functions, cron jobs
- **Supabase** hoặc **Neon** — managed PostgreSQL
- **Upstash** — managed Redis

---

## 4 Core Features & Lộ trình build

### Phase 1 — FE Core (Tuần 1–2)
**Mục tiêu học:** React 19, App Router, routing, layout, auth, responsive design

- [ ] Setup NextJS 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Authentication với NextAuth.js (Google OAuth)
- [ ] Dashboard layout (sidebar, header, breadcrumb)
- [ ] Kanban board với drag-drop (dnd-kit hoặc React Flow)
- [ ] Task CRUD — create, edit, delete, status update
- [ ] Dark mode toggle

### Phase 2 — Backend & Database (Tuần 3–4)
**Mục tiêu học:** API Routes, Server Actions, DB design, validation

- [ ] PostgreSQL setup + Prisma schema design
- [ ] Server Actions cho Task, Project, User
- [ ] API Routes (REST) cho external integrations
- [ ] Redis session + caching layer
- [ ] Zod validation schemas
- [ ] Error handling & middleware

**DB Schema cơ bản:**
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  tasks     Task[]
  workflows Workflow[]
  createdAt DateTime  @default(now())
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(TODO)
  priority    Priority @default(MEDIUM)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Workflow {
  id       String  @id @default(cuid())
  name     String
  nodes    Json
  edges    Json
  isActive Boolean @default(false)
  userId   String
  user     User    @relation(fields: [userId], references: [id])
}

enum Status   { TODO IN_PROGRESS REVIEW DONE }
enum Priority { LOW MEDIUM HIGH URGENT }
```

### Phase 3 — AI Chat & Agent (Tuần 5–6)
**Mục tiêu học:** Anthropic SDK, Vercel AI SDK, streaming, tool calling

- [ ] AI Chat interface với streaming (Vercel AI SDK `useChat`)
- [ ] Context-aware AI (biết task, project của user)
- [ ] Tool calling: AI có thể tạo task, update status, tìm kiếm
- [ ] AI tóm tắt task hàng ngày
- [ ] Prompt templates (daily standup, review, planning)

**Ví dụ tool calling:**
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: anthropic('claude-sonnet-4-20250514'),
  system: `Bạn là AI assistant của developer.
           Tasks hiện tại: ${JSON.stringify(userTasks)}`,
  messages,
  tools: {
    createTask: tool({
      description: 'Tạo task mới',
      parameters: z.object({
        title: z.string(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        dueDate: z.string().optional(),
      }),
      execute: async ({ title, priority, dueDate }) => {
        return await db.task.create({ data: { title, priority, dueDate, userId } });
      },
    }),
  },
});
```

### Phase 4 — MCP + Workflow Automation (Tuần 7–8)
**Mục tiêu học:** MCP integration, sub-agent, job queue, workflow builder

- [ ] Kết nối Gmail MCP — đọc email, tóm tắt, tạo task từ email
- [ ] Kết nối Google Calendar MCP — xem lịch, block time tự động
- [ ] Workflow Builder UI (drag-drop nodes với React Flow)
- [ ] Sub-agent engine với BullMQ — chạy workflow nền
- [ ] Cron job: "Morning briefing" chạy lúc 8h sáng
- [ ] Notification system (in-app + email)

**Ví dụ workflow automation:**
```
Trigger: Mỗi sáng 8:00
  → Sub-agent 1: Tóm tắt email hôm qua (Gmail MCP)
  → Sub-agent 2: Lấy lịch họp hôm nay (Calendar MCP)
  → Sub-agent 3: Review task quá hạn (DB query)
  ↓ (song song, đợi cả 3 xong)
  → Agent tổng hợp: Tạo "Daily Briefing" card trên dashboard
  → Tạo task TODO list cho ngày hôm nay
  → Gửi summary qua email
```

---

## SKILL System

Tạo custom AI skills — các prompt template có thể tái sử dụng:

```typescript
// Ví dụ skill: Phân tích PR
const skills = {
  analyzePR: {
    name: 'Phân tích Pull Request',
    description: 'Review code quality, suggest improvements',
    prompt: `Bạn là senior developer. Phân tích PR sau và đưa ra:
             1. Potential bugs
             2. Performance issues
             3. Code style suggestions
             4. Security concerns`,
    tools: ['github_get_pr', 'github_get_diff'],
  },
  estimateTask: {
    name: 'Estimate Task',
    description: 'Ước tính thời gian hoàn thành task',
    prompt: `Dựa trên lịch sử task của user, estimate thời gian cho task mới`,
    tools: ['get_task_history', 'create_task'],
  },
  dailyStandup: {
    name: 'Daily Standup',
    description: 'Tóm tắt work hôm qua, plan hôm nay',
    prompt: `Generate standup report: Yesterday / Today / Blockers`,
    tools: ['get_completed_tasks', 'get_today_tasks', 'get_calendar'],
  },
};
```

---

## Folder Structure

```
ai-dev-workspace/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── tasks/page.tsx           # Kanban board
│   │   ├── ai-chat/page.tsx         # AI Chat interface
│   │   ├── workflows/page.tsx       # Workflow builder
│   │   └── settings/page.tsx
│   └── api/
│       ├── chat/route.ts            # AI streaming endpoint
│       ├── tasks/route.ts
│       ├── workflows/route.ts
│       ├── mcp/
│       │   ├── gmail/route.ts
│       │   └── calendar/route.ts
│       └── webhooks/route.ts
├── components/
│   ├── ui/                          # shadcn components
│   ├── dashboard/
│   ├── kanban/
│   ├── ai-chat/
│   └── workflow-builder/
├── lib/
│   ├── db.ts                        # Prisma client
│   ├── redis.ts
│   ├── ai/
│   │   ├── agent.ts                 # Claude agent setup
│   │   ├── tools.ts                 # Tool definitions
│   │   ├── skills.ts                # Custom skills
│   │   └── sub-agents.ts            # Sub-agent orchestration
│   └── mcp/
│       ├── gmail.ts
│       └── calendar.ts
├── actions/                         # Server Actions
│   ├── task.ts
│   ├── workflow.ts
│   └── user.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── workers/                         # BullMQ workers
    ├── workflow-worker.ts
    └── notification-worker.ts
```

---

## Những gì bạn sẽ học được

### Frontend Skills
- App Router, Layouts, Loading/Error boundaries
- Server Components vs Client Components
- Streaming UI với Suspense
- Drag-and-drop với dnd-kit / React Flow
- Optimistic updates với `useOptimistic`
- Form handling với Server Actions
- Authentication flows (OAuth, sessions)

### Backend Skills
- API Route design (REST)
- Server Actions patterns
- Database design, migrations, relations
- Caching strategies (Redis)
- Job queue (BullMQ) cho background tasks
- Webhook handling
- Middleware, rate limiting

### AI/Automation Skills
- Anthropic Claude SDK (messages, streaming, tool use)
- Vercel AI SDK (`streamText`, `generateText`, `useChat`)
- Tool calling & function calling patterns
- MCP (Model Context Protocol) integration
- Sub-agent orchestration (parallel, sequential, conditional)
- Prompt engineering cho production

---

## Getting Started

```bash
# 1. Clone / init project
npx create-next-app@latest ai-dev-workspace --typescript --tailwind --app

# 2. Install core dependencies
npm install @ai-sdk/anthropic ai @prisma/client prisma
npm install next-auth @auth/prisma-adapter
npm install @tanstack/react-query zustand zod
npm install shadcn/ui

# 3. Install workflow + queue
npm install reactflow dnd-kit bullmq ioredis

# 4. Setup Prisma
npx prisma init
npx prisma migrate dev --name init

# 5. Environment variables
cp .env.example .env.local
# ANTHROPIC_API_KEY=
# DATABASE_URL=
# REDIS_URL=
# NEXTAUTH_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

---

## Tài nguyên tham khảo

- [NextJS 15 Docs](https://nextjs.org/docs)
- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Flow Docs](https://reactflow.dev)
- [BullMQ Docs](https://docs.bullmq.io)
- [shadcn/ui](https://ui.shadcn.com)
- [MCP Documentation](https://modelcontextprotocol.io)