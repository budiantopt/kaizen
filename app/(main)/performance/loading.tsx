export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <div className="h-8 w-48 bg-muted rounded-md mb-2" />
                <div className="h-4 w-64 bg-muted rounded-md" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="h-6 w-48 bg-muted rounded-md" />
                <div className="space-y-3">
                    <div className="h-12 w-full bg-muted/50 rounded-lg" />
                    <div className="h-12 w-full bg-muted/50 rounded-lg" />
                    <div className="h-12 w-full bg-muted/50 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
