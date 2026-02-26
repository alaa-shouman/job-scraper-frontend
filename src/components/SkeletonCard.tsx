export default function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 p-5 space-y-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
                <div className="w-20 h-6 bg-slate-800 rounded-full" />
            </div>
            <div className="flex gap-2">
                <div className="h-3 bg-slate-800 rounded w-28" />
                <div className="h-3 bg-slate-800 rounded w-16" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 bg-slate-800 rounded" />
                <div className="h-3 bg-slate-800 rounded" />
                <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>
            <div className="h-9 bg-slate-800 rounded-xl" />
        </div>
    );
}
