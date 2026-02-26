import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import { getCached, setCache, buildJobsCacheKey } from "../utils/cache";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  token?: string;
  params?: Record<string, string | undefined | number>;
  thirdPartyApiKey?: string;
  /** Pass true to skip the cache for this request. */
  skipCache?: boolean;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ─────────────────────────────────────────────────────

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { method, url, params, data } = config;
    console.groupCollapsed(`%c ↑ ${method?.toUpperCase()} ${url}`, "color:#264653; font-weight:600;");
    if (params) console.log("Params:", params);
    if (data) console.log("Body:  ", typeof data === "string" ? JSON.parse(data) : data);
    console.groupEnd();
    return config;
  },
  (error: AxiosError) => {
    console.error("% Request setup error:", error.message);
    return Promise.reject(error);
  },
);

// ─── Response interceptor ────────────────────────────────────────────────────

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, config, data } = response;
    const cached = response.headers?.["x-cache"] === "HIT";
    console.groupCollapsed(`%c ↓ ${status} ${config.method?.toUpperCase()} ${config.url}${cached ? "  [CACHED]" : ""}`, `color:${status < 300 ? "#264653" : "#E76F51"}; font-weight:600;`);
    console.log("Data:  ", data);
    if (cached) console.log("%cServer cache HIT", "color:#A8DADC; font-weight:600;");
    console.groupEnd();
    return response;
  },
  (error: AxiosError) => {
    const { response, config } = error;
    console.groupCollapsed(`%c ✖ ${response?.status ?? "ERR"} ${config?.method?.toUpperCase()} ${config?.url}`, "color:#E76F51; font-weight:600;");
    console.error("Message:", error.message);
    if (response?.data) console.error("Response data:", response.data);
    console.groupEnd();
    return Promise.reject(error);
  },
);

// ─── API client ───────────────────────────────────────────────────────────────

export const apiClient = async <T = unknown>({ method, endpoint, data, params, skipCache = false }: ApiOptions): Promise<T> => {
  // Client-side cache check (POST only)
  const cacheKey = method === "POST" && data ? buildJobsCacheKey({ endpoint, ...(data as Record<string, unknown>) }) : null;

  if (cacheKey && !skipCache) {
    const cached = getCached<T>(cacheKey);
    if (cached) {
      console.log(`%c ✦ CLIENT CACHE HIT  ${endpoint}`, "color:#A8DADC; font-weight:600;");
      return cached;
    }
  }

  // Build URL params for GET requests
  let resolvedParams: Record<string, string> | undefined;
  if (params && method === "GET") {
    resolvedParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
  }

  const response = await http.request<T>({
    method,
    url: endpoint,
    data,
    ...(resolvedParams ? { params: resolvedParams } : {}),
    ...(params && method !== "GET" ? { params } : {}),
  });

  if (cacheKey) setCache<T>(cacheKey, response.data);
  return response.data;
};
