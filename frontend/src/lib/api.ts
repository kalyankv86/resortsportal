/**
 * Thin fetch wrapper for the CWETR Laravel API.
 *
 * Base URL: NEXT_PUBLIC_API_BASE_URL (default "/api" — same origin via Nginx).
 * Server Components call `api()` directly; client code that needs the bearer
 * token uses `api(path, { token })` or the useAuth() helpers.
 */

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

/**
 * Browser: use the (possibly relative) public base — same origin via Nginx.
 * Server (RSC / route handlers): fetch() needs an absolute URL, so resolve a
 * relative base against INTERNAL_API_ORIGIN (the local Nginx).
 */
export const API_BASE =
  typeof window === "undefined" && RAW_BASE.startsWith("/")
    ? `${process.env.INTERNAL_API_ORIGIN ?? "http://127.0.0.1"}${RAW_BASE}`
    : RAW_BASE;

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  /** Next.js fetch cache hint for server components. */
  revalidate?: number;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, token, revalidate, headers, ...rest } = opts;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
