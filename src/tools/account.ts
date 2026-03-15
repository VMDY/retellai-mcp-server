import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { retellGet, retellPost } from "../services/retell-client.js";

export function registerAccountTools(server: McpServer): void {
  server.registerTool("retell_get_concurrency", {
    title: "Get Concurrency", description: "Check current call concurrency usage.", inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => { const { data } = await retellGet("/get-concurrency"); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  server.registerTool("retell_create_batch_call", {
    title: "Create Batch Call", description: "Launch a batch of outbound phone calls.\n\nArgs:\n  - from_number (string): E.164 caller\n  - tasks (array): [{to_number, retell_llm_dynamic_variables?}]\n  - name (string?): Campaign name\n  - trigger_timestamp (number?): Schedule unix ms",
    inputSchema: { from_number: z.string().min(1), tasks: z.array(z.object({ to_number: z.string().min(1), retell_llm_dynamic_variables: z.record(z.string()).optional() })).min(1), name: z.string().optional(), trigger_timestamp: z.number().optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async ({ from_number, tasks, name, trigger_timestamp }) => {
    const body: Record<string, unknown> = { from_number, tasks };
    if (name) body.name = name; if (trigger_timestamp) body.trigger_timestamp = trigger_timestamp;
    const { data } = await retellPost("/create-batch-call", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
