/**
 * 作者扩展工具：账号信息、登录态、站内通知、违规状态、打卡日历、
 * 热词/抖音热点（选题）、草稿箱、任务勋章、AI 资格、删除章节。
 *
 * 删除类工具显式要求 confirm=true，且必须给 book_id，避免误删。
 */

import type { McpTool } from "./types.js";
import { AuthorService } from "../tomato/author.js";
import { createService, resolveBookId } from "../tomato/service.js";
import { getCurrentBookId } from "../tomato/config.js";

/** 惰性构造：未配 .env 时只在真正调用时报错，不影响 server 启动。 */
function authorSvc(): AuthorService {
  const { loadAuth } = require("../tomato/config.js");
  const { TomatoClient } = require("../tomato/client.js");
  return new AuthorService(new TomatoClient(loadAuth()));
}

async function curBookId(explicit?: string): Promise<string> {
  if (explicit) return String(explicit);
  const cur = getCurrentBookId();
  if (cur) return cur;
  const svc = createService();
  return resolveBookId(svc);
}

export const getAccountInfo: McpTool = {
  definition: {
    name: "get_account_info",
    description: "获取当前番茄作家账号信息（昵称、ID、等级等）。用来确认 Cookie 绑的是哪个号。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    return authorSvc().getAccountInfo();
  },
};

export const checkLogin: McpTool = {
  definition: {
    name: "check_login",
    description:
      "检查登录态是否仍然有效（最轻量探针）。Cookie 过期前先用它确认，避免发布到一半失败。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    try {
      const data = await authorSvc().checkLogin();
      return { logged_in: true, detail: data };
    } catch (e) {
      return {
        logged_in: false,
        error: e instanceof Error ? e.message : String(e),
        hint: "Cookie 可能已失效，请重新从浏览器复制 TOMATO_COOKIE / TOMATO_CSRF_TOKEN 到 .env",
      };
    }
  },
};

export const getAuthorOverview: McpTool = {
  definition: {
    name: "get_author_overview",
    description: "作者级数据总览（全站维度的创作/收益概览）。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    return authorSvc().getAuthorStats();
  },
};

export const listNotices: McpTool = {
  definition: {
    name: "list_notices",
    description:
      "站内通知列表（审核结果、平台公告）。发完章节后用它盯是否已过审。"
    ,
    inputSchema: {
      type: "object",
      properties: {
        page_index: { type: "number", description: "页码，默认 0" },
        page_count: { type: "number", description: "每页条数，默认 10" },
      },
    },
  },
  async run(args) {
    return authorSvc().listNotices(
      Number(args?.page_index ?? 0),
      Number(args?.page_count ?? 10),
    );
  },
};

export const getBannedInfo: McpTool = {
  definition: {
    name: "get_banned_info",
    description: "违规/封禁状态查询。不传 book_id 查账号级；可用于违规自动告警。",
    inputSchema: {
      type: "object",
      properties: { book_id: { type: "string", description: "可选，书籍 ID" } },
    },
  },
  async run(args) {
    return authorSvc().getBannedInfo(args?.book_id ? String(args.book_id) : undefined);
  },
};

export const getAttendCalendar: McpTool = {
  definition: {
    name: "get_attend_calendar",
    description:
      "打卡/全勤日历。start_date / end_date 为 unix 秒；不传默认最近 30 天。",
    inputSchema: {
      type: "object",
      properties: {
        book_id: { type: "string", description: "可选，默认当前选中的书" },
        start_date: { type: "number", description: "起始 unix 秒" },
        end_date: { type: "number", description: "结束 unix 秒" },
      },
    },
  },
  async run(args) {
    const bookId = await curBookId(args?.book_id);
    const now = Math.floor(Date.now() / 1000);
    return authorSvc().getAttendCalendar(
      bookId,
      Number(args?.start_date ?? now - 30 * 86400),
      Number(args?.end_date ?? now),
    );
  },
};

export const getCheckinTickets: McpTool = {
  definition: {
    name: "get_checkin_tickets",
    description: "查询剩余打卡券数量（补卡用）。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    return authorSvc().getCheckinTickets();
  },
};

export const getHotWords: McpTool = {
  definition: {
    name: "get_hot_words",
    description:
      "站内热词榜（起书名 / 蹭流量用）。gender：1=男频，2=女频。",
    inputSchema: {
      type: "object",
      properties: {
        gender: { type: "number", description: "1=男频 2=女频，默认 1" },
      },
    },
  },
  async run(args) {
    return authorSvc().getHotWords(Number(args?.gender ?? 1));
  },
};

export const getDouyinHotList: McpTool = {
  definition: {
    name: "get_douyin_hot_list",
    description: "抖音热点榜，配合站内热词做选题参考。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    return authorSvc().getDouyinHotList();
  },
};

export const listDrafts: McpTool = {
  definition: {
    name: "list_drafts",
    description: "草稿箱列表（未发布的章节）。",
    inputSchema: {
      type: "object",
      properties: {
        book_id: { type: "string", description: "可选，默认当前选中的书" },
        page_count: { type: "number", description: "每页条数，默认 20" },
      },
    },
  },
  async run(args) {
    const bookId = await curBookId(args?.book_id);
    return authorSvc().listDrafts(bookId, 0, Number(args?.page_count ?? 20));
  },
};

export const getMedalSummary: McpTool = {
  definition: {
    name: "get_medal_summary",
    description: "任务勋章概览（平台活动完成度）。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    return authorSvc().getMedalSummary();
  },
};

export const getAiQualification: McpTool = {
  definition: {
    name: "get_ai_qualification",
    description: "AI 功能资格查询（AI 插画 / AI 命名 / AI 咨询是否对该书开放）。",
    inputSchema: {
      type: "object",
      properties: { book_id: { type: "string", description: "可选，默认当前选中的书" } },
    },
  },
  async run(args) {
    const bookId = await curBookId(args?.book_id);
    return authorSvc().getAiQualification(bookId);
  },
};

export const deleteChapter: McpTool = {
  definition: {
    name: "delete_chapter",
    description:
      "删除章节（已发布/草稿均可，⚠️ 不可恢复）。必须显式传 confirm=true 才会真正执行。",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "章节 item_id（从 list_chapters / list_drafts 取）" },
        book_id: { type: "string", description: "可选，默认当前选中的书" },
        confirm: { type: "boolean", description: "必须为 true 才会删除，防误删" },
      },
      required: ["item_id", "confirm"],
    },
  },
  async run(args) {
    const itemId = String(args?.item_id ?? "").trim();
    if (!itemId) throw new Error("缺少 item_id");
    if (args?.confirm !== true) {
      return {
        deleted: false,
        reason: "未确认。请显式传 confirm=true 再调用（删除不可恢复）。",
        item_id: itemId,
      };
    }
    const bookId = await curBookId(args?.book_id);
    await authorSvc().deleteChapter(itemId, bookId);
    return { deleted: true, item_id: itemId, book_id: bookId };
  },
};

export const authorTools: McpTool[] = [
  getAccountInfo,
  checkLogin,
  getAuthorOverview,
  listNotices,
  getBannedInfo,
  getAttendCalendar,
  getCheckinTickets,
  getHotWords,
  getDouyinHotList,
  listDrafts,
  getMedalSummary,
  getAiQualification,
  deleteChapter,
];
