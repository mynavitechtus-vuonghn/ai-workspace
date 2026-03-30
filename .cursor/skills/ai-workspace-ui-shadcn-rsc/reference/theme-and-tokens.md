# Reference — theme & tokens (UI skill)

## Dark mode

- `<html className="... dark">` in `app/layout.tsx` — design tokens come from `.dark` in `app/globals.css`.

## Prefer semantic classes

| Use | Avoid (raw palette) |
|-----|---------------------|
| `bg-background` | `bg-zinc-950` unless overriding |
| `text-foreground` | hardcoded gray hex |
| `text-muted-foreground` | ad-hoc opacity |
| `border-border` | `border-zinc-800` in new code |

## `globals.css`

- Do not delete `@import "tailwindcss"` or shadcn imports without replacing equivalent styles.
- `--font-sans` must resolve (e.g. to Geist variable) — see `@theme inline` block.

## shadcn CLI

- Default init used **base-nova** style; new components must match `components.json` (`style`, `tailwind.css` path).
