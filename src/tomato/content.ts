/** 章节正文处理：纯文本/Markdown → 番茄要求的 <p> 段落 HTML；从 md 稿件提取指定章。 */

import fs from "node:fs";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 文本转番茄正文 HTML。
 * - 已经是 <p> 开头的视为现成 HTML，原样返回；
 * - 否则按行切分，每个非空行作为一个段落，去掉 Markdown 加粗标记 **。
 */
export function toChapterHtml(text: string): string {
  const t = text.trim();
  if (/^\s*<p[\s>]/i.test(t)) return t;
  const paras = t
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && l !== "---" && !l.startsWith("#") && !l.startsWith(">"))
    .map((l) => l.replace(/\*\*/g, ""));
  return paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

export interface ExtractedChapter {
  /** 完整标题，如「第16章 一炉好丹」 */
  title: string;
  /** 正文 HTML */
  content: string;
  /** 段落数 */
  paragraphs: number;
}

/**
 * 从 Markdown 稿件里提取指定章节号。约定章节标题形如 `## 第N章 标题`。
 */
export function extractChapter(filePath: string, chapterNo: number): ExtractedChapter {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const startRe = new RegExp(`^##\\s*第${chapterNo}章\\s*(.*)$`);
  let start = -1;
  let titleRest = "";
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(startRe);
    if (m) {
      start = i;
      titleRest = m[1].trim();
      break;
    }
  }
  if (start === -1) {
    throw new Error(`在 ${filePath} 中未找到「第${chapterNo}章」`);
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s*第\d+章/.test(lines[i])) {
      end = i;
      break;
    }
  }
  const bodyLines = lines.slice(start + 1, end);
  const content = toChapterHtml(bodyLines.join("\n"));
  const paragraphs = (content.match(/<p>/g) || []).length;
  return { title: `第${chapterNo}章 ${titleRest}`, content, paragraphs };
}
