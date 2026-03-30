---
name: ai-workspace-ui-shadcn-rsc
description: >-
  UI conventions for ai-dev-workspace—shadcn/ui, Tailwind tokens, and safe Server vs Client
  Component usage. Use when building or refactoring pages, layouts, forms, or styling
  in this repository.
---

# UI — shadcn & RSC rules

## Theme

- Root theme: `dark` class on `<html>` in `app/layout.tsx`; use semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`).
- Global styles: `app/globals.css` — `@import "tailwindcss"` plus shadcn theme imports; do not break CSS variable blocks.

## Adding components

```bash
npx shadcn@latest add <component> -y
```

Registry: `components.json` (aliases `@/components`, `@/lib/utils`).

## Server vs Client (critical)

- **`@/components/ui/button`** exports a **client** `Button`. Importing `buttonVariants` from `@/components/ui/button` in a **Server Component** can break builds (client boundary).
- **Pattern for links in Server Components:** import `buttonVariants` from **`@/lib/button-variants`** and apply with `cn()` on `next/link`.
- Use **`"use client"`** only when a page truly needs hooks, browser APIs, or client-only primitives.

## shadcn + Base UI

- This project’s `Button` uses `@base-ui/react/button`. If `asChild` is missing, compose with `Link` + `buttonVariants` instead of forcing Radix-style patterns.

## Files to extend (examples)

- Dashboard shell: `app/(dashboard)/layout.tsx`
- Auth UI: `app/(auth)/login/page.tsx`, `register/page.tsx`
- Home cards: `app/page.tsx`

## Additional resources (chi tiết / detail)

**Reference**

- [reference/theme-and-tokens.md](reference/theme-and-tokens.md)
- [reference/client-boundary.md](reference/client-boundary.md)

**Templates**

- [templates/add-shadcn-component.md](templates/add-shadcn-component.md)
- [templates/link-as-button-server.md](templates/link-as-button-server.md)
