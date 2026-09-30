import axios from "axios";

export type ApiErrorKind =
  | "network"
  | "rate_limit"
  | "not_found"
  | "validation"
  | "server";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public retryAt?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const http = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github+json" },
  timeout: 15_000,
});

function toApiError(e: unknown): ApiError {
  if (!axios.isAxiosError(e))
    return new ApiError("server", "Something went wrong.");
  const res = e.response;
  if (!res)
    return new ApiError(
      "network",
      "Could not reach GitHub. Check your connection and try again.",
    );

  const { status, headers } = res;
  const responseMessage =
    typeof res.data?.message === "string" ? res.data.message : "";
  const isRateLimited =
    headers["x-ratelimit-remaining"] === "0" ||
    Boolean(headers["retry-after"]) ||
    responseMessage.toLowerCase().includes("rate limit");
  if ((status === 403 || status === 429) && isRateLimited) {
    const reset = Number(headers["x-ratelimit-reset"]);
    return new ApiError(
      "rate_limit",
      "GitHub rate limit reached.",
      reset ? reset * 1000 : undefined,
    );
  }
  if (status === 404) return new ApiError("not_found", "Not found.");
  if (status === 422 || status === 400)
    return new ApiError(
      "validation",
      "GitHub could not understand that search. Try a different query.",
    );
  return new ApiError("server", `GitHub returned an error (${status}).`);
}

/** Single entry point for every request: typed result, cancellable, normalised errors. */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  try {
    return (await http.get<T>(url, { params, signal })).data;
  } catch (e) {
    if (axios.isCancel(e)) throw e; // let React Query treat it as a cancellation
    throw toApiError(e);
  }
}
