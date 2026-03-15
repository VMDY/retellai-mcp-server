import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { retellPost } from "../services/retell-client.js";

export function registerCustomTelephonyTools(server: McpServer): void {
  server.registerTool("retell_import_phone_number", {
    title: "Import Phone Number (Custom Telephony)",
    description: "Import an external phone number from your own SIP trunk into Retell.\n\nArgs:\n  - phone_number (string): E.164 number\n  - termination_uri (string): SIP URI\n  - inbound_agent_id (string?), outbound_agent_id (string?), nickname (string?)",
    inputSchema: { phone_number: z.string().min(1), termination_uri: z.string().min(1), inbound_agent_id: z.string().optional(), outbound_agent_id: z.string().optional(), nickname: z.string().optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async ({ phone_number, termination_uri, inbound_agent_id, outbound_agent_id, nickname }) => {
    const body: Record<string, unknown> = { phone_number, termination_uri };
    if (inbound_agent_id) body.inbound_agent_id = inbound_agent_id;
    if (outbound_agent_id) body.outbound_agent_id = outbound_agent_id;
    if (nickname) body.nickname = nickname;
    const { data } = await retellPost("/import-phone-number", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("retell_register_phone_call", {
    title: "Register Phone Call (Custom Telephony)",
    description: "Register a call for custom telephony (SIP).\n\nArgs:\n  - agent_id (string), direction ('inbound'|'outbound')\n  - from_number (string?), to_number (string?), metadata (object?), dynamic_variables (object?)",
    inputSchema: { agent_id: z.string().min(1), direction: z.enum(["inbound", "outbound"]), from_number: z.string().optional(), to_number: z.string().optional(), metadata: z.record(z.unknown()).optional(), dynamic_variables: z.record(z.string()).optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async ({ agent_id, direction, from_number, to_number, metadata, dynamic_variables }) => {
    const body: Record<string, unknown> = { agent_id, direction };
    if (from_number) body.from_number = from_number;
    if (to_number) body.to_number = to_number;
    if (metadata) body.metadata = metadata;
    if (dynamic_variables) body.retell_llm_dynamic_variables = dynamic_variables;
    const { data } = await retellPost("/v2/register-phone-call", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });
}
