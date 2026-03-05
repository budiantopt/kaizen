import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function WorkloadOverviewPage(props: { searchParams?: Promise<{ filter?: string }> }) {
    const searchParams = props.searchParams ? await props.searchParams : {}
    const dateFilter = searchParams.filter || 'all'

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
            </div>
        )
    }

    // Fetch all tasks with joined data
    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            id, title, status, end_date, created_at, updated_at,
            project:projects(id, name, color_code, status, icon, project_value),
            assignees:task_assignees(
                user_id,
                profile:profiles(id, full_name, avatar_url, job_title)
            )
        `)
        .order('created_at', { ascending: false })

    const formattedTasks = tasks
        ?.filter((t: any) => {
            let pStatus = t.project?.status
            if (t.project?.icon && t.project.icon.startsWith('pinned-')) {
                pStatus = 'pinned'
            }
            return pStatus !== 'archived'
        })
        .map((t: any) => {
            let p = t.project
            if (p && p.icon && p.icon.startsWith('pinned-')) {
                p = { ...p, status: 'pinned', icon: p.icon.replace('pinned-', '') }
            }
            return {
                ...t,
                project: p,
                assignees: t.assignees?.map((a: any) => a.profile) || [],
            }
        }) || []

    const workloadByAssignee = new Map<
        string,
        {
            profile: any
            projects: Map<
                string,
                {
                    project: any
                    incomplete: number
                    completed: number
                    overdue: number
                }
            >
        }
    >()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const filteredByDateTasks = formattedTasks.filter((t: any) => {
        if (dateFilter === 'all') return true

        const createdDate = new Date(t.created_at || 0)
        const updatedDate = t.updated_at ? new Date(t.updated_at) : createdDate

        if (dateFilter === 'today') {
            return createdDate >= today || updatedDate >= today
        }
        if (dateFilter === 'yesterday') {
            return (createdDate >= yesterday && createdDate < today) || (updatedDate >= yesterday && updatedDate < today)
        }
        if (dateFilter === '7days') {
            return createdDate >= sevenDaysAgo || updatedDate >= sevenDaysAgo
        }
        if (dateFilter === '30days') {
            return createdDate >= thirtyDaysAgo || updatedDate >= thirtyDaysAgo
        }
        return true
    })

    filteredByDateTasks.forEach((task: any) => {
        const isCompleted = task.status === 'done'
        const isOverdue = !isCompleted && new Date(task.end_date) < now
        const isIncomplete = !isCompleted

        task.assignees.forEach((assigneeProfile: any) => {
            if (!assigneeProfile) return

            if (!workloadByAssignee.has(assigneeProfile.id)) {
                workloadByAssignee.set(assigneeProfile.id, {
                    profile: assigneeProfile,
                    projects: new Map(),
                })
            }

            const userObj = workloadByAssignee.get(assigneeProfile.id)!
            const project = task.project
            if (!project) return

            if (!userObj.projects.has(project.id)) {
                userObj.projects.set(project.id, {
                    project,
                    incomplete: 0,
                    completed: 0,
                    overdue: 0,
                })
            }

            const projStats = userObj.projects.get(project.id)!
            if (isCompleted) projStats.completed++
            if (isIncomplete) projStats.incomplete++
            if (isOverdue) projStats.overdue++
        })
    })

    const assigneesList = Array.from(workloadByAssignee.values()).sort((a, b) => {
        const nameA = a.profile.full_name || ''
        const nameB = b.profile.full_name || ''
        return nameA.localeCompare(nameB)
    })

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workload Overview</h1>
                    <p className="text-muted-foreground mt-2">View active task counts per assignee grouped by project.</p>
                </div>
                <div className="flex bg-secondary/50 p-1 rounded-lg border border-border items-center flex-wrap gap-1">
                    <Link href="?filter=all" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>All Time</Link>
                    <Link href="?filter=today" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === 'today' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>Today</Link>
                    <Link href="?filter=yesterday" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === 'yesterday' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>Yesterday</Link>
                    <Link href="?filter=7days" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === '7days' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>Last 7 Days</Link>
                    <Link href="?filter=30days" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateFilter === '30days' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>Last 30 Days</Link>
                </div>
            </div>

            {assigneesList.length === 0 ? (
                <div className="text-center p-8 bg-card rounded-xl border border-border shadow-sm">
                    <p className="text-muted-foreground">No assigned tasks found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {assigneesList.map((assignee) => {
                        const projectsList = Array.from(assignee.projects.values()).sort((a, b) =>
                            a.project.name.localeCompare(b.project.name)
                        )

                        const totalIncomplete = projectsList.reduce((acc, curr) => acc + curr.incomplete, 0)
                        const totalOverdue = projectsList.reduce((acc, curr) => acc + curr.overdue, 0)
                        const totalCompleted = projectsList.reduce((acc, curr) => acc + curr.completed, 0)

                        const initial = getInitials(assignee.profile.full_name)

                        return (
                            <div
                                key={assignee.profile.id}
                                className="bg-card border border-border flex flex-col rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Header */}
                                <div className="p-4 bg-secondary/30 border-b border-border flex items-center gap-4">
                                    {assignee.profile.avatar_url ? (
                                        <img
                                            src={assignee.profile.avatar_url}
                                            alt={assignee.profile.full_name}
                                            className="w-12 h-12 rounded-full object-cover shadow-sm bg-background border border-border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border border-neutral-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                            {initial}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg text-foreground truncate">
                                            {assignee.profile.full_name || 'Unknown User'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {assignee.profile.job_title || 'Member'}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400" title="Total Deal Value Attribution">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                                                Array.from(assignee.projects.values()).reduce((sum, p) => sum + (p.project.project_value || 0), 0)
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-right">
                                        <div className="flex flex-col items-center p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            <span className="font-bold text-sm leading-none">{totalIncomplete}</span>
                                            <span className="text-[10px] uppercase font-semibold">Active</span>
                                        </div>
                                        <div className="flex flex-col items-center p-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                            <span className="font-bold text-sm leading-none">{totalOverdue}</span>
                                            <span className="text-[10px] uppercase font-semibold">Overdue</span>
                                        </div>
                                        <div className="flex flex-col items-center p-1.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                            <span className="font-bold text-sm leading-none">{totalCompleted}</span>
                                            <span className="text-[10px] uppercase font-semibold">Done</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[320px] scrollbar-hide">
                                    {projectsList.map((projectStats) => {
                                        const projColor = projectStats.project.color_code || '#000000'
                                        return (
                                            <Link
                                                href={`/projects/${projectStats.project.id}`}
                                                key={projectStats.project.id}
                                                className="flex flex-row items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 gap-4 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 shrink">
                                                    <div
                                                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                                        style={{ backgroundColor: projColor }}
                                                    />
                                                    <span className="font-medium text-sm text-foreground truncate">
                                                        {projectStats.project.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0 text-xs font-mono font-medium">
                                                    <div className="flex items-center gap-1.5 min-w-[3.5rem] text-amber-600 dark:text-amber-400" title="Incomplete">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        {projectStats.incomplete}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 min-w-[3.5rem] text-red-600 dark:text-red-400" title="Overdue">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                        {projectStats.overdue}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 min-w-[3.5rem] text-green-600 dark:text-green-400" title="Completed">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        {projectStats.completed}
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
