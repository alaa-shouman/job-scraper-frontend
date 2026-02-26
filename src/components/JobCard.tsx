import { useState } from "react";
import type { NormalisedJob, JobSource } from "../types/jobs.types";

interface JobCardProps {
    job: NormalisedJob;
}

const SOURCE_CONFIG: Record<
    string,
    { label: string; color: string; bg: string; dot: string }
> = {
    linkedin: {
        label: "LinkedIn",
        color: "text-sky-700",
        bg: "bg-sky-50 border-sky-200",
        dot: "bg-sky-500",
    },
    indeed: {
        label: "Indeed",
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        dot: "bg-blue-500",
    },
    google: {
        label: "Google Jobs",
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
        dot: "bg-emerald-500",
    },
};

function getSourceConfig(source: JobSource) {
    return (
        SOURCE_CONFIG[source.toLowerCase()] || {
            label: source,
            color: "text-ink-mid",
            bg: "bg-surface-alt border-glacier/50",
            dot: "bg-ink-soft",
        }
    );
}

function formatDate(dateStr?: string): string | null {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    } catch {
        return dateStr;
    }
}

export default function JobCard({ job }: JobCardProps) {
    const [expanded, setExpanded] = useState(false);
    const src = getSourceConfig(job.source);
    const dateLabel = formatDate(job.datePosted);

    const initials = job.company
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const descWords = job.description.split(" ");
    const isLong = descWords.length > 60;
    const shortDesc = isLong
        ? descWords.slice(0, 60).join(" ") + "…"
        : job.description;

    return (
        <article className="group relative flex flex-col rounded-2xl bg-surface border border-glacier/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Header row */}
                <div className="flex items-start gap-3">
                    {/* Company avatar */}
                    <div className="shrink-0">
                        {job.companyLogo ? (
                            <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="w-11 h-11 rounded-xl object-contain bg-bg border border-glacier/50 p-1"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary-tint to-glacier/30 border border-glacier flex items-center justify-center text-xs font-bold text-primary">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Title + company */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-ink text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-ink-mid text-sm mt-0.5 truncate">{job.company}</p>
                    </div>

                    {/* Source badge */}
                    <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${src.bg} ${src.color}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${src.dot}`} />
                        {src.label}
                    </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-mid">
                    {/* Location */}
                    {job.location && (
                        <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {job.location}
                        </span>
                    )}

                    {/* Remote badge */}
                    {job.isRemote && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            Remote
                        </span>
                    )}

                    {/* Job type */}
                    {job.jobType && (
                        <span className="inline-flex items-center rounded-md bg-primary-tint border border-glacier text-primary px-2 py-0.5 font-medium capitalize">
                            {job.jobType.replace(/_/g, " ")}
                        </span>
                    )}

                    {/* Date */}
                    {dateLabel && (
                        <span className="ml-auto text-ink-soft">{dateLabel}</span>
                    )}
                </div>

                {/* Salary */}
                {job.salary && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                    </div>
                )}

                {/* Description */}
                {job.description && (
                    <div className="text-sm text-ink-mid leading-relaxed">
                        <p>{expanded ? job.description : shortDesc}</p>
                        {isLong && (
                            <button
                                onClick={() => setExpanded((v) => !v)}
                                className="mt-1 text-primary hover:text-primary-dim text-xs font-medium transition-colors"
                            >
                                {expanded ? "Show less ↑" : "Show more ↓"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-accent hover:bg-accent-dim text-white text-sm font-medium py-2.5 transition-all duration-200"
                >
                    View Job
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
            </div>
        </article>
    );
}
