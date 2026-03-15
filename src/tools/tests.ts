import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { retellGet, retellPost, retellPatch, retellDelete } from "../services/retell-client.js";
import { CHARACTER_LIMIT } from "../constants.js";
function truncate(t: string): string { return t.length <= CHARACTER_LIMIT ? t : t.slice(0, CHARACTER_LIMIT) + "\n\n... (truncated)"; }

export function registerTestTools(server: McpServer): void {
  // ── Test Case Definitions ────────────────────────────────────

  server.registerTool("retell_create_test_case_definition", {
    title: "Create Test Case Definition",
    description: "Create a reusable test case definition for agent testing.\n\nArgs:\n  - agent_id (string): Agent to test\n  - test_case_name (string): Name of the test case\n  - scenario (string): User behavior scenario description\n  - pass_criteria (array?): Criteria for passing [{type, description}]",
    inputSchema: { agent_id: z.string().min(1), test_case_name: z.string().min(1), scenario: z.string().min(1), pass_criteria: z.array(z.record(z.unknown())).optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  }, async ({ agent_id, test_case_name, scenario, pass_criteria }) => {
    const body: Record<string, unknown> = { agent_id, test_case_name, scenario };
    if (pass_criteria) body.pass_criteria = pass_criteria;
    const { data } = await retellPost("/create-test-case-definition", body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("retell_get_test_case_definition", {
    title: "Get Test Case Definition",
    description: "Get a specific test case definition.\n\nArgs:\n  - test_case_definition_id (string)",
    inputSchema: { test_case_definition_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ test_case_definition_id }) => {
    const { data } = await retellGet(`/get-test-case-definition/${test_case_definition_id}`);
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });

  server.registerTool("retell_list_test_case_definitions", {
    title: "List Test Case Definitions",
    description: "List all test case definitions.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => {
    const { data } = await retellGet("/list-test-case-definitions");
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });

  server.registerTool("retell_update_test_case_definition", {
    title: "Update Test Case Definition",
    description: "Update a test case definition.\n\nArgs:\n  - test_case_definition_id (string)\n  - test_case_name (string?), scenario (string?), pass_criteria (array?)",
    inputSchema: { test_case_definition_id: z.string().min(1), test_case_name: z.string().optional(), scenario: z.string().optional(), pass_criteria: z.array(z.record(z.unknown())).optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ test_case_definition_id, test_case_name, scenario, pass_criteria }) => {
    const body: Record<string, unknown> = {};
    if (test_case_name) body.test_case_name = test_case_name;
    if (scenario) body.scenario = scenario;
    if (pass_criteria) body.pass_criteria = pass_criteria;
    const { data } = await retellPatch(`/update-test-case-definition/${test_case_definition_id}`, body);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("retell_delete_test_case_definition", {
    title: "Delete Test Case Definition",
    description: "Delete a test case definition.\n\nArgs:\n  - test_case_definition_id (string)",
    inputSchema: { test_case_definition_id: z.string().min(1) },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
  }, async ({ test_case_definition_id }) => {
    const { data } = await retellDelete(`/delete-test-case-definition/${test_case_definition_id}`);
    return { content: [{ type: "text", text: data ? JSON.stringify(data, null, 2) : "Deleted." }] };
  });

  // ── Batch Tests ──────────────────────────────────────────────

  server.registerTool("retell_create_batch_test", {
    title: "Create Batch Test",
    description: "Create and run a batch test job.\n\nArgs:\n  - agent_id (string): Agent to test\n  - test_cases (array): [{scenario: string}]",
    inputSchema: { agent_id: z.string().min(1), test_cases: z.array(z.object({ scenario: z.string().min(1) })).min(1) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async ({ agent_id, test_cases }) => {
    const { data } = await retellPost("/create-batch-test", { agent_id, test_cases });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.registerTool("retell_get_batch_test", {
    title: "Get Batch Test",
    description: "Get a batch test job by ID.\n\nArgs:\n  - test_case_batch_job_id (string)",
    inputSchema: { test_case_batch_job_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ test_case_batch_job_id }) => {
    const { data } = await retellGet(`/get-batch-test/${test_case_batch_job_id}`);
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });

  server.registerTool("retell_list_batch_tests", {
    title: "List Batch Tests",
    description: "List all batch test jobs.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => {
    const { data } = await retellGet("/list-batch-tests");
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });

  // ── Test Runs ────────────────────────────────────────────────

  server.registerTool("retell_get_test_run", {
    title: "Get Test Run",
    description: "Get a specific test run result.\n\nArgs:\n  - test_run_id (string)",
    inputSchema: { test_run_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ test_run_id }) => {
    const { data } = await retellGet(`/get-test-run/${test_run_id}`);
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });

  server.registerTool("retell_list_test_runs", {
    title: "List Test Runs",
    description: "List all test runs for a batch test job.\n\nArgs:\n  - test_case_batch_job_id (string)",
    inputSchema: { test_case_batch_job_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ test_case_batch_job_id }) => {
    const { data } = await retellGet(`/list-test-runs/${test_case_batch_job_id}`);
    return { content: [{ type: "text", text: truncate(JSON.stringify(data, null, 2)) }] };
  });
}
