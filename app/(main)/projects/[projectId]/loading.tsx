export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-9 w-24 bg-muted rounded-full" />
            </div>

            <div className="flex gap-4 border-b border-border pb-1">
                <div className="h-8 w-24 bg-muted rounded-md" />
                <div className="h-8 w-24 bg-muted rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-[400px] w-full bg-muted/20 rounded-xl border border-border/50" />
                <div className="h-[400px] w-full bg-muted/20 rounded-xl border border-border/50" />
                <div className="h-[400px] w-full bg-muted/20 rounded-xl border border-border/50" />
            </div>
        </div>
    )
}
