import { NextResponse } from "next/server";

import { requestOpenAiText } from "@/lib/openai";
import { buildAccountAnalysisPrompt, parseJsonObject } from "@/lib/prompts";
import { AccountAnalysisInput, AccountAnalysisResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AccountAnalysisInput;

    if (!body.recent_posts_memo && !body.metrics_memo) {
      return NextResponse.json(
        { error: "最近の投稿メモ、または反応数メモを入力してください。" },
        { status: 400 }
      );
    }

    const text = await requestOpenAiText({
      prompt: buildAccountAnalysisPrompt(body)
    });
    const result = parseJsonObject<AccountAnalysisResult>(text);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アカウント分析に失敗しました。" },
      { status: 500 }
    );
  }
}
