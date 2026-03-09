export type JobSource = "linkedin" | "indeed" | "google" | string;
export type JobType = "fulltime" | "parttime" | "contract" | "internship" | "temporary" | "freelance" | "perdiem" | "other";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
export type SortBy = "relevance" | "date" | "salary";
export type LocationMode = "exact" | "near";
export type RadiusUnit = "miles" | "km";

export interface Job {
  id: string;
  title: string;
  company?: string;
  company_name?: string;
  location?: string;
  description?: string;
  url?: string;
  job_url?: string;
  source: JobSource;
  is_remote?: boolean;
  remote?: boolean;
  company_logo?: string;
  date_posted?: string;
  salary_source?: string;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
  pay_period?: string;
  job_type?: string;
  job_level?: string;
  relevance_score?: number;
}

export interface NormalisedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: JobSource;
  isRemote: boolean;
  companyLogo?: string;
  datePosted?: string;
  salary?: string;
  jobType?: string;
  jobLevel?: string;
  relevanceScore?: number;
}

export interface JobsResponse {
  message: string;
  total_jobs: number;
  total_pages: number;
  page: number;
  limit: number;
  jobs: Job[];
}

export interface FetchJobsParams {
  query?: string;
  location?: string;
  // pagination
  page?: number;
  limit?: number;
  // sorting
  sortBy?: SortBy;
  // location radius
  locationMode?: LocationMode;
  radius?: number;
  radiusUnit?: RadiusUnit;
  // filtering
  remoteOnly?: boolean;
  excludeCountries?: string[];
  exactKeywords?: string[];
  fuzzyKeywords?: string[];
  booleanQuery?: string;
  jobTypes?: JobType[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  experienceLevels?: ExperienceLevel[];
  sites?: ("linkedin" | "indeed")[];
  resultsWanted?: number;
  googleQuery?: string | false;
  googleResultsWanted?: number;
  hoursOld?: number;
}

export type SourceFilter = "all" | "linkedin" | "indeed" | "google";
