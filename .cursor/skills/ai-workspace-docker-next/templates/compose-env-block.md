# Template — env block for Docker Compose (app service)

Use hostnames from compose network:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ai_dev_workspace?schema=public"
REDIS_URL="redis://redis:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=change-me
ANTHROPIC_API_KEY=
```

Adjust user/password/db to match `postgres` service `environment` in `docker-compose.yml`.
