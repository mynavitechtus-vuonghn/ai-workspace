# Reference — Dockerfile & compose (Docker skill)

## Dockerfile stages

1. **deps** — `npm ci` from lockfile.
2. **builder** — copy source, `npx prisma generate`, `npm run build`.
3. **runner** — non-root user, copy `.next/standalone`, `.next/static`, `public`, `prisma/`, Prisma client bits from `node_modules`.

## Compose services

| Service | Image / build | Port |
|---------|-----------------|------|
| `app` | build context `.` | `3000:3000` |
| `postgres` | `postgres:16-alpine` | `5432` (optional expose) |
| `redis` | `redis:7-alpine` | `6379` |

## Volumes

- Named volumes for Postgres data and Redis persistence — survive `docker compose down` (not `down -v`).

## Env in compose

- `env_file: .env.docker.example` — override locally with `.env.docker` (gitignored) for secrets.
