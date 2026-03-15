import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";

import { DEFAULT_PORT } from "./constants.js";
import { registerAgentTools } from "./tools/agents.js";
import { registerCallTools } from "./tools/calls.js";
import { registerPhoneTools } from "./tools/phone-numbers.js";
import { registerAccountTools } from "./tools/account.js";
import { registerVoiceTools } from "./tools/voices.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-bases.js";
import { registerLlmTools } from "./tools/llm-configs.js";
import { registerConversationFlowTools } from "./tools/conversation-flows.js";
import { registerChatTools } from "./tools/chats.js";
import { registerChatAgentTools } from "./tools/chat-agents.js";
import { registerFlowComponentTools } from "./tools/flow-components.js";
import { registerTestTools } from "./tools/tests.js";
import { registerCustomTelephonyTools } from "./tools/custom-telephony.js";
import { registerMcpToolTools } from "./tools/mcp-tools.js";

function createServer(): McpServer {
  const server = new McpServer({ name: "retellai-mcp-server", version: "1.0.0" });
  registerAgentTools(server);
  registerCallTools(server);
  registerPhoneTools(server);
  registerAccountTools(server);
  registerVoiceTools(server);
  registerKnowledgeBaseTools(server);
  registerLlmTools(server);
  registerConversationFlowTools(server);
  registerChatTools(server);
  registerChatAgentTools(server);
  registerFlowComponentTools(server);
  registerTestTools(server);
  registerCustomTelephonyTools(server);
  registerMcpToolTools(server);
  return server;
}

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => { res.json({ status: "ok", server: "retellai-mcp-server" }); });
  app.post("/mcp", async (req, res) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });
  const port = parseInt(process.env.PORT || String(DEFAULT_PORT));
  app.listen(port, "0.0.0.0", () => {
    console.error(`retellai-mcp-server running on http://0.0.0.0:${port}/mcp`);
  });
}

async function runStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("retellai-mcp-server running on stdio");
}

const transport = process.env.TRANSPORT || "stdio";
if (transport === "http") { runHTTP().catch((e) => { console.error(e); process.exit(1); }); }
else { runStdio().catch((e) => { console.error(e); process.exit(1); }); }
