interface HeaderProps {
    totalJobs?: number;
    isCached?: boolean;
    cacheExpiresIn?: number;
    onClearCache?: () => void;
}

export default function Header({
    totalJobs,
    isCached,
    cacheExpiresIn,
    onClearCache,
}: HeaderProps) {
    const formatExpiry = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    return (
        <header className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-violet-950 to-slate-950" />
            {/* Decorative blobs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 right-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                JobScraper
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Search across LinkedIn, Indeed &amp; Google Jobs in one shot
                        </p>
                    </div>

                    {/* Cache / stats badge */}
                    {totalJobs !== undefined && (
                        <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                {totalJobs.toLocaleString()} jobs found
                            </span>
                            {isCached && cacheExpiresIn !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Cached · expires in {formatExpiry(cacheExpiresIn)}
                                    </span>
                                    {onClearCache && (
                                        <button
                                            onClick={onClearCache}
                                            className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
                                        >
                                            refresh
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
