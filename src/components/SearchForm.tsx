import { useState, type KeyboardEvent } from "react";
import type { FetchJobsParams, JobType, ExperienceLevel, SortBy } from "../types/jobs.types";
import type { TimerState } from "../hooks/useTimer";

interface SearchFormProps {
    onSearch: (params: FetchJobsParams) => void;
    loading: boolean;
    elapsed?: number;
    timerState?: TimerState;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
    { value: "fulltime", label: "Full-time" },
    { value: "parttime", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "temporary", label: "Temporary" },
    { value: "freelance", label: "Freelance" },
    { value: "perdiem", label: "Per Diem" },
    { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
    { value: "entry", label: "Entry" },
    { value: "junior", label: "Junior" },
    { value: "mid", label: "Mid" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "executive", label: "Executive" },
];

interface TagsInputProps {
    tags: string[];
    onAdd: () => void;
    onRemove: (tag: string) => void;
    placeholder: string;
    inputValue: string;
    onInputChange: (val: string) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

function TagsInput({ tags, onAdd, onRemove, placeholder, inputValue, onInputChange, onKeyDown }: TagsInputProps) {
    return (
        <div className="flex flex-wrap gap-2 items-center rounded-xl bg-bg border border-glacier focus-within:border-primary transition-colors px-3 py-2 min-h-10">
            {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-primary-tint border border-primary/30 text-primary text-xs font-medium px-2.5 py-1">
                    {tag}
                    <button type="button" onClick={() => onRemove(tag)} className="ml-0.5 text-ink-mid hover:text-primary transition-colors leading-none">×</button>
                </span>
            ))}
            <input
                className="flex-1 min-w-32 bg-transparent text-sm text-ink placeholder:text-ink-soft outline-none"
                placeholder={tags.length ? "Add more…" : placeholder}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onAdd}
            />
        </div>
    );
}

