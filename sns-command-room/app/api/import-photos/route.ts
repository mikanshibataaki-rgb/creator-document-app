import { existsSync } from "fs";
import { NextResponse } from "next/server";

import { createPostRecord } from "@/lib/localStore";
import { buildPostsFromPhotoFolder } from "@/lib/photoImport";
import { SNS_OPTIONS, SnsName } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    folderPath?: string;
    targetSns?: SnsName[];
  };

  if (!body.folderPath) {
    return NextResponse.json({ error: "写真フォルダのパスが必要です。" }, { status: 400 });
  }

  if (!existsSync(body.folderPath)) {
    return NextResponse.json(
      { error: "写真フォルダが見つかりません。パスを確認してください。" },
      { status: 400 }
    );
  }

  const targetSns: SnsName[] = body.targetSns?.length
    ? body.targetSns.filter((sns): sns is SnsName =>
        (SNS_OPTIONS as readonly string[]).includes(sns)
      )
    : [...SNS_OPTIONS];
  const items = await buildPostsFromPhotoFolder(body.folderPath, targetSns);
  const createdPosts = [];

  for (const item of items) {
    createdPosts.push(await createPostRecord(item.post));
  }

  return NextResponse.json({
    count: createdPosts.length,
    posts: createdPosts
  });
}
