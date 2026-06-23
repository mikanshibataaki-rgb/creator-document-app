import { NextResponse } from "next/server";

import {
  AI_UNAVAILABLE_MESSAGE,
  buildTodayPostPrompt,
  fallbackTodayPost,
  parseSnsTexts,
  TodayPostRequest
} from "@/lib/assistant";
import { requestOpenAiText } from "@/lib/openai";

export async function POST(request: Request) {
  const body = (await request.json()) as TodayPostRequest;

  try {
    const text = await requestOpenAiText({ prompt: buildTodayPostPrompt(body) });
    return NextResponse.json({
      texts: parseSnsTexts(text),
      usedFallback: false
    });
  } catch {
    return NextResponse.json({
      texts: fallbackTodayPost(body),
      usedFallback: true,
      errorMessage: AI_UNAVAILABLE_MESSAGE
    });
  }
}
