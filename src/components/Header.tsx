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
        <header className="relative overflow-hidden bg-primary">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-8 w-56 h-56 bg-glacier/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 border border-white/20 shadow-lg">
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
                        <p className="text-glacier text-sm opacity-90">
                            Search across LinkedIn, Indeed &amp; Google Jobs in one shot
                        </p>
                    </div>

                    {/* Cache / stats badge */}
                    {totalJobs !== undefined && (
                        <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-glacier animate-pulse" />
                                {totalJobs.toLocaleString()} jobs found
                            </span>
                            {isCached && cacheExpiresIn !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-glacier/40 px-3 py-1 text-xs font-medium text-glacier">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Cached · expires in {formatExpiry(cacheExpiresIn)}
                                    </span>
                                    {onClearCache && (
                                        <button
                                            onClick={onClearCache}
                                            className="text-xs text-white/60 hover:text-white transition-colors underline underline-offset-2"
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
