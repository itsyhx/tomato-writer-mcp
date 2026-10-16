/** MCP 工具的统一形状：定义 + 执行函数（返回纯数据，由 index 统一包装成 MCP 结果）。 */
export interface McpTool {
  definition: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  };
  run: (args: Record<string, any>) => Promise<unknown>;
}
