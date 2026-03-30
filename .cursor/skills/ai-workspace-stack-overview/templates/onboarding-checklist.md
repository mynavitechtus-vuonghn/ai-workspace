# Template — onboarding checklist (new contributor)

- [ ] `cd ai-dev-workspace && npm install`
- [ ] `cp .env.example .env.local` — fill `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY` (optional for AI)
- [ ] `npx prisma generate` — after any `schema.prisma` pull
- [ ] `npx prisma migrate dev` — if migrations exist / local DB up
- [ ] `npm run dev` — if Tailwind errors, `npm run dev:webpack`
- [ ] Read `context.md` in parent `trainning` folder if present (product vision)
