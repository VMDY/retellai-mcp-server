import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { retellGet } from "../services/retell-client.js";
import { CHARACTER_LIMIT } from "../constants.js";

function truncate(t: string): string { return t.length <= CHARACTER_LIMIT ? t : t.slice(0, CHARACTER_LIMIT) + "\n\n... (truncated)"; }

export function registerMcpToolTools(server: McpServer): void {
  server.registerTool("retell_get_mcp_tools", {
    title: "Get MCP Tools", description: "Get MCP tools configured in your Retell account.", inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => { const { data } = await retellGet("/get-mcp-tools"); return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] }; });
}
