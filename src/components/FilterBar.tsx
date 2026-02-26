import type { SourceFilter } from "../types/jobs.types";

interface FilterBarProps {
    active: SourceFilter;
    counts: Record<SourceFilter, number>;
    onChange: (filter: SourceFilter) => void;
}

const FILTERS: { key: SourceFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "indeed", label: "Indeed" },
    { key: "google", label: "Google Jobs" },
];

export default function FilterBar({ active, counts, onChange }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map(({ key, label }) => {
                const count = counts[key];
                if (key !== "all" && count === 0) return null;
                const isActive = active === key;
                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${isActive
                            ? "bg-primary border-primary text-white"
                            : "bg-surface border-glacier/50 text-ink-mid hover:text-ink hover:border-primary/50"
                            }`}
                    >
                        {label}
                        <span
                            className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${isActive
                                ? "bg-white/20 text-white"
                                : "bg-primary-tint text-ink-mid"
                                }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
