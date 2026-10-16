/**
 * 只读冒烟测试：逐个打一遍作者后台接口，输出可用性清单。
 * 用法：先把 .env 配好（参考 .env.example），再 `npm run smoke`。
 * 写操作（发布/删除）默认不跑；传 --write 时只测「建草稿→删草稿」安全链路。
 */
import { TomatoClient } from "../src/tomato/client.js";
import { loadAuth } from "../src/tomato/config.js";
import { AuthorService } from "../src/tomato/author.js";
import { NovelService } from "../src/tomato/service.js";

const client = new TomatoClient(loadAuth());
const author = new AuthorService(client);
const novels = new NovelService(client);
const writeMode = process.argv.includes("--write");

// 先拿第一本书的 book_id（书级接口要用）
let firstBookId = "";
try {
  const list = (await novels.listNovels()) as any[];
  firstBookId = String(list[0]?.book_id ?? "");
} catch { /* 无书账号 */ }

type Case = [name: string, fn: () => Promise<unknown>];
const readCases: Case[] = [
  ["check_login（登录态）", () => author.checkLogin()],
  ["get_account_info（账号信息）", () => author.getAccountInfo()],
  ["list_novels（书单）", () => novels.listNovels()],
  ["get_author_stats（作者总览）", () => author.getAuthorStats()],
  ["list_notices（站内通知）", () => author.listNotices(0, 5)],
  ["get_banned_info（违规状态）", () => author.getBannedInfo(firstBookId || undefined)],
  ["get_checkin_tickets（打卡券）", () => author.getCheckinTickets()],
  ["get_hot_words（热词）", () => author.getHotWords(1)],
  ["list_short_articles（短篇）", () => author.listShortArticles()],
  ["get_douyin_hot_list（抖音热点）", () => author.getDouyinHotList()],
  ["get_medal_summary（任务勋章）", () => author.getMedalSummary()],
  ["get_ai_qualification（AI 功能资格）", () => author.getAiQualification(firstBookId || undefined as unknown as string)],
  ["list_drafts（草稿箱）", () => author.listDrafts(firstBookId)],
];

let pass = 0, fail = 0;
for (const [name, fn] of readCases) {
  try {
    const data = await fn();
    const size = JSON.stringify(data)?.length ?? 0;
    console.log(`✅ ${name}  (${size} bytes)`);
    pass++;
  } catch (e) {
    console.log(`❌ ${name}  ${e instanceof Error ? e.message : e}`);
    fail++;
  }
}

// 书级接口需要 book_id
if (firstBookId) {
  for (const [name, fn] of [
    ["get_chapter_stats（章节数据）", () => novels.getChapterStats(firstBookId)],
    ["list_volumes（分卷）", () => novels.listVolumes(firstBookId)],
  ] as Case[]) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      pass++;
    } catch (e) {
      console.log(`❌ ${name}  ${e instanceof Error ? e.message : e}`);
      fail++;
    }
  }
}

if (writeMode) {
  // 安全写链路：建空草稿 → 立即删除（不留任何内容）
  try {
    const bookId = firstBookId;
    const draft = await novels.newDraft(bookId);
    console.log(`✅ new_draft（建草稿 item=${draft.itemId}）`);
    pass++;
    await author.deleteChapter(draft.itemId, bookId);
    console.log(`✅ delete_chapter（草稿已清理）`);
    pass++;
  } catch (e) {
    console.log(`❌ write-chain  ${e instanceof Error ? e.message : e}`);
    fail++;
  }
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败${writeMode ? "（含写链路）" : "（只读模式，--write 可加测写链路）"}`);
process.exit(fail ? 1 : 0);
