/** 小说管理工具：列出 / 切换 / 查看当前。 */

import type { McpTool } from "./types.js";
import { createService } from "../tomato/service.js";
import { setCurrentBookId, getCurrentBookId } from "../tomato/config.js";

export const listNovels: McpTool = {
  definition: {
    name: "list_novels",
    description:
      "列出当前账号下的所有小说（book_id、书名、字数、总阅读数、连载状态）。多本小说时用它来选择操作目标。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    const svc = createService();
    const list = await svc.listNovels();
    const current = getCurrentBookId() ?? null;
    return {
      count: list.length,
      current_book_id: current,
      novels: list.map((b) => ({
        book_id: String(b.book_id),
        book_name: b.book_name,
        word_count: b.word_count,
        read_count: b.read_count,
        creation_status: b.creation_status ?? b.status,
        is_current: current != null && String(b.book_id) === String(current),
      })),
    };
  },
};

export const switchNovel: McpTool = {
  definition: {
    name: "switch_novel",
    description:
      "切换当前要操作的小说（传 book_id，可先用 list_novels 查）。之后的发布、数据查询默认作用于这本，直到再次切换。",
    inputSchema: {
      type: "object",
      properties: { book_id: { type: "string", description: "目标小说的 book_id" } },
      required: ["book_id"],
    },
  },
  async run(args) {
    const bookId = String(args?.book_id ?? "").trim();
    if (!bookId) throw new Error("缺少 book_id");
    const svc = createService();
    const novel = await svc.getNovel(bookId);
    if (!novel) throw new Error(`账号下找不到 book_id=${bookId} 的小说`);
    setCurrentBookId(bookId);
    return { switched_to: bookId, book_name: novel.book_name };
  },
};

export const getCurrentNovel: McpTool = {
  definition: {
    name: "get_current_novel",
    description: "查看当前选中的小说。",
    inputSchema: { type: "object", properties: {} },
  },
  async run() {
    const id = getCurrentBookId();
    if (!id) {
      return { current: null, hint: "尚未选择小说，用 list_novels 查看、switch_novel 选择" };
    }
    const svc = createService();
    const novel = await svc.getNovel(id);
    return { current_book_id: id, book_name: novel?.book_name ?? null };
  },
};
