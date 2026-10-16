/** 发布工具：发布 / 定时发布一章。 */

import type { McpTool } from "./types.js";
import { createService, resolveBookId } from "../tomato/service.js";
import { extractChapter, toChapterHtml } from "../tomato/content.js";

export const publishChapter: McpTool = {
  definition: {
    name: "publish_chapter",
    description:
      "发布或定时发布一章到当前（或指定）小说。内容二选一：① 直接传 title + content；② 传 file（Markdown 稿件路径）+ chapter_no 自动提取（标题取章节行）。publish_time 传 ISO 时间则定时/预约发布，省略则立即发布。",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "章节标题（用 file+chapter_no 时可省略，自动取）" },
        content: {
          type: "string",
          description: "正文，纯文本/Markdown（按行分段）或已是 <p> HTML",
        },
        file: { type: "string", description: "Markdown 稿件路径（与 chapter_no 搭配使用）" },
        chapter_no: { type: "number", description: "要从 file 中提取的章节号" },
        publish_time: {
          type: "string",
          description: "ISO 时间则定时发布（如 2026-06-20T15:00:00+08:00）；省略则立即发布",
        },
        author_speak: {
          type: "string",
          description: "作者有话说内容（显示在章节末尾）",
        },
        book_id: { type: "string", description: "可选，目标小说；默认当前选中" },
      },
    },
  },
  async run(args) {
    const svc = createService();
    const bookId = await resolveBookId(svc, args?.book_id);

    let title: string | undefined = args?.title;
    let content: string | undefined = args?.content;
    const authorSpeak: string | undefined = args?.author_speak ? String(args.author_speak) : undefined;

    if (args?.file && args?.chapter_no != null) {
      const ex = extractChapter(String(args.file), Number(args.chapter_no));
      title = title || ex.title;
      content = ex.content;
    } else if (content) {
      content = toChapterHtml(String(content));
    }

    if (!title || !content) {
      throw new Error("需要提供 title + content，或 file + chapter_no");
    }

    let timerTime: number | undefined;
    if (args?.publish_time) {
      const ts = Date.parse(String(args.publish_time));
      if (Number.isNaN(ts)) throw new Error(`无法解析 publish_time: ${args.publish_time}`);
      timerTime = Math.floor(ts / 1000 / 60) * 60; // 取整到分钟
      if (timerTime * 1000 <= Date.now()) throw new Error("publish_time 必须是未来时间");
    }

    const res = await svc.publishChapter({ bookId, title, content, timerTime, authorSpeak });
    return {
      success: true,
      book_id: bookId,
      item_id: res.itemId,
      title,
      mode: res.timed ? "定时发布" : "立即发布",
      publish_time: res.timed ? new Date(res.timerTime! * 1000).toISOString() : "now",
    };
  },
};
