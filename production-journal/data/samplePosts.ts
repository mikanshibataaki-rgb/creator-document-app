import type { JournalPost } from "@/domain/types";

type SampleInput = {
  id: number;
  authorId: string;
  authorName: string;
  authorRole: string;
  place: string;
  title: string;
  body: string;
  createdAt: string;
  isPublic?: boolean;
  canUseForArticle?: boolean;
  canUseForSNS?: boolean;
  allowNamePublic?: boolean;
};

const samples: SampleInput[] = [
  {
    id: 1, authorId: "user-a", authorName: "黒瀬 レン", authorRole: "監督",
    place: "東海制作 会議室", title: "最初の企画会議",
    body: "物語の核になる「失われた音を探す旅」について話した。まだ輪郭だけだが、全員が同じ景色を見始めた。",
    createdAt: "2026-05-08T10:20:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 2, authorId: "user-c", authorName: "白河 ユイ", authorRole: "プロデューサー",
    place: "東海制作 会議室", title: "仮題が決まった",
    body: "企画名は『月灯りのカノン』。この名前を軸に、ロゴと資料の世界観も静かな夜の色で揃えていく。",
    createdAt: "2026-05-08T14:40:00+09:00", isPublic: true, canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 3, authorId: "user-d", authorName: "三枝 リカ", authorRole: "美術",
    place: "黒森アトリエ", title: "色と質感の方向",
    body: "古い木、濡れた石、曇ったガラスを基準素材に決定。新品らしさを消し、手に触れた時間が残る美術を目指す。",
    createdAt: "2026-05-15T16:10:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 4, authorId: "user-a", authorName: "黒瀬 レン", authorRole: "監督",
    place: "オンライン", title: "脚本第一稿を書き終えた",
    body: "ラストシーンまで一度通した。説明が多い場面を削り、人物が黙っている時間をもう少し信じることにした。",
    createdAt: "2026-05-21T23:15:00+09:00", canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 5, authorId: "user-c", authorName: "白河 ユイ", authorRole: "プロデューサー",
    place: "架空市", title: "ロケハン候補を3か所に",
    body: "湖畔、旧駅舎、坂の上の商店街を下見。移動時間と電源条件を確認し、撮影順のたたき台を作った。",
    createdAt: "2026-05-29T18:30:00+09:00", isPublic: true, canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 6, authorId: "user-b", authorName: "水野 タクト", authorRole: "撮影監督",
    place: "森見湖畔", title: "湖畔の光を確認",
    body: "朝6時台は水面が青く、7時を過ぎると木々の反射が強くなる。本番は日の出直後から準備を始めたい。",
    createdAt: "2026-06-02T07:25:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 7, authorId: "user-e", authorName: "朝倉 レイ", authorRole: "出演者",
    place: "稽古場", title: "初めて全員で読み合わせ",
    body: "声にすると、台本で読んでいた時より二人の距離が近く感じた。間を急がず、相手の呼吸を待ってみたい。",
    createdAt: "2026-06-06T19:05:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 8, authorId: "user-d", authorName: "三枝 リカ", authorRole: "美術",
    place: "黒森アトリエ", title: "主人公の古い手帳",
    body: "角を丸め、何度も開いた跡を足した。文字は全部見せず、過去が少しだけ覗く小道具にする。",
    createdAt: "2026-06-10T15:35:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 9, authorId: "user-f", authorName: "榊 ハルオ", authorRole: "録音",
    place: "旧森見駅", title: "駅舎の環境音を採集",
    body: "風で窓枠が鳴る音、遠くの踏切、鳥の声を収録。静かな場所ほど小さな音が物語を作っている。",
    createdAt: "2026-06-13T11:50:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 10, authorId: "user-c", authorName: "白河 ユイ", authorRole: "プロデューサー",
    place: "東海制作", title: "撮影前の最終確認",
    body: "香盤、車両、食事、緊急連絡先まで確認。天候だけは読めないので、雨天時の場面順も全員に共有した。",
    createdAt: "2026-06-19T20:30:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 11, authorId: "user-a", authorName: "黒瀬 レン", authorRole: "監督",
    place: "森見湖畔", title: "撮影初日の朝",
    body: "まだ暗いうちに集合。誰も大声を出さず、湖の音を聞きながら準備が進んだ。最初のカットを無事に撮影。",
    createdAt: "2026-06-22T06:55:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 12, authorId: "user-e", authorName: "朝倉 レイ", authorRole: "出演者",
    place: "森見湖畔", title: "水辺のシーン",
    body: "足元の冷たさで自然に呼吸が変わった。台詞より先に身体が反応した感覚を忘れないように残しておく。",
    createdAt: "2026-06-22T12:15:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 13, authorId: "user-b", authorName: "水野 タクト", authorRole: "撮影監督",
    place: "森見湖畔", title: "湖畔に朝靄が残った",
    body: "予定より早く霧が晴れ始めたため、朝一番のカットから撮影順を変更。静かな水面と朝靄を短い時間だけ残せた。",
    createdAt: "2026-06-24T07:45:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 14, authorId: "user-b", authorName: "水野 タクト", authorRole: "撮影監督",
    place: "森見湖畔", title: "逆光のテスト",
    body: "午後の逆光を確認。レンズを一段変えると人物の輪郭が柔らかく残った。明日の同時刻に本番予定。",
    createdAt: "2026-06-24T15:20:00+09:00", canUseForArticle: true,
  },
  {
    id: 15, authorId: "user-f", authorName: "榊 ハルオ", authorRole: "録音",
    place: "森見湖畔", title: "突然の雨を待つ",
    body: "雨粒が葉に当たる音が想像以上に強い。止むまで録音を休み、雨上がりの空気音を別素材として残した。",
    createdAt: "2026-06-24T16:05:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 16, authorId: "user-a", authorName: "黒瀬 レン", authorRole: "監督",
    place: "旧森見駅", title: "撮影5日目を終えて",
    body: "最後の電車音まで待って本日終了。現場判断が多い一日だったが、チーム全員が同じ方向を見て動けた。",
    createdAt: "2026-06-25T20:10:00+09:00", isPublic: true, canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 17, authorId: "user-d", authorName: "三枝 リカ", authorRole: "美術",
    place: "旧森見駅", title: "小道具をすべて回収",
    body: "ホーム、待合室、車内の小道具を確認。主人公の手帳だけは編集確認用に別箱で保管する。",
    createdAt: "2026-06-25T21:25:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 18, authorId: "user-a", authorName: "黒瀬 レン", authorRole: "監督",
    place: "編集室", title: "初めて全素材を通して見る",
    body: "撮影順ではなく物語の時間で並べると、湖畔の沈黙が想像以上に効いていた。説明台詞をさらに削る。",
    createdAt: "2026-07-03T18:45:00+09:00", canUseForArticle: true, allowNamePublic: true,
  },
  {
    id: 19, authorId: "user-f", authorName: "榊 ハルオ", authorRole: "録音",
    place: "MA室", title: "音が物語をつないだ",
    body: "駅舎で採った風音を湖畔の場面へ薄く重ねた。場所は違っても、記憶が続いているように聞こえる。",
    createdAt: "2026-07-12T17:20:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
  {
    id: 20, authorId: "user-c", authorName: "白河 ユイ", authorRole: "プロデューサー",
    place: "森見文化会館", title: "完成試写の日",
    body: "スタッフと協力者を招いて初試写。上映後の静かな数秒から拍手に変わる瞬間まで、この制作の記録として残したい。",
    createdAt: "2026-07-20T19:30:00+09:00", isPublic: true, canUseForArticle: true, canUseForSNS: true, allowNamePublic: true,
  },
];

export const samplePosts: JournalPost[] = samples.map((sample) => ({
  id: `sample-${sample.id}`,
  authorId: sample.authorId,
  authorName: sample.authorName,
  authorRole: sample.authorRole,
  projectName: "月灯りのカノン",
  place: sample.place,
  title: sample.title,
  body: sample.body,
  media: [],
  permissions: {
    isPublic: sample.isPublic ?? false,
    canUseForArticle: sample.canUseForArticle ?? false,
    canUseForSNS: sample.canUseForSNS ?? false,
    allowNamePublic: sample.allowNamePublic ?? false,
  },
  status: "published",
  adminReviewStatus:
    sample.isPublic && sample.canUseForArticle && sample.id % 4 !== 0
      ? "approved"
      : "pending",
  points: 10,
  createdAt: new Date(sample.createdAt).toISOString(),
  updatedAt: new Date(sample.createdAt).toISOString(),
}));
