# Template — when to rebuild the image

Rebuild (`docker compose build` or `build --no-cache`) when:

- [ ] `Dockerfile` changed
- [ ] `package.json` or `package-lock.json` changed
- [ ] Native deps / OS packages in image changed
- [ ] Need fresh `npm ci` layer

Do **not** need rebuild for:

- [ ] Only `.tsx` / `.ts` / `.css` edits while developing on host with `npm run dev`
- [ ] Only Prisma migrations applied to existing DB (runtime data), unless schema affects build
