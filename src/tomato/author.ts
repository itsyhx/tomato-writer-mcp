/**
 * 作者后台扩展接口：账号、通知、违规、打卡、热词、合同、登录态、章节删除。
 *
 * 全部为 2026-10 在线上实测过的端点（GET 直连 + POST urlencoded），
 * 响应统一为 { code, message, data }，code===0 为成功（client 已解包）。
 */

import { TomatoClient } from "./client.js";

export class AuthorService {
  constructor(private readonly client: TomatoClient) {}

  /** 账号信息（昵称、ID、等级等 26 个字段）。 */
  getAccountInfo(): Promise<unknown> {
    return this.client.get("/api/author/account/info/v0/");
  }

  /** 登录态校验（Cookie 是否失效的最轻量探针）。 */
  checkLogin(): Promise<unknown> {
    return this.client.get("/api/author/verify/check_user_status/v0");
  }

  /** 作者级数据总览。 */
  getAuthorStats(): Promise<unknown> {
    return this.client.get("/api/author/stats/author/v0/");
  }

  /** 站内通知列表（审核结果等）。location=2 为通知中心。 */
  listNotices(pageIndex = 0, pageCount = 10, location = 2): Promise<unknown> {
    return this.client.get("/api/author/notice/list/v0/", {
      page_index: pageIndex,
      page_count: pageCount,
      location,
    });
  }

  /** 违规/封禁状态。不传 book_id 查账号级。 */
  getBannedInfo(bookId?: string): Promise<unknown> {
    return this.client.get("/api/author/banned/info/v0/", bookId ? { book_id: bookId } : {});
  }

  /** 打卡日历（start/end 为 unix 秒）。 */
  getAttendCalendar(bookId: string, startDate: number, endDate: number): Promise<unknown> {
    return this.client.get("/api/author/attend/book_attend/v0/", {
      book_id: bookId,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /** 打卡券数量。 */
  getCheckinTickets(): Promise<unknown> {
    return this.client.get("/api/author/attend/new_check_in_ticket_count/v0");
  }

  /** 签约合同历史。注意：未实名/未签约账号可能返回 -3 登录信息有误。 */
  getContractHistory(): Promise<unknown> {
    return this.client.get("/api/author/contract/contract_history/v0");
  }

  /** 站内热词（起书名/蹭热点）。gender 1=男频 2=女频。 */
  getHotWords(gender = 1, type = 1): Promise<unknown> {
    return this.client.get("/api/author/hot_word/word_list/v0", {
      gender,
      type,
      set_read_time: false,
    });
  }

  /** 短篇/微头条列表。 */
  listShortArticles(pageIndex = 0, pageCount = 5): Promise<unknown> {
    return this.client.get("/api/author/short_article/list/v0/", {
      page_index: pageIndex,
      page_count: pageCount,
    });
  }

  /** 草稿箱列表（未发布章节）。 */
  listDrafts(bookId: string, pageIndex = 0, pageCount = 20): Promise<unknown> {
    return this.client.get("/api/author/chapter/draft_list/v1", {
      book_id: bookId,
      page_index: pageIndex,
      page_count: pageCount,
    });
  }

  /** 抖音热点榜（配合热词选题）。 */
  getDouyinHotList(): Promise<unknown> {
    return this.client.get("/api/author/short_article/douyin_hot_list/v0/");
  }

  /** 任务勋章概览。 */
  getMedalSummary(): Promise<unknown> {
    return this.client.get("/api/author/task_medal/summary/v0");
  }

  /** AI 功能资格（AI 插画/AI 命名/AI 咨询等是否开放）。 */
  getAiQualification(bookId: string): Promise<unknown> {
    return this.client.get("/api/author/inset/qualification/v0", { book_id: bookId });
  }

  /**
   * 删除章节（已发布/草稿均可）。⚠️ 不可恢复。
   * 端点：POST /api/author/delete_article/v1，body: { item_id, book_id }（实测必须带 book_id）。
   */
  deleteChapter(itemId: string, bookId: string): Promise<unknown> {
    return this.client.post("/api/author/delete_article/v1", {
      item_id: itemId,
      book_id: bookId,
    });
  }
}

/** 构造 AuthorService（惰性依赖 .env，避免未配置时 import 就崩）。 */
export function createAuthorService(): AuthorService {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { loadAuth } = require("./config.js");
  const { TomatoClient } = require("./client.js");
  return new AuthorService(new TomatoClient(loadAuth()));
}
