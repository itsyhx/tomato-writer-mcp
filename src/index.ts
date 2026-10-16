#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// 从项目根的 .env 读取（dist/index.js → 项目根），不依赖启动时的 cwd
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env"),
});

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { McpTool } from "./tools/types.js";
import { listNovels, switchNovel, getCurrentNovel } from "./tools/novels.js";
import { getNovelStats, listChapters } from "./tools/stats.js";
import { publishChapter } from "./tools/publishing.js";
import { getLoginQrCode } from "./tools/auth.js";
import { authorTools } from "./tools/author.js";

const tools: McpTool[] = [
  listNovels,
  switchNovel,
  getCurrentNovel,
  getNovelStats,
  listChapters,
  publishChapter,
  getLoginQrCode,
  ...authorTools,
];
const byName = new Map(tools.map((t) => [t.definition.name, t]));

const server = new Server(
  { name: "tomato-writer-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => t.definition),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = byName.get(req.params.name);
  if (!tool) return errorResult(`未知工具: ${req.params.name}`);
  try {
    const data = await tool.run((req.params.arguments ?? {}) as Record<string, any>);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (e) {
    return errorResult(e instanceof Error ? e.message : String(e));
  }
});

function errorResult(message: string) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }],
    isError: true,
  };
}

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("tomato-writer-mcp MCP server running on stdio");
}

main().catch((e) => {
  console.error("启动失败:", e);
  process.exit(1);
});