export default function SearchForm({ onSearch, loading, elapsed = 0, timerState = "idle" }: SearchFormProps) {
    // Main fields
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("Beirut");
    const [locationMode, setLocationMode] = useState<"exact" | "near">("exact");
    const [radius, setRadius] = useState<number | "">("");
    const [radiusUnit, setRadiusUnit] = useState<"miles" | "km">("miles");
    const [sites, setSites] = useState<("linkedin" | "indeed")[]>(["linkedin", "indeed"]);
    const [sortBy, setSortBy] = useState<SortBy>("relevance");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Keyword matching
    const [exactKeywords, setExactKeywords] = useState<string[]>([]);
    const [exactKeywordInput, setExactKeywordInput] = useState("");
    const [fuzzyKeywords, setFuzzyKeywords] = useState<string[]>([]);
    const [fuzzyKeywordInput, setFuzzyKeywordInput] = useState("");
    const [booleanQuery, setBooleanQuery] = useState("");

    // Filtering
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
    const [minSalary, setMinSalary] = useState<number | "">("");
    const [maxSalary, setMaxSalary] = useState<number | "">("");
    const [currency, setCurrency] = useState("USD");
    const [excludeCountries, setExcludeCountries] = useState<string[]>([]);
    const [excludeCountryInput, setExcludeCountryInput] = useState("");
    const [resultsWanted, setResultsWanted] = useState<number | "">(20);
    const [hoursOld, setHoursOld] = useState<number | "">("");
    const [limit, setLimit] = useState<number>(10);

    const [error, setError] = useState("");

    function makeTagHandlers(
        tags: string[],
        setTags: React.Dispatch<React.SetStateAction<string[]>>,
        input: string,
        setInput: React.Dispatch<React.SetStateAction<string>>,
    ) {
        const add = () => {
            const trimmed = input.trim();
            if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
            setInput("");
        };
        const remove = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));
        const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            else if (e.key === "Backspace" && !input && tags.length) setTags((prev) => prev.slice(0, -1));
        };
        return { add, remove, onKeyDown };
    }

    const exactKwHandlers = makeTagHandlers(exactKeywords, setExactKeywords, exactKeywordInput, setExactKeywordInput);
    const fuzzyKwHandlers = makeTagHandlers(fuzzyKeywords, setFuzzyKeywords, fuzzyKeywordInput, setFuzzyKeywordInput);
    const excludeCountriesHandlers = makeTagHandlers(excludeCountries, setExcludeCountries, excludeCountryInput, setExcludeCountryInput);

    const toggleJobType = (jt: JobType) =>
        setJobTypes((prev) => prev.includes(jt) ? prev.filter((t) => t !== jt) : [...prev, jt]);

    const toggleExperienceLevel = (el: ExperienceLevel) =>
        setExperienceLevels((prev) => prev.includes(el) ? prev.filter((l) => l !== el) : [...prev, el]);

    const toggleSite = (site: "linkedin" | "indeed") =>
        setSites((prev) => {
            if (prev.includes(site)) return prev.length === 1 ? prev : prev.filter((s) => s !== site);
            return [...prev, site];
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!query.trim() && !exactKeywords.length && !fuzzyKeywords.length) {
            setError("Enter a search query or add exact/fuzzy keywords.");
            return;
        }
        if (locationMode === "near" && !radius) {
            setError("Radius is required when using 'Near' location mode.");
            return;
        }

        const params: FetchJobsParams = {};
        if (query.trim()) params.query = query.trim();
        if (location.trim()) params.location = location.trim();
        if (sites.length < 2) params.sites = sites;
        if (sortBy !== "relevance") params.sortBy = sortBy;
        if (locationMode === "near") {
            params.locationMode = "near";
            params.radius = radius as number;
            params.radiusUnit = radiusUnit;
        }
        if (remoteOnly) params.remoteOnly = true;
        if (exactKeywords.length) params.exactKeywords = exactKeywords;
        if (fuzzyKeywords.length) params.fuzzyKeywords = fuzzyKeywords;
        if (booleanQuery.trim()) params.booleanQuery = booleanQuery.trim();
        if (jobTypes.length) params.jobTypes = jobTypes;
        if (experienceLevels.length) params.experienceLevels = experienceLevels;
        if (minSalary !== "") params.minSalary = minSalary as number;
        if (maxSalary !== "") params.maxSalary = maxSalary as number;
        if ((minSalary !== "" || maxSalary !== "") && currency) params.currency = currency;
        if (excludeCountries.length) params.excludeCountries = excludeCountries;
        if (resultsWanted !== "" && resultsWanted !== 20) params.resultsWanted = resultsWanted as number;
        if (hoursOld !== "") params.hoursOld = hoursOld as number;
        params.limit = limit;

        onSearch(params);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-glacier/50 bg-surface p-6 shadow-lg shadow-primary/5 space-y-5"
        >
            {/* Query */}
            <div>
                <label className="block text-sm font-medium text-ink mb-2">Search Query</label>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. frontend engineer, react developer…"
                    className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                />
            </div>

            {/* Location + Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-ink mb-2">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State or Country"
                        className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-ink mb-2">Location Mode</label>
                    <div className="flex gap-2">
                        {(["exact", "near"] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setLocationMode(mode)}
                                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${locationMode === mode ? "bg-primary border-primary text-white" : "bg-bg border-glacier text-ink-mid hover:border-primary/50"}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Radius (near mode only) */}
            {locationMode === "near" && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Radius</label>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            value={radius}
                            onChange={(e) => setRadius(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="e.g. 25"
                            className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Unit</label>
                        <select
                            value={radiusUnit}
                            onChange={(e) => setRadiusUnit(e.target.value as "miles" | "km")}
                            className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink transition-colors"
                        >
                            <option value="miles">Miles</option>
                            <option value="km">Kilometers</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Sources + Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-ink mb-2">Sources</label>
                    <div className="flex gap-2">
                        {(["linkedin", "indeed"] as const).map((site) => (
                            <button
                                key={site}
                                type="button"
                                onClick={() => toggleSite(site)}
                                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${sites.includes(site) ? "bg-primary border-primary text-white" : "bg-bg border-glacier text-ink-mid hover:border-primary/50"}`}
                            >
                                {site === "linkedin" ? "LinkedIn" : "Indeed"}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-ink mb-2">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink transition-colors"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="date">Date Posted</option>
                        <option value="salary">Salary</option>
                    </select>
                </div>
            </div>

            {/* Advanced toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-2 text-sm text-ink-mid hover:text-primary transition-colors"
            >
                <svg className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {showAdvanced ? "Hide advanced options" : "Show advanced options"}
            </button>

            {/* Advanced options */}
            {showAdvanced && (
                <div className="space-y-5 border-t border-glacier/40 pt-5">
                    {/* Exact Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Exact Keywords</label>
                        <p className="text-xs text-ink-mid mb-2">Every word must appear as a whole word in the job title or description.</p>
                        <TagsInput
                            tags={exactKeywords}
                            onAdd={exactKwHandlers.add}
                            onRemove={exactKwHandlers.remove}
                            placeholder="e.g. react, typescript…"
                            inputValue={exactKeywordInput}
                            onInputChange={setExactKeywordInput}
                            onKeyDown={exactKwHandlers.onKeyDown}
                        />
                    </div>

                    {/* Fuzzy Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Fuzzy Keywords</label>
                        <p className="text-xs text-ink-mid mb-2">Every keyword must appear as a substring anywhere in the job.</p>
                        <TagsInput
                            tags={fuzzyKeywords}
                            onAdd={fuzzyKwHandlers.add}
                            onRemove={fuzzyKwHandlers.remove}
                            placeholder="e.g. front-end, UI/UX…"
                            inputValue={fuzzyKeywordInput}
                            onInputChange={setFuzzyKeywordInput}
                            onKeyDown={fuzzyKwHandlers.onKeyDown}
                        />
                    </div>

                    {/* Boolean Query */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Boolean Query</label>
                        <p className="text-xs text-ink-mid mb-2">Supports AND, OR, NOT, parentheses, and quoted phrases. Operators must be uppercase.</p>
                        <input
                            type="text"
                            value={booleanQuery}
                            onChange={(e) => setBooleanQuery(e.target.value)}
                            placeholder='e.g. react AND (typescript OR javascript) NOT senior'
                            className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors font-mono"
                        />
                    </div>

                    {/* Job Types */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Job Types</label>
                        <div className="flex flex-wrap gap-2">
                            {JOB_TYPES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleJobType(value)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${jobTypes.includes(value) ? "bg-primary border-primary text-white" : "bg-bg border-glacier text-ink-mid hover:border-primary/50"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Experience Levels */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Experience Levels</label>
                        <div className="flex flex-wrap gap-2">
                            {EXPERIENCE_LEVELS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleExperienceLevel(value)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${experienceLevels.includes(value) ? "bg-primary border-primary text-white" : "bg-bg border-glacier text-ink-mid hover:border-primary/50"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Salary Range (Annual)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                min={0}
                                value={minSalary}
                                onChange={(e) => setMinSalary(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="Min"
                                className="rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                            />
                            <input
                                type="number"
                                min={0}
                                value={maxSalary}
                                onChange={(e) => setMaxSalary(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="Max"
                                className="rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                            />
                            <input
                                type="text"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                placeholder="USD"
                                maxLength={3}
                                className="rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors uppercase"
                            />
                        </div>
                    </div>

                    {/* Remote Only */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={remoteOnly}
                            onClick={() => setRemoteOnly((v) => !v)}
                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${remoteOnly ? "bg-primary" : "bg-glacier"}`}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${remoteOnly ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                        <span className="text-sm font-medium text-ink">Remote only</span>
                    </div>

                    {/* Exclude Countries */}
                    <div>
                        <label className="block text-sm font-medium text-ink mb-2">Exclude Countries</label>
                        <TagsInput
                            tags={excludeCountries}
                            onAdd={excludeCountriesHandlers.add}
                            onRemove={excludeCountriesHandlers.remove}
                            placeholder="e.g. india, pakistan…"
                            inputValue={excludeCountryInput}
                            onInputChange={setExcludeCountryInput}
                            onKeyDown={excludeCountriesHandlers.onKeyDown}
                        />
                    </div>

                    {/* Results, Recency, Per Page */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-2">Results Wanted</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={resultsWanted}
                                onChange={(e) => setResultsWanted(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink mb-2">Posted Within (hours)</label>
                            <input
                                type="number"
                                min={1}
                                value={hoursOld}
                                onChange={(e) => setHoursOld(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="Any time"
                                className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink mb-2">Per Page</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="w-full rounded-xl bg-bg border border-glacier focus:border-primary outline-none px-3.5 py-2.5 text-sm text-ink transition-colors"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

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
                className="w-full relative overflow-hidden rounded-xl bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-semibold text-sm py-3 shadow-lg shadow-accent/20 active:scale-[0.99]"
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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                            </span>
                            <span className="text-xs font-mono text-ink-mid">
                                {(elapsed / 1000).toFixed(2)}s
                            </span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-mono text-primary">
                                Completed in {(elapsed / 1000).toFixed(2)}s
                            </span>
                        </>
                    )}
                </div>
            )}
        </form>
    );
}

