import axios, { AxiosError } from "axios";
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

const baseURL = import.meta.env.VITE_BASE_URL;

export const apiClient = async <T = unknown>({ method, endpoint, data, params, skipCache = false }: ApiOptions): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Cache POST requests using a stable key derived from body + endpoint.
  const cacheKey = method === "POST" && data ? buildJobsCacheKey({ endpoint, ...(data as Record<string, unknown>) }) : null;

  if (cacheKey && !skipCache) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;
  }

  let url = `${baseURL}${endpoint}`;

  if (params && method === "GET") {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    url += `?${queryParams.toString()}`;
  }

  const options = {
    method,
    url,
    headers,
    ...(params && method !== "GET" && { params }),
    data,
  };

  try {
    const response = await axios(options);
    if (cacheKey) setCache<T>(cacheKey, response.data as T);
    return response.data as T;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status !== 404) {
        console.error("API Error:", error.message);
      }
    } else {
      console.error("API Error:", "An unknown error occurred");
    }
    throw error;
  }
};
