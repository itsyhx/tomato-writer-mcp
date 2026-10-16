/** 鉴权加载 + “当前操作的小说”状态持久化。 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { TomatoAuth } from "./client.js";

// 基于编译产物位置反推项目根（dist/tomato/config.js → 项目根），不依赖启动时的 cwd
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_FILE = path.join(PROJECT_ROOT, "data", "state.json");
const ENV_FILE = path.join(PROJECT_ROOT, ".env");

dotenv.config({ path: ENV_FILE });

export function loadAuth(): TomatoAuth {
  const cookie = process.env.TOMATO_COOKIE?.trim();
  const csrfToken = process.env.TOMATO_CSRF_TOKEN?.trim();
  if (!cookie || !csrfToken) {
    throw new Error(
      "缺少鉴权配置。请在 .env 设置 TOMATO_COOKIE 和 TOMATO_CSRF_TOKEN" +
        "（登录番茄作家后台后，从任意 /api/author 请求的请求头里复制）。",
    );
  }
  return { cookie, csrfToken };
}

interface State {
  currentBookId?: string;
}

function readState(): State {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeState(s: State): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

/** 当前选中的 book_id：优先 state.json，其次 .env 默认值。 */
export function getCurrentBookId(): string | undefined {
  return readState().currentBookId || process.env.TOMATO_DEFAULT_BOOK_ID?.trim() || undefined;
}

export function setCurrentBookId(bookId: string): void {
  const s = readState();
  s.currentBookId = bookId;
  writeState(s);
}
