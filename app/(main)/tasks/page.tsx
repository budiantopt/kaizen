import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
    const supabase = await createClient()

    // Fetch all tasks with joined data
    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *, 
            project:projects(*),
            assignees:task_assignees(
                user_id,
                profile:profiles(*)
            )
        `)
        .order('created_at', { ascending: false })

    const { data: rawProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')

    const projects = rawProjects?.map(p => {
        if (p.icon && p.icon.startsWith('pinned-')) {
            return { ...p, status: 'pinned', icon: p.icon.replace('pinned-', '') }
        }
        return p
    })

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Transform for frontend and filter out archived projects
    const formattedTasks = tasks
        ?.filter((t: any) => t.project?.status !== 'archived')
        .map((t: any) => ({
            ...t,
            assignees: t.assignees?.map((a: any) => a.profile) || []
        }))

    // Filter for My Tasks (assigned to current user)
    const myTasks = formattedTasks?.filter((t: any) =>
        t.assignees.some((a: any) => a.id === user?.id)
    )

    const currentUserProfile = profiles?.find((p: any) => p.id === user?.id)

    return (
        <DashboardClient
            tasks={myTasks || []}
            projects={projects || []}
            profiles={profiles || []}
            hideProjectFilters={true}
            title="My Tasks"
            currentUserId={user?.id}
            currentUserRole={currentUserProfile?.role}
        />
    )
}
