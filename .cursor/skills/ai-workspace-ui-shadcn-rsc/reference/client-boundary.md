# Reference — client boundary (UI skill)

## Rule

- Anything marked `"use client"` (including `components/ui/button.tsx`) **cannot** export runtime values consumed by Server Components in a way that executes client code during RSC render.

## Safe pattern: `buttonVariants` on server

- **Import from:** `@/lib/button-variants` (pure CVA, no `"use client"`).
- **Use with:** `next/link` + `cn(buttonVariants({ variant, size }), className)`.

## When to add `"use client"` to a page

- `useState`, `useEffect`, browser-only APIs, or client hooks from `ai` / React Query.
- Forms that need controlled inputs with immediate client validation (optional — can stay server + `action=`).

## Base UI Button

- Project `Button` wraps `@base-ui/react/button`. API differs from Radix; check `components/ui/button.tsx` before assuming `asChild`.
