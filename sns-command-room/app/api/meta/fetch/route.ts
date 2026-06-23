import { NextResponse } from "next/server";

import { buildMetaMemo, fetchMetaPostSummaries, MetaConnectInput } from "@/lib/meta";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MetaConnectInput;
    const posts = await fetchMetaPostSummaries(body);

    return NextResponse.json({
      posts,
      memo: buildMetaMemo(posts)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Metaから投稿データを取得できませんでした。"
      },
      { status: 500 }
    );
  }
}
