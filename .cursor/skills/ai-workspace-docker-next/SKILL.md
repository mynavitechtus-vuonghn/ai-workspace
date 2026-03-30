---
name: ai-workspace-docker-next
description: >-
  Docker and runtime for ai-dev-workspace—Dockerfile standalone output, docker-compose
  services, env files, and Prisma in containers. Use when building images, compose,
  deployment, or CI for this project.
---

# Docker & ops

## Dockerfile

- Multi-stage: `npm ci` → `prisma generate` → `npm run build` → copy **standalone** output from `.next/standalone`, static assets, Prisma engines.
- Runtime user: non-root `nextjs`; expose `3000`.

## Compose

- `docker-compose.yml`: services `app`, `postgres`, `redis`; volumes for DB data.
- App uses `env_file: .env.docker.example` — copy to `.env.docker` locally if you need secrets without committing.

## Rebuild vs dev

- **Daily dev:** run `npm run dev` on the host — **no** image rebuild per file change.
- Rebuild image when: `Dockerfile`, `package.json` / lockfile, or native deps change.

## Database in Docker

- Before app serves DB-backed routes, run migrations once (e.g. `npx prisma migrate deploy` against `DATABASE_URL` inside compose network). Consider a one-off `migrate` service or init container if you automate this.

## Troubleshooting (host dev)

- If Turbopack cannot resolve `tailwindcss`, `next.config.ts` already pins `turbopack.resolveAlias`; fallback: `npm run dev:webpack`.
- Stray `~/package.json` can confuse module resolution — avoid accidental `package.json` in home directory.

## Additional resources (chi tiết / detail)

**Reference**

- [reference/dockerfile-and-compose.md](reference/dockerfile-and-compose.md)
- [reference/migrate-and-prod.md](reference/migrate-and-prod.md)

**Templates**

- [templates/compose-env-block.md](templates/compose-env-block.md)
- [templates/rebuild-when.md](templates/rebuild-when.md)
