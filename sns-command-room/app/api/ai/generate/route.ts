import { NextResponse } from "next/server";

import { getPost, updatePostRecord } from "@/lib/localStore";
import { requestOpenAiText } from "@/lib/openai";
import { buildGeneratePrompt, parseJsonObject } from "@/lib/prompts";
import { AiGenerateResult } from "@/lib/types";

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

    const text = await requestOpenAiText({ prompt: buildGeneratePrompt(post) });
    const result = parseJsonObject<AiGenerateResult>(text);
    const updatedPost = await updatePostRecord(id, {
      ...result,
      status: "AI生成済み"
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI生成に失敗しました。" },
      { status: 500 }
    );
  }
}
