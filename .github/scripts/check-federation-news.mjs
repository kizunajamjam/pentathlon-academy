// 日本近代五種協会のお知らせ一覧を確認し、直近に出た大会関連の記事を管理者に知らせる。
// .github/workflows/federation-news.yml から週1回実行する。
//
// 協会サイトには RSS がないため、お知らせ一覧の HTML から記事を読み取っている。
// サイトの作りが変わって1件も読み取れなくなったときは、それ自体を知らせる。
//
// 通知先:
//   RESEND_API_KEY / NOTIFY_TO / NOTIFY_FROM がそろっていればメールで送る。
//   なければ GitHub の Issue を作る（リポジトリの持ち主に GitHub からメールが届く）。
//   DRY_RUN=1 のときは通知せず、見つかった記事を表示するだけ。

const LIST_URL = "https://pentathlon.jp/news/";
const DAYS = Number(process.env.DAYS || 7);
const DRY_RUN = process.env.DRY_RUN === "1";

// 大会・記録会に関係しそうな記事だけに絞る（役員挨拶や助成金のお知らせは除く）
const GENRES = ["近代五種競技", "近代3種競技", "レーザーラン"];
const TITLE_HINT = /大会|戦|選考会|記録会|CUP|カップ|選手権|体験/i;

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?38;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function parse(html) {
  const items = [];
  const re =
    /<a href="(https:\/\/pentathlon\.jp\/news\/[^"]+)">\s*<li class="archivelist[^"]*">([\s\S]*?)<\/li>\s*<\/a>/g;
  for (const m of html.matchAll(re)) {
    const body = m[2];
    const date = body.match(/class="entrydate[^"]*">\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    const title = strip(body.match(/class="txt">([\s\S]*?)<\/div>/)?.[1] ?? "");
    const genres = [...body.matchAll(/caticon genre[^"]*">([^<]+)</g)].map((g) => g[1].trim());
    if (date && title) items.push({ url: m[1], date, title, genres });
  }
  return items;
}

function sinceDate() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const d = new Date(`${today}T00:00:00+09:00`);
  d.setDate(d.getDate() - DAYS);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

async function sendEmail(subject, text) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM,
      to: process.env.NOTIFY_TO.split(",").map((s) => s.trim()),
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend: ${res.status} ${await res.text()}`);
}

async function createIssue(title, body) {
  const repo = process.env.GITHUB_REPOSITORY;
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error(`GitHub: ${res.status} ${await res.text()}`);
}

async function notify(subject, text) {
  if (DRY_RUN) {
    console.log(`[DRY_RUN] ${subject}\n\n${text}`);
    return;
  }
  const { RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM, GITHUB_TOKEN } = process.env;
  if (RESEND_API_KEY && NOTIFY_TO && NOTIFY_FROM) {
    await sendEmail(subject, text);
    console.log("メールで通知しました。");
  } else if (GITHUB_TOKEN) {
    // 持ち主にメンションして、GitHub の通知メールが確実に届くようにする
    const owner = process.env.GITHUB_REPOSITORY_OWNER;
    await createIssue(subject, `@${owner}\n\n${text}`);
    console.log("GitHub の Issue で通知しました。");
  } else {
    throw new Error("通知先が設定されていません。");
  }
}

const res = await fetch(LIST_URL, { headers: { "User-Agent": "pentathlon-academy-news-check" } });
if (!res.ok) throw new Error(`協会サイトの取得に失敗しました: ${res.status}`);
const items = parse(await res.text());

if (items.length === 0) {
  await notify(
    "【要確認】協会サイトのお知らせを読み取れませんでした",
    `${LIST_URL} からお知らせを1件も読み取れませんでした。サイトの作りが変わった可能性があります。\n.github/scripts/check-federation-news.mjs の読み取り部分の修正が必要です。`,
  );
  process.exit(0);
}

const since = sinceDate();
const hits = items.filter(
  (i) => i.date >= since && (i.genres.some((g) => GENRES.includes(g)) || TITLE_HINT.test(i.title)),
);

console.log(`読み取り ${items.length} 件 / ${since} 以降の大会関連 ${hits.length} 件`);
if (hits.length === 0) process.exit(0);

const lines = hits.map((h) => `・${h.date} ${h.title}\n  ${h.url}`).join("\n\n");
await notify(
  `協会サイトに大会関連のお知らせが${hits.length}件あります`,
  `日本近代五種協会のサイトに、直近${DAYS}日間で次のお知らせが出ています。\n\n${lines}\n\nサイトに載せる大会があれば、管理画面の「大会・イベント」から登録してください。\n（このメッセージは週1回の自動チェックで送っています）`,
);
