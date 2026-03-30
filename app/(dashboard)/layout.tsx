import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/lib/button-variants";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/ai-chat", label: "AI Chat" },
  { href: "/workflows", label: "Workflows" },
  { href: "/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-b border-border p-6 md:border-b-0 md:border-r">
          <p className="mb-6 text-lg font-semibold">AI Dev Workspace</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "justify-start text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-border pt-6">
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email ?? "Signed in"}</p>
            <div className="mt-3 flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </aside>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
