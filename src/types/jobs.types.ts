export type JobSource = "linkedin" | "indeed" | "google" | string;

export interface Job {
  id: string;
  title: string;
  // ts-jobspy uses company_name, but we normalise both
  company?: string;
  company_name?: string;
  location?: string;
  description?: string;
  // ts-jobspy uses job_url, but we normalise both
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
}

export interface JobsResponse {
  message: string;
  total_jobs: number;
  jobs: Job[];
}

export interface FetchJobsParams {
  keywords?: string[];
  location?: string;
  query?: string;
}

export type SourceFilter = "all" | "linkedin" | "indeed" | "google";
