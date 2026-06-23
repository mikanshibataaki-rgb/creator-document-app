import { NextResponse } from "next/server";

import { getPost, updatePostRecord } from "@/lib/localStore";
import { requestOpenAiText } from "@/lib/openai";
import { buildImprovePrompt, parseJsonObject } from "@/lib/prompts";
import { AiImproveResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "投稿IDが必要です。" }, { status: 400 });
    }

    const post = await getPost(id);
    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
    }

    const text = await requestOpenAiText({ prompt: buildImprovePrompt(post) });
    const result = parseJsonObject<AiImproveResult>(text);
    const updatedPost = await updatePostRecord(id, {
      ...result,
      status: "分析済み"
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI改善メモ生成に失敗しました。" },
      { status: 500 }
    );
  }
}
