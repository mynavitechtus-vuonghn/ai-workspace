# Template — add a shadcn component

```bash
cd ai-dev-workspace
npx shadcn@latest add <component-name> -y
```

Examples: `dialog`, `dropdown-menu`, `sheet`, `separator`, `textarea`.

After add:

1. Import from `@/components/ui/<component>`.
2. Prefer composing in a **Server Component** unless hooks are required.
3. Run `npm run build` to catch client/server boundary issues.
