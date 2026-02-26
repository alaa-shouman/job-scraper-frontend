import { useState, type KeyboardEvent } from "react";
import type { FetchJobsParams } from "../types/jobs.types";
import type { TimerState } from "../hooks/useTimer";

interface SearchFormProps {
    onSearch: (params: FetchJobsParams) => void;
    loading: boolean;
    elapsed?: number;       // milliseconds
    timerState?: TimerState;
}

export default function SearchForm({ onSearch, loading, elapsed = 0, timerState = "idle" }: SearchFormProps) {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [location, setLocation] = useState("Lebanon");
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    const addKeyword = () => {
        const trimmed = keywordInput.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords((prev) => [...prev, trimmed]);
        }
        setKeywordInput("");
    };

    const removeKeyword = (kw: string) => {
        setKeywords((prev) => prev.filter((k) => k !== kw));
    };

    const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        } else if (e.key === "Backspace" && !keywordInput && keywords.length) {
            setKeywords((prev) => prev.slice(0, -1));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!keywords.length && !query.trim()) {
            setError("Add at least one keyword or a Google Jobs query.");
            return;
        }
        onSearch({
            keywords: keywords.length ? keywords : undefined,
            location: keywords.length && location.trim() ? location.trim() : undefined,
            query: query.trim() || undefined,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md p-6 shadow-xl space-y-5"
        >
            {/* Keywords */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Keywords
                    <span className="ml-1.5 text-xs text-slate-500 font-normal">
                        (press Enter or comma to add)
                    </span>
                </label>
                <div className="flex flex-wrap gap-2 items-center rounded-xl bg-slate-900/60 border border-slate-700/60 focus-within:border-indigo-500/70 transition-colors px-3 py-2 min-h-11">
                    {keywords.map((kw) => (
                        <span
                            key={kw}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-medium px-2.5 py-1"
                        >
                            {kw}
                            <button
                                type="button"
                                onClick={() => removeKeyword(kw)}
                                className="ml-0.5 text-indigo-300/60 hover:text-indigo-200 transition-colors leading-none"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        className="flex-1 min-w-35 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                        placeholder={keywords.length ? "Add more…" : "e.g. frontend developer, react…"}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        onBlur={addKeyword}
                    />
                </div>
            </div>

            {/* Location + Google query – side by side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Location
                        <span className="ml-1.5 text-xs text-slate-500 font-normal">
                            (LinkedIn / Indeed)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Lebanon"
                        className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500/70 outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Google Jobs Query
                        <span className="ml-1.5 text-xs text-slate-500 font-normal">
                            (worldwide free-text)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. remote backend engineer node.js"
                        className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500/70 outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors"
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-semibold text-sm py-3 shadow-lg shadow-indigo-500/20 active:scale-[0.99]"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Scraping jobs…
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Search Jobs
                    </span>
                )}
            </button>

            {/* Request timer */}
            {timerState !== "idle" && (
                <div className="flex items-center justify-center gap-2">
                    {timerState === "running" ? (
                        <>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                                {(elapsed / 1000).toFixed(2)}s
                            </span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-mono text-emerald-400">
                                Completed in {(elapsed / 1000).toFixed(2)}s
                            </span>
                        </>
                    )}
                </div>
            )}
        </form>
    );
}
