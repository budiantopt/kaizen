import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssigneePieChart } from '@/components/performance/AssigneePieChart'

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

    // --- Team Contribution Logic ---
    // Fetch ALL tasks for the semester to calculate distribution
    const { data: teamTasks } = await supabase
        .from('tasks')
        .select(`
            id,
            assignees:task_assignees(user_id)
        `)
        .gte('end_date', semStart)
        .lte('end_date', semEnd)
        .in('status', ['done', 'complete'])

    // Fetch profiles for names
    const { data: profiles } = await supabase.from('profiles').select('id, full_name')

    // Aggregate
    const assigneeCounts: Record<string, number> = {}

    teamTasks?.forEach((task: any) => {
        if (task.assignees && task.assignees.length > 0) {
            task.assignees.forEach((a: any) => {
                const uid = a.user_id
                assigneeCounts[uid] = (assigneeCounts[uid] || 0) + 1
            })
        } else {
            // Unassigned
            assigneeCounts['unassigned'] = (assigneeCounts['unassigned'] || 0) + 1
        }
    })

    const chartData = Object.entries(assigneeCounts).map(([uid, count]) => {
        if (uid === 'unassigned') return { name: 'Unassigned', value: count, color: '#94a3b8' }
        const profile = profiles?.find(p => p.id === uid)
        return {
            name: profile?.full_name || 'Unknown',
            value: count,
            color: '#000' // Will be assigned in component
        }
    }).sort((a, b) => b.value - a.value) // Sort by count desc


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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left Column: Score + Chart */}
                <div className="space-y-6">
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

                    {/* Team Contribution Chart */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Completed Tasks</h2>
                        <div className="w-full h-[250px]">
                            <AssigneePieChart data={chartData} />
                        </div>
                    </div>
                </div>

                {/* KPI Section - Right Column */}
                <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Current Semester Goals</h2>
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
