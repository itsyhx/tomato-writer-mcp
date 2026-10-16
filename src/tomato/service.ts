/** 番茄作家后台业务封装：小说列表、阅读数据、建草稿、发布章节。 */

import { TomatoClient } from "./client.js";
import { loadAuth, getCurrentBookId } from "./config.js";

export interface NovelSummary {
  book_id: string;
  book_name: string;
  word_count?: number;
  read_count?: number;
  creation_status?: number;
  status?: number;
  [k: string]: unknown;
}

export interface PublishOptions {
  bookId: string;
  title: string;
  content: string;
  volumeId?: string;
  volumeName?: string;
  timerTime?: number;
  authorSpeak?: string;
}

export interface DraftInfo {
  itemId: string;
  volumeId: string;
  volumeName: string;
}

export class NovelService {
  constructor(private readonly client: TomatoClient) {}

  /** 账号下所有小说。 */
  async listNovels(): Promise<NovelSummary[]> {
    const data = await this.client.get("/api/author/book/book_list/v0", {
      page_index: 0,
      page_count: 50,
    });
    const list = Array.isArray(data) ? data : ((data?.book_list ?? data?.list ?? []) as unknown[]);
    return list as NovelSummary[];
  }

  async getNovel(bookId: string): Promise<NovelSummary | undefined> {
    const list = await this.listNovels();
    return list.find((b) => String(b.book_id) === String(bookId));
  }

  /** 各章阅读/追读等明细。参数随平台演进，调用方应容错。 */
  async getChapterStats(bookId: string): Promise<unknown> {
    return this.client.get("/api/author/stats/chapter_list_v1/v0/", {
      book_id: bookId,
      page_index: 0,
      page_count: 50,
    });
  }

  /** 分卷列表。 */
  async listVolumes(bookId: string): Promise<unknown> {
    return this.client.get("/api/author/volume/volume_list/v1", { book_id: bookId });
  }

  /** 某一卷下的章节列表。 */
  async listChapters(bookId: string, volumeId: string): Promise<unknown> {
    return this.client.get("/api/author/chapter/chapter_list/v1", {
      book_id: bookId,
      volume_id: volumeId,
      page_index: 0,
      page_count: 100,
      status: 0,
      must_have_correction_feedback: 0,
      need_correction_feedback_num: 1,
      sort: "",
    });
  }

  /** 新建空草稿，返回章节 item_id 及其默认所属分卷。 */
  async newDraft(bookId: string): Promise<DraftInfo> {
    const data = await this.client.post("/api/author/article/new_article/v0/", {
      book_id: bookId,
      need_reuse: 0,
    });
    const { volumeId, volumeName } = parseDefaultVolume(data);
    return { itemId: String(data.item_id), volumeId, volumeName };
  }

  /**
   * 发布一章 = 建草稿 + 提交。timerTime 为 unix 秒（>0 即定时/预约发布），
   * 不传则立即发布。
   */
  async publishChapter(opts: {
    bookId: string;
    title: string;
    content: string;
    timerTime?: number;
    volumeId?: string;
    volumeName?: string;
    authorSpeak?: string;
  }): Promise<{ itemId: string; timed: boolean; timerTime?: number; data: unknown }> {
    const draft = await this.newDraft(opts.bookId);
    const volumeId = opts.volumeId || draft.volumeId;
    const volumeName = opts.volumeName || draft.volumeName;
    const timed = typeof opts.timerTime === "number" && opts.timerTime > 0;
    const hasSpeak = typeof opts.authorSpeak === "string" && opts.authorSpeak.trim().length > 0;
    const data = await this.client.post("/api/author/publish_article/v0/", {
      item_id: draft.itemId,
      book_id: opts.bookId,
      content: opts.content,
      title: opts.title,
      volume_id: volumeId,
      volume_name: volumeName,
      timer_status: timed ? 1 : 0,
      timer_time: timed && opts.timerTime ? opts.timerTime : 0,
      publish_status: 1,
      need_pay: 0,
      use_ai: 2,
      device_platform: "pc",
      speak_type: hasSpeak ? 1 : 0,
      speak_text: hasSpeak && opts.authorSpeak ? opts.authorSpeak : "",
      timer_chapter_preview: "[]",
      has_chapter_ad: "false",
      chapter_ad_types: "",
    });
    return { itemId: draft.itemId, timed, timerTime: timed ? opts.timerTime : undefined, data };
  }
}

function parseDefaultVolume(data: any): { volumeId: string; volumeName: string } {
  const volumeId = String(data?.volume_id ?? "");
  let volumeName = "正文";
  try {
    let vd = data?.volume_data;
    if (typeof vd === "string") vd = JSON.parse(vd);
    if (Array.isArray(vd)) {
      const hit = vd.find((v: any) => String(v.volume_id) === volumeId) ?? vd[0];
      if (hit?.volume_name) volumeName = hit.volume_name;
    }
  } catch {
    /* 用默认名 */
  }
  return { volumeId, volumeName };
}

/** 用 .env 鉴权构造服务实例。 */
export function createService(): NovelService {
  return new NovelService(new TomatoClient(loadAuth()));
}

/** 解析要操作的 book_id：显式参数 > 当前选中 > 账号第一本。 */
export async function resolveBookId(svc: NovelService, explicit?: string): Promise<string> {
  if (explicit) return String(explicit);
  const cur = getCurrentBookId();
  if (cur) return cur;
  const list = await svc.listNovels();
  if (!list.length) throw new Error("账号下没有小说");
  return String(list[0].book_id);
}
