import { apiClient } from "../../api/base";
import { ENDPOINTS } from "../../api/endpoints";
import type { FetchJobsParams, JobsResponse } from "../../types/jobs.types";
import { buildJobsCacheKey, cacheExpiresIn, isCached } from "../../utils/cache";

function buildJobsBody(params: FetchJobsParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (params.query?.trim()) body.query = params.query.trim();
  if (params.location?.trim()) body.location = params.location.trim();
  if (params.sites?.length) body.sites = params.sites;
  if (params.exactKeywords?.length) body.exactKeywords = params.exactKeywords;
  if (params.fuzzyKeywords?.length) body.fuzzyKeywords = params.fuzzyKeywords;
  if (params.booleanQuery?.trim()) body.booleanQuery = params.booleanQuery.trim();
  if (params.locationMode) body.locationMode = params.locationMode;
  if (params.radius !== undefined) body.radius = params.radius;
  if (params.radiusUnit) body.radiusUnit = params.radiusUnit;
  if (params.remoteOnly) body.remoteOnly = params.remoteOnly;
  if (params.excludeCountries?.length) body.excludeCountries = params.excludeCountries;
  if (params.jobTypes?.length) body.jobTypes = params.jobTypes;
  if (params.minSalary !== undefined) body.minSalary = params.minSalary;
  if (params.maxSalary !== undefined) body.maxSalary = params.maxSalary;
  if (params.currency?.trim()) body.currency = params.currency.trim();
  if (params.experienceLevels?.length) body.experienceLevels = params.experienceLevels;
  if (params.sortBy) body.sortBy = params.sortBy;
  if (params.resultsWanted !== undefined) body.resultsWanted = params.resultsWanted;
  // googleQuery can be false (skip Google) or a string override
  if (params.googleQuery !== undefined) body.googleQuery = params.googleQuery;
  if (params.googleResultsWanted !== undefined) body.googleResultsWanted = params.googleResultsWanted;
  if (params.hoursOld !== undefined) body.hoursOld = params.hoursOld;
  if (params.page !== undefined) body.page = params.page;
  if (params.limit !== undefined) body.limit = params.limit;
  return body;
}

/** Scrape jobs from LinkedIn and/or Indeed. */
export const fetchJobs = async (params: FetchJobsParams, options: { skipCache?: boolean } = {}): Promise<JobsResponse> => {
  if (!params.query?.trim() && !params.exactKeywords?.length && !params.fuzzyKeywords?.length) {
    throw {
      userMessage: "A search query or keywords are required to fetch jobs.",
      originalError: new Error("Missing search parameters"),
    };
  }

  const body = buildJobsBody(params);

  try {
    const response = await apiClient<JobsResponse>({
      method: "POST",
      endpoint: ENDPOINTS.JOBS.SCRAPE,
      data: body,
      skipCache: options.skipCache,
    });
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
    if (err.response?.status === 429) {
      throw { userMessage: "Too many requests. Please wait a moment and try again.", originalError: error };
    }
    const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to fetch jobs. Please try again.";
    throw { userMessage: errorMessage, originalError: error };
  }
};

/**
 * Returns cache status for a given params object.
 * { cached: boolean; expiresIn: number (seconds) }
 */
export const getJobsCacheStatus = (params: FetchJobsParams): { cached: boolean; expiresIn: number } => {
  const body = buildJobsBody(params);
  const key = buildJobsCacheKey({ endpoint: ENDPOINTS.JOBS.SCRAPE, ...body });
  return { cached: isCached(key), expiresIn: cacheExpiresIn(key) };
};
