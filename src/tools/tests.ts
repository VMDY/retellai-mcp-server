import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { retellPost } from "../services/retell-client.js";

export function registerTestTools(server: McpServer): void {
  server.registerTool("retell_create_batch_test", {
    title: "Create Batch Test", description: "Create an automated batch test to validate agent behavior.\n\nArgs:\n  - agent_id (string): Agent to test\n  - test_cases (array): [{scenario: string}]",
    inputSchema: { agent_id: z.string().min(1), test_cases: z.array(z.object({ scenario: z.string().min(1) })).min(1) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async ({ agent_id, test_cases }) => {
    const { data } = await retellPost("/create-batch-test", { agent_id, test_cases });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
