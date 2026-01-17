import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Tasks with Joined Projects AND Assignees
    const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select(`
            *,
            project:projects(*),
            assignees:task_assignees(
                user_id,
                profile:profiles(*)
            )
        `)
        .order('end_date', { ascending: true })

    // Fetch Projects (for the modal)
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')

    // Fetch Profiles (for assignee dropdown)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

    if (taskError) {
        console.error("Task Error", taskError)
    }

    // Transformation for the frontend type
    // The query returns assignees as [{ user_id: '...', profile: {...} }]
    // We want to flatten it to Profile[] on the task object
    const formattedTasks = tasks
        ?.filter((t: any) => t.project?.status !== 'archived')
        .map((t: any) => ({
            ...t,
            assignees: t.assignees?.map((a: any) => a.profile) || []
        }))

    const currentUserProfile = profiles?.find((p: any) => p.id === user?.id)

    return (
        <DashboardClient
            tasks={formattedTasks || []}
            projects={projects || []}
            profiles={profiles || []}
            hideProjectFilters={false}
            title="Team Tasks"
            currentUserId={user?.id}
            currentUserRole={currentUserProfile?.role}
        />
    )
}
