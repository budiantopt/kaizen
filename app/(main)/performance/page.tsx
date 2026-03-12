import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardModal } from '@/components/performance/LeaderboardModal'

export const dynamic = 'force-dynamic'

export default async function PerformancePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Determine Semester
    const now = new Date()
    const currentYear = now.getFullYear()
    const isFirstSem = now.getMonth() < 6 // Jan (0) to Jun (5)

    const semStart = `${currentYear}-${isFirstSem ? '01' : '07'}-01`
    const semEnd = `${currentYear}-${isFirstSem ? '06' : '12'}-${isFirstSem ? '30' : '31'}`
    const semesterLabel = isFirstSem ? `Semester 1 (${currentYear})` : `Semester 2 (${currentYear})`

    // Fetch Tasks Assigned in Semester
    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *,
            assignees:task_assignees!inner(user_id)
        `)
        .eq('assignees.user_id', user.id)
        .gte('end_date', semStart)
        .lte('end_date', semEnd)

    const totalTasks = tasks?.length || 0

    // Calculate On Time
    const completedOnTime = tasks?.filter((task: any) => {
        const isCompleted = task.status === 'done' || task.status === 'complete'
        // Fallback to updated_at for legacy tasks
        const completionDate = task.completed_at || task.updated_at

        if (!isCompleted || !completionDate || !task.end_date) return false

        const completedAt = new Date(completionDate)
        const dueDate = new Date(task.end_date)
        // Set due date to end of day to be fair
        dueDate.setHours(23, 59, 59, 999)

        return completedAt <= dueDate
    }).length || 0

    const score = totalTasks > 0 ? Math.round((completedOnTime / totalTasks) * 100) : 0



    const { data: kpis } = await supabase.from('kpis').select('*').eq('user_id', user.id)

    // --- Leaderboard (EXP) Logic ---
    // Fetch ALL tasks for the semester to calculate distribution
    const { data: teamTasks } = await supabase
        .from('tasks')
        .select(`
            id,
            status,
            end_date,
            completed_at,
            updated_at,
            assignees:task_assignees(user_id)
        `)
        .gte('end_date', semStart)
        .lte('end_date', semEnd)

    // Fetch profiles for names and avatars (exclude admins)
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url, role').neq('role', 'admin')

    // Aggregate EXP Points
    const userStats: Record<string, { points: number, onTime: number, late: number, offTrack: number }> = {}

    teamTasks?.forEach((task: any) => {
        let points = 0;
        let isOnTime = false;
        let isLate = false;
        let isOffTrack = false;

        const isCompleted = task.status === 'done' || task.status === 'complete';
        if (isCompleted) {
            const completionDate = task.completed_at || task.updated_at;
            if (completionDate && task.end_date) {
                const completedAt = new Date(completionDate);
                const dueDate = new Date(task.end_date);
                dueDate.setHours(23, 59, 59, 999);
                if (completedAt <= dueDate) {
                    isOnTime = true;
                    points = 2;
                } else {
                    isLate = true;
                    points = 1;
                }
            } else {
                isLate = true;
                points = 1;
            }
        } else if (task.status === 'off_track') {
            isOffTrack = true;
            points = -1;
        }

        if (points !== 0) {
            if (task.assignees && task.assignees.length > 0) {
                task.assignees.forEach((a: any) => {
                    const uid = a.user_id;
                    if (!userStats[uid]) {
                        userStats[uid] = { points: 0, onTime: 0, late: 0, offTrack: 0 };
                    }
                    userStats[uid].points += points;
                    if (isOnTime) userStats[uid].onTime += 1;
                    if (isLate) userStats[uid].late += 1;
                    if (isOffTrack) userStats[uid].offTrack += 1;
                });
            }
        }
    })

    const leaderboardData = Object.entries(userStats)
        .filter(([uid]) => profiles?.some(p => p.id === uid))
        .map(([uid, stats]) => {
            const profile = profiles?.find(p => p.id === uid)
            return {
                id: uid,
                name: profile?.full_name || 'Unknown',
                avatar: profile?.avatar_url,
                ...stats
            }
        }).sort((a, b) => b.points - a.points)
    const topThreeLeaderboard = leaderboardData.slice(0, 3)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
                    <p className="text-muted-foreground mt-2">Track your semester goals and KPIs.</p>
                </div>
                <div className="px-4 py-1 bg-secondary rounded-full text-xs font-medium border border-border">
                    {semesterLabel}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Section: Score & Leaderboard */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                    {/* Score Card */}
                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                        <h2 className="text-lg font-medium text-muted-foreground mb-4">Performance Score</h2>
                        <div className="relative flex items-center justify-center">
                            <div className={`text-6xl font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {score}
                            </div>
                            <span className="text-xl text-muted-foreground ml-1">%</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            {completedOnTime} of {totalTasks} tasks completed on time
                        </p>
                    </div>

                    {/* Top 5 Leaderboard Chart */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h2 className="text-lg font-semibold flex items-center gap-2">Leaderboard <LeaderboardModal data={leaderboardData} /></h2>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">EXP Points</span>
                        </div>
                        <div className="w-full flex-1 min-h-[250px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {topThreeLeaderboard.length > 0 ? (
                                topThreeLeaderboard.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50 transition-colors hover:bg-secondary/50">
                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center font-bold text-sm text-muted-foreground">
                                            #{index + 1}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold">{user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground mt-1">
                                                {user.onTime > 0 && <span className="text-green-500 font-medium" title="On Time (2 pts)">{user.onTime} On time</span>}
                                                {user.late > 0 && <span className="text-yellow-500 font-medium" title="Late (1 pt)">{user.late} Late</span>}
                                                {user.offTrack > 0 && <span className="text-red-500 font-medium" title="Off Track (-1 pt)">{user.offTrack} Off track</span>}
                                                {user.onTime === 0 && user.late === 0 && user.offTrack === 0 && <span>No activity</span>}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-lg font-bold text-primary">{user.points}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-semibold">EXP</div>
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

                {/* Right Section: KPI */}
                <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col min-h-[400px]">
                    <h2 className="text-lg font-semibold mb-4 shrink-0">Current Semester Goals</h2>
                    {kpis && kpis.length > 0 ? (
                        <ul className="space-y-3 flex-1">
                            {kpis.map((kpi: any) => (
                                <li key={kpi.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${kpi.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground bg-background'}`}>
                                        {kpi.is_completed && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm truncate ${kpi.is_completed ? 'text-green-600' : 'text-foreground'}`}>{kpi.description}</p>
                                    </div>
                                    {kpi.target_metric && (
                                        <span className="text-xs px-2 py-1 bg-background rounded border border-border text-muted-foreground shrink-0">{kpi.target_metric}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-lg border border-dashed border-border flex-1 flex items-center justify-center">
                            No KPIs set for this semester.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
