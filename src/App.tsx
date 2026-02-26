import { useState, useCallback } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import { useTimer } from "./hooks/useTimer";
import JobCard from "./components/JobCard";
import FilterBar from "./components/FilterBar";
import SkeletonCard from "./components/SkeletonCard";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import { fetchJobs, getJobsCacheStatus } from "./services/jobs/jobs.services";
import { normaliseJob } from "./utils/normalise";
import { clearCache } from "./utils/cache";
import type { FetchJobsParams, NormalisedJob, SourceFilter } from "./types/jobs.types";

type AppState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [jobs, setJobs] = useState<NormalisedJob[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<SourceFilter>("all");
  const [lastParams, setLastParams] = useState<FetchJobsParams | null>(null);
  const [cacheStatus, setCacheStatus] = useState<{ cached: boolean; expiresIn: number }>({ cached: false, expiresIn: 0 });
  const { elapsed, timerState, start: startTimer, stop: stopTimer } = useTimer();

  const runSearch = useCallback(
    async (params: FetchJobsParams, skipCache = false) => {
      setState("loading");
      setActiveFilter("all");
      setErrorMessage("");
      setLastParams(params);
      startTimer();
      try {
        const res = await fetchJobs(params, { skipCache });
        const normalised = res.jobs.map(normaliseJob);
        setJobs(normalised);
        setTotalJobs(res.total_jobs);
        setState("success");
        stopTimer();
        // Refresh cache status after fetch
        setCacheStatus(getJobsCacheStatus(params));
      } catch (err: unknown) {
        const e = err as { userMessage?: string };
        setErrorMessage(e.userMessage ?? "Failed to fetch jobs. Please try again.");
        setState("error");
        stopTimer();
      }
    },
    [startTimer, stopTimer]
  );

  const handleSearch = (params: FetchJobsParams) => {
    runSearch(params);
  };

  const handleClearCache = () => {
    clearCache();
    if (lastParams) runSearch(lastParams, true);
  };

  // Source counts for FilterBar
  const counts: Record<SourceFilter, number> = {
    all: jobs.length,
    linkedin: jobs.filter((j) => j?.source?.toLowerCase() === "linkedin").length,
    indeed: jobs.filter((j) => j?.source?.toLowerCase() === "indeed").length,
    google: jobs.filter((j) => j?.source?.toLowerCase() === "google").length,
  };

  const visibleJobs =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j?.source?.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Header
        totalJobs={state === "success" ? totalJobs : undefined}
        isCached={cacheStatus.cached}
        cacheExpiresIn={cacheStatus.expiresIn}
        onClearCache={handleClearCache}
      />

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Search form */}
        <SearchForm
          onSearch={handleSearch}
          loading={state === "loading"}
          elapsed={elapsed}
          timerState={timerState}
        />

        {/* Results area */}
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <p className="text-slate-300 font-semibold text-lg mb-2">Start your job search</p>
            <p className="text-slate-500 text-sm max-w-md">
              Add keywords to search LinkedIn &amp; Indeed, or a free-text query for Google Jobs.
              Results are cached for 10 minutes.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "💼", label: "LinkedIn", desc: "Professional network" },
                { icon: "🔍", label: "Indeed", desc: "World's #1 job site" },
                { icon: "🌐", label: "Google Jobs", desc: "Global job board" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-medium text-slate-300">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "loading" && (
          <section className="space-y-4">
            <div className="h-8 w-40 rounded-lg bg-slate-800/60 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}

        {state === "error" && (
          <ErrorState
            message={errorMessage}
            onRetry={() => lastParams && runSearch(lastParams, true)}
          />
        )}

        {state === "success" && (
          <section className="space-y-5">
            {/* Filter Bar + count */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <FilterBar
                active={activeFilter}
                counts={counts}
                onChange={setActiveFilter}
              />
              <p className="text-xs text-slate-500 shrink-0">
                Showing {visibleJobs.length} of {totalJobs} jobs
              </p>
            </div>

            {visibleJobs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800/60 mt-16 py-6 text-center text-xs text-slate-600">
        JobScraper &mdash; Results sourced from LinkedIn, Indeed &amp; Google Jobs
      </footer>
    </div>
  );
}
