import { apiClient } from "../../api/base";
import { ENDPOINTS } from "../../api/endpoints";
import type { FetchJobsParams, JobsResponse } from "../../types/jobs.types";
import { buildJobsCacheKey, cacheExpiresIn, isCached } from "../../utils/cache";

/** Scrape jobs from LinkedIn, Indeed, and/or Google Jobs. */
export const fetchJobs = async (params: FetchJobsParams, options: { skipCache?: boolean } = {}): Promise<JobsResponse> => {
  if (!params.keywords?.length && !params.query) {
    throw {
      userMessage: "Keywords or query are required to fetch jobs.",
      originalError: new Error("Missing search parameters"),
    };
  }

  const body: Record<string, unknown> = {};
  if (params.keywords?.length) {
    body.keywords = params.keywords;
    if (params.location) body.location = params.location;
  }
  if (params.query) body.query = params.query;

  try {
    const response = await apiClient<JobsResponse>({
      method: "POST",
      endpoint: ENDPOINTS.JOBS.SCRAPE,
      data: body,
      skipCache: options.skipCache,
    });
    console.log('response :>> ', response);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to fetch jobs. Please try again.";
    throw { userMessage: errorMessage, originalError: error };
  }
};

/**
 * Returns cache status for a given params object.
 * { cached: boolean; expiresIn: number (seconds) }
 */
export const getJobsCacheStatus = (params: FetchJobsParams): { cached: boolean; expiresIn: number } => {
  const body: Record<string, unknown> = {};
  if (params.keywords?.length) {
    body.keywords = params.keywords;
    if (params.location) body.location = params.location;
  }
  if (params.query) body.query = params.query;

  const key = buildJobsCacheKey({ endpoint: ENDPOINTS.JOBS.SCRAPE, ...body });
  return { cached: isCached(key), expiresIn: cacheExpiresIn(key) };
};
