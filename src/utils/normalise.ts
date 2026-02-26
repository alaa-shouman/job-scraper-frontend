import type { Job, NormalisedJob } from "../types/jobs.types";

export function normaliseJob(job: Job): NormalisedJob {
  const company = job.company_name ?? job.company ?? "Unknown Company";
  const url = job.job_url ?? job.url ?? "#";
  const isRemote = job.is_remote ?? job.remote ?? false;
  const source = job.source ?? "unknown";

  let salary: string | undefined;
  if (job.min_amount && job.max_amount) {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: job.currency ?? "USD",
      maximumFractionDigits: 0,
    });
    const period = job.pay_period ? ` / ${job.pay_period.toLowerCase()}` : "";
    salary = `${fmt.format(job.min_amount)} – ${fmt.format(job.max_amount)}${period}`;
  } else if (job.min_amount) {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: job.currency ?? "USD",
      maximumFractionDigits: 0,
    });
    salary = `From ${fmt.format(job.min_amount)}`;
  }

  return {
    id: job.id,
    title: job.title,
    company,
    location: job.location ?? "Location not specified",
    description: job.description ?? "",
    url,
    source,
    isRemote,
    companyLogo: job.company_logo,
    datePosted: job.date_posted,
    salary,
    jobType: job.job_type,
  };
}
