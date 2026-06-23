import { NextResponse } from "next/server";

import { getPost, updatePostRecord } from "@/lib/localStore";
import { PostRecord } from "@/lib/types";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const post = await getPost(context.params.id);

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = (await request.json()) as Partial<PostRecord>;
  const post = await updatePostRecord(context.params.id, body);

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json(post);
}
