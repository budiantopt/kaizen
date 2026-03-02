'use client'

import { useState } from 'react'
import { X, Trophy } from 'lucide-react'

type LeaderboardUser = {
    id: string
    name: string
    avatar: string | null | undefined
    points: number
    onTime: number
    late: number
    offTrack: number
}

export function LeaderboardModal({ data }: { data: LeaderboardUser[] }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-primary hover:underline"
            >
                See All
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Full Leaderboard
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {data.length > 0 ? (
                                data.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50 transition-colors hover:bg-secondary/50">
                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center font-bold text-sm text-muted-foreground">
                                            #{index + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold">{user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                                {user.onTime > 0 && <span className="text-green-500 font-medium" title="On Time (2 pts)">{user.onTime} On time</span>}
                                                {user.late > 0 && <span className="text-yellow-500 font-medium" title="Late (1 pt)">{user.late} Late</span>}
                                                {user.offTrack > 0 && <span className="text-red-500 font-medium" title="Off Track (-1 pt)">{user.offTrack} Off track</span>}
                                                {user.onTime === 0 && user.late === 0 && user.offTrack === 0 && <span>No activity</span>}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-xl font-bold text-primary">{user.points}</div>
                                            <div className="text-xs text-muted-foreground uppercase font-semibold">EXP</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    No activity for this period.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
