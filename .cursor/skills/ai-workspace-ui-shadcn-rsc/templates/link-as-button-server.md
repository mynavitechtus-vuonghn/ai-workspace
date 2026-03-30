# Template — Link styled as button (Server Component)

Use in layouts or server pages when you need navigation that looks like `Button` **ghost** / **outline**.

```tsx
import Link from "next/link";

import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "justify-start",
        className,
      )}
    >
      {children}
    </Link>
  );
}
```

Do **not** import `buttonVariants` from `@/components/ui/button` in a Server Component file.
