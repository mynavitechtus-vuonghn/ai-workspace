import { convertToModelMessages, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { runChatAgent } from "@/lib/ai/agent";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    if (!body.messages?.length) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    const modelMessages = await convertToModelMessages(body.messages);
    const result = await runChatAgent({
      userId: session.user.id,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 },
    );
  }
}
