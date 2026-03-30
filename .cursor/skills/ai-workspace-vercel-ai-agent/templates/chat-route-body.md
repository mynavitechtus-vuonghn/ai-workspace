# Template — Chat API request/response shape

Client sends **POST** `/api/chat` with JSON:

```json
{
  "userId": "<cuid>",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

- `messages` must match `ModelMessage[]` from the `ai` package for the installed version.
- Replace `userId` with session user id once NextAuth is wired; do not trust client-supplied id in production without verification.

Server uses `runChatAgent({ userId, messages })` and returns a streaming UI response (see `app/api/chat/route.ts`).
