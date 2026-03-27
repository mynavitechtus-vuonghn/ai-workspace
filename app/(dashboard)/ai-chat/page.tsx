export default function AIChatPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Chat</h1>
      <p className="text-zinc-400">
        Use `POST /api/chat` with Vercel AI SDK client (`useChat`) to stream responses from Claude.
      </p>
    </section>
  );
}
