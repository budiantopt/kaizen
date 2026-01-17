export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded-md" />
                    <div className="h-4 w-64 bg-muted rounded-md" />
                </div>
                <div className="h-10 w-32 bg-muted rounded-full" />
            </div>

            <div className="flex gap-2 pb-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-24 bg-muted rounded-full bg-muted/50" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[400px] w-full bg-muted/20 rounded-xl border border-border/50" />
                ))}
            </div>
        </div>
    )
}
