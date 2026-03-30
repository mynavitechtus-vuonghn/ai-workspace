# Reference — migrations in containers

## One-off migrate (manual)

```bash
docker compose run --rm app npx prisma migrate deploy
```

Requires `DATABASE_URL` inside container pointing at `postgres` service (see `.env.docker.example`).

## CI / production

- Build image → run `prisma migrate deploy` as a step before or alongside app start, or use init container / job.

## Dev workflow reminder

- Local iteration: **`npm run dev` on host** — rebuild Docker image only when Dockerfile/deps change.
