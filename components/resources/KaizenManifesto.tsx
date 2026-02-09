
import { BookOpen, RefreshCw, Zap, ShieldCheck, Users, Target } from 'lucide-react'

export function KaizenManifesto() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">The Kaizen Philosophy</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    Kaizen (Japanese for "change for the better") is a philosophy centered on the idea that small, incremental, and daily improvements lead to significant long-term results. Rooted in the Toyota Production System, it empowers every employee to identify waste and suggest improvements.
                </p>

                <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                    <Target className="w-4 h-4" /> Core Principles
                </h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                        <span className="font-medium text-foreground min-w-[140px]">Empower People:</span>
                        <span className="text-muted-foreground">Everyone is responsible for improvements.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-medium text-foreground min-w-[140px]">Incremental Changes:</span>
                        <span className="text-muted-foreground">Focus on small, manageable adjustments.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-medium text-foreground min-w-[140px]">Eliminate Waste:</span>
                        <span className="text-muted-foreground">Remove activities that add no value (Muda).</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-medium text-foreground min-w-[140px]">Go to Gemba:</span>
                        <span className="text-muted-foreground">Visit the "actual place" where work happens.</span>
                    </li>
                </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Key Frameworks</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                            <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                                <RefreshCw className="w-3 h-3" /> PDCA Cycle
                            </h4>
                            <p className="text-xs text-muted-foreground">Plan, Do, Check, Act. An iterative process for refining improvements.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                            <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                                <Zap className="w-3 h-3" /> 5S Framework
                            </h4>
                            <p className="text-xs text-muted-foreground">Sort, Set in Order, Shine, Standardize, Sustain. Organize for efficiency.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                            <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                                <Users className="w-3 h-3" /> Kaizen Events
                            </h4>
                            <p className="text-xs text-muted-foreground">Short-term intensives (Blitz) to improve specific areas rapidly.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                            <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-3 h-3" /> 5 Whys
                            </h4>
                            <p className="text-xs text-muted-foreground">Ask "Why?" five times to find the root cause of issues.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic text-center">
                        "Constant refinement leads to fewer defects, higher quality, and improved morale."
                    </p>
                </div>
            </div>
        </div>
    )
}
