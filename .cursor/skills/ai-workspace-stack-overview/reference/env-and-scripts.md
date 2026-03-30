# Reference — env & scripts

## Scripts (`package.json`)

| Script | Use |
|--------|-----|
| `npm run dev` | Turbopack dev |
| `npm run dev:webpack` | If CSS/resolve issues on host |
| `npm run build` | Production build (needs `prisma generate` if schema changed) |
| `npm run start` | Run after `build` |

## Env files

| File | Scope |
|------|--------|
| `.env.example` | Template committed to repo |
| `.env.local` | Local secrets (gitignored) |
| `.env.docker.example` | Compose-oriented URLs (`postgres`, `redis` hostnames) |

## `next.config.ts` (do not break without testing)

- `output: "standalone"` — required for current Dockerfile.
- `turbopack.root` + `turbopack.resolveAlias` — fixes `tailwindcss` resolution on some machines; removing may break `npm run dev`.
