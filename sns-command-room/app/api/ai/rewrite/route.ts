import { NextResponse } from "next/server";

import {
  AI_UNAVAILABLE_MESSAGE,
  buildImprovePostPrompt,
  fallbackImprovement,
  parseImprovement
} from "@/lib/assistant";
import { requestOpenAiText } from "@/lib/openai";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  const sourceText = body.text || "";

  try {
    const text = await requestOpenAiText({ prompt: buildImprovePostPrompt(sourceText) });
    return NextResponse.json({
      ...parseImprovement(text),
      usedFallback: false
    });
  } catch {
    return NextResponse.json({
      ...fallbackImprovement(sourceText),
      usedFallback: true,
      errorMessage: AI_UNAVAILABLE_MESSAGE
    });
  }
}
