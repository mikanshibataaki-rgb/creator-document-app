import { promises as fs } from "fs";
import path from "path";

import { PostInput, PostCategory, SnsName } from "./types";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

const CATEGORY_RULES: Array<{
  category: PostCategory;
  keywords: string[];
  title: string;
  memo: string;
}> = [
  {
    category: "部屋紹介",
    keywords: ["部屋紹介", "内観", "室内", "部屋"],
    title: "スタジオ空間のご紹介",
    memo: "岐阜スタジオの撮影空間を紹介する投稿。写真の雰囲気、部屋の使いやすさ、撮影イメージが伝わる内容にする。"
  },
  {
    category: "アンティークルーム紹介",
    keywords: ["アンティーク", "antique"],
    title: "アンティークルームのご紹介",
    memo: "アンティーク調の空間や小物、落ち着いた世界観が伝わる投稿にする。"
  },
  {
    category: "白部屋紹介",
    keywords: ["白部屋", "白", "white"],
    title: "白部屋の自然光紹介",
    memo: "白部屋の明るさ、自然光、清潔感、ポートレートや作品撮りとの相性を伝える。"
  },
  {
    category: "和室紹介",
    keywords: ["和室", "和", "japanese"],
    title: "和室スペースのご紹介",
    memo: "和室の落ち着き、衣装や作品撮影との相性、世界観づくりを伝える。"
  },
  {
    category: "黒部屋紹介",
    keywords: ["黒部屋", "黒", "black"],
    title: "黒部屋の撮影イメージ",
    memo: "黒部屋の陰影、重厚感、かっこいい撮影や世界観の作りやすさを伝える。"
  },
  {
    category: "メイクルーム紹介",
    keywords: ["メイク", "makeup"],
    title: "メイクルームのご案内",
    memo: "撮影前の準備がしやすいこと、安心して使える設備として紹介する。"
  },
  {
    category: "コスプレ撮影向け",
    keywords: ["コスプレ", "cosplay"],
    title: "コスプレ撮影向けのご紹介",
    memo: "衣装や世界観を活かした撮影ができることを、上品に伝える。"
  },
  {
    category: "ポートレート撮影向け",
    keywords: ["ポートレート", "人物", "portrait"],
    title: "ポートレート撮影向けのご紹介",
    memo: "自然光、表情、空気感、人物撮影との相性を伝える。"
  },
  {
    category: "企業撮影向け",
    keywords: ["企業", "商用", "ビジネス", "business"],
    title: "企業・商用撮影向けのご案内",
    memo: "プロフィール、商品、ブランド撮影など商用利用しやすいことを信頼感のある文体で伝える。"
  },
  {
    category: "映像撮影向け",
    keywords: ["映像", "動画", "movie", "video"],
    title: "映像撮影向けのご案内",
    memo: "映像撮影にも使える空間として、光や背景、動線の使いやすさを伝える。"
  },
  {
    category: "空き日告知",
    keywords: ["空き", "予約", "スケジュール"],
    title: "撮影空き日のご案内",
    memo: "空き日を自然に案内する投稿。押し売りせず、撮影を検討中の方に向けた文体にする。"
  },
  {
    category: "キャンペーン告知",
    keywords: ["キャンペーン", "特典", "割引"],
    title: "キャンペーンのお知らせ",
    memo: "キャンペーン内容を安っぽくせず、利用しやすい機会として案内する。"
  }
];

export type PhotoImportItem = {
  photoPath: string;
  post: PostInput;
};

export async function buildPostsFromPhotoFolder(
  folderPath: string,
  targetSns: SnsName[]
): Promise<PhotoImportItem[]> {
  const photos = await findPhotos(folderPath);
  return photos.map((photoPath) => {
    const rule = detectRule(photoPath);
    const folderName = path.basename(path.dirname(photoPath));
    const fileName = path.basename(photoPath);

    return {
      photoPath,
      post: {
        title: `${rule.title} - ${folderName}`,
        category: rule.category,
        target_sns: targetSns,
        target_audience: "",
        purpose: "写真をもとに、岐阜スタジオの魅力を自然に伝える",
        source_memo: `${rule.memo}\n\n写真フォルダ: ${folderName}\n写真ファイル: ${fileName}`,
        media_note: `使用候補写真: ${photoPath}`,
        status: "ネタ",
        priority: 3
      }
    };
  });
}

async function findPhotos(folderPath: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        results.push(fullPath);
      }
    }
  }

  await walk(folderPath);
  return results.sort((a, b) => a.localeCompare(b, "ja"));
}

function detectRule(photoPath: string) {
  const target = photoPath.toLowerCase();
  return (
    CATEGORY_RULES.find((rule) =>
      rule.keywords.some((keyword) => target.includes(keyword.toLowerCase()))
    ) ?? CATEGORY_RULES[0]
  );
}
