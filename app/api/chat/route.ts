import { NextResponse } from "next/server";
import type { ModelMessage } from "ai";
import { runChatAgent } from "@/lib/ai/agent";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      messages?: ModelMessage[];
    };

    if (!body.userId || !body.messages) {
      return NextResponse.json({ error: "Missing userId or messages" }, { status: 400 });
    }

    const result = runChatAgent({
      userId: body.userId,
      messages: body.messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 },
    );
  }
}
