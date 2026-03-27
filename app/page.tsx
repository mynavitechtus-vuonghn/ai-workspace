export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">AI Dev Workspace</h1>
      <p className="max-w-2xl text-zinc-400">
        Full-stack productivity platform for developers with Next.js, Prisma, AI agent chat, and
        workflow automation.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-medium">Tasks</h2>
          <p className="mt-2 text-sm text-zinc-400">Kanban and CRUD task management foundation.</p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-medium">AI Chat</h2>
          <p className="mt-2 text-sm text-zinc-400">Streaming Claude endpoint with tool calling.</p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-medium">Workflows</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Queue-based sub-agent orchestration starter.
          </p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-medium">Data Layer</h2>
          <p className="mt-2 text-sm text-zinc-400">Prisma schema prepared for app entities.</p>
        </article>
      </div>
    </section>
  );
}
