import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "誰も教えてくれなかったのに",
    short_name: "だれおし",
    description: "大人のお金と手続きを、必要になる前にやさしく知らせるアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#10152B",
    theme_color: "#10152B",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
