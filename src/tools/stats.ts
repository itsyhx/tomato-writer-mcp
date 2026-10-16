/** 数据分析工具：小说阅读数据、章节列表。 */

import type { McpTool } from "./types.js";
import { createService, resolveBookId } from "../tomato/service.js";

export const getNovelStats: McpTool = {
  definition: {
    name: "get_novel_stats",
    description:
      "获取小说阅读数据：书级概览（总阅读数 read_count、字数、连载状态）+ 各章阅读/追读明细。不传 book_id 用当前选中的小说。",
    inputSchema: {
      type: "object",
      properties: {
        book_id: { type: "string", description: "可选，目标小说 book_id；默认当前选中" },
        chapter_detail: {
          type: "boolean",
          description: "是否包含各章明细，默认 true",
        },
      },
    },
  },
  async run(args) {
    const svc = createService();
    const bookId = await resolveBookId(svc, args?.book_id);
    const novel = await svc.getNovel(bookId);
    const result: Record<string, unknown> = {
      overview: novel
        ? {
            book_id: bookId,
            book_name: novel.book_name,
            word_count: novel.word_count,
            read_count: novel.read_count,
            creation_status: novel.creation_status ?? novel.status,
          }
        : { book_id: bookId, note: "未在书单中找到该书" },
    };
    if (args?.chapter_detail !== false) {
      try {
        result.chapter_stats = await svc.getChapterStats(bookId);
      } catch (e) {
        result.chapter_stats_error = e instanceof Error ? e.message : String(e);
      }
    }
    return result;
  },
};

export const listChapters: McpTool = {
  definition: {
    name: "list_chapters",
    description:
      "列出小说各分卷下的章节（含定时待发 / 已发布状态）。不传 book_id 用当前选中的小说。",
    inputSchema: {
      type: "object",
      properties: { book_id: { type: "string", description: "可选，目标小说 book_id" } },
    },
  },
  async run(args) {
    const svc = createService();
    const bookId = await resolveBookId(svc, args?.book_id);
    const volumesRaw: any = await svc.listVolumes(bookId);
    const vlist: any[] = Array.isArray(volumesRaw)
      ? volumesRaw
      : (volumesRaw?.volume_list ?? volumesRaw?.list ?? []);
    const volumes = [];
    for (const v of vlist) {
      const vid = String(v.volume_id ?? v.id ?? "");
      if (!vid) continue;
      try {
        const ch = await svc.listChapters(bookId, vid);
        volumes.push({ volume_id: vid, volume_name: v.volume_name, chapters: ch });
      } catch (e) {
        volumes.push({
          volume_id: vid,
          volume_name: v.volume_name,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { book_id: bookId, volumes };
  },
};
