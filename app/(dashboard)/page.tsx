import { getServerSession } from "next-auth/next";
import {
  AlertCircle,
  ArrowRight,
  CircleDot,
  MessageSquare,
  Network,
  ListTodo,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const firstName = session.user.name?.split(/\s+/)[0] ?? session.user.email?.split("@")[0] ?? "there";

  const [taskCount, overdueCount, inProgressCount] = await Promise.all([
    db.task.count({ where: { userId } }),
    db.task.count({
      where: {
        userId,
        status: { not: "DONE" },
        dueDate: { lt: new Date() },
      },
    }),
    db.task.count({
      where: { userId, status: "IN_PROGRESS" },
    }),
  ]);

  const shortcuts = [
    {
      href: "/tasks",
      title: "Tasks",
      description: "Kanban board — drag cards to update status.",
      icon: ListTodo,
    },
    {
      href: "/ai-chat",
      title: "AI Chat",
      description: "Gemini via AI SDK with streaming and tools (e.g. create tasks).",
      icon: MessageSquare,
    },
    {
      href: "/workflows",
      title: "Workflows",
      description: "Visual flows — React Flow starter for automation.",
      icon: Network,
    },
    {
      href: "/settings",
      title: "Settings",
      description: "Account and preferences (growing).",
      icon: Settings,
    },
  ] as const;

  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {session.user.email}
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your workspace for tasks, AI-assisted chat, and workflows. Use the sidebar to move between
          sections.
        </p>
      </header>

      <section aria-labelledby="overview-heading" className="space-y-4">
        <h2 id="overview-heading" className="text-lg font-semibold tracking-tight">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card size="sm" className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-muted-foreground">Total tasks</CardTitle>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListTodo className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <CardDescription className="text-3xl font-semibold tabular-nums text-foreground">
                {taskCount}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-muted-foreground">In progress</CardTitle>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CircleDot className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <CardDescription className="text-3xl font-semibold tabular-nums text-foreground">
                {inProgressCount}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-muted-foreground">Overdue</CardTitle>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    overdueCount > 0
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <AlertCircle className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <CardDescription className="text-3xl font-semibold tabular-nums text-foreground">
                {overdueCount}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm" className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground">Quick open</CardTitle>
              <CardDescription>Jump to your board</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/tasks"
                className={cn(buttonVariants({ size: "sm" }), "inline-flex w-full justify-center gap-2")}
              >
                Open tasks
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="shortcuts-heading" className="space-y-4">
        <h2 id="shortcuts-heading" className="text-lg font-semibold tracking-tight">
          Shortcuts
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="block h-full rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-pretty">{description}</CardDescription>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
