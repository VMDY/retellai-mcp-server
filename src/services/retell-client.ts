import { RETELL_API_BASE } from "../constants.js";

const API_KEY = process.env.RETELL_API_KEY ?? "";

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

export interface RetellResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function retellRequest<T = unknown>(
  opts: RequestOptions
): Promise<RetellResponse<T>> {
  if (!API_KEY) {
    throw new Error(
      "RETELL_API_KEY is not set. Export it as an environment variable before starting the server."
    );
  }

  const url = new URL(`${RETELL_API_BASE}${opts.path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url.toString(), {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let data: T;
  const text = await res.text();
  try {
    data = JSON.parse(text) as T;
  } catch {
    data = text as unknown as T;
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? (data as Record<string, unknown>).message
        : text;
    throw new Error(`Retell API ${res.status}: ${msg}`);
  }

  return { ok: true, status: res.status, data };
}

export const retellGet = <T = unknown>(path: string) =>
  retellRequest<T>({ method: "GET", path });

export const retellPost = <T = unknown>(
  path: string,
  body?: Record<string, unknown>
) => retellRequest<T>({ method: "POST", path, body });

export const retellPatch = <T = unknown>(
  path: string,
  body?: Record<string, unknown>
) => retellRequest<T>({ method: "PATCH", path, body });

export const retellDelete = <T = unknown>(path: string) =>
  retellRequest<T>({ method: "DELETE", path });
