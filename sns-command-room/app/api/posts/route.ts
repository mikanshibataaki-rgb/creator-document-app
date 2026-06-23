import { NextResponse } from "next/server";

import { createPostRecord, listPosts } from "@/lib/localStore";
import { PostInput } from "@/lib/types";

export async function GET() {
  const posts = await listPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = (await request.json()) as PostInput;

  if (!body.title || !body.category || !body.source_memo) {
    return NextResponse.json(
      { error: "タイトル、カテゴリ、元メモは必須です。" },
      { status: 400 }
    );
  }

  const post = await createPostRecord(body);
  return NextResponse.json(post, { status: 201 });
}
