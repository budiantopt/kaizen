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

    // Fetch Tasks with Projects (removed deep join causing errors)
    const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select(`
            *,
            project:projects(*)
        `)
        .order('end_date', { ascending: true })

    // Fetch Task Assignees separately
    const { data: taskAssignees } = await supabase
        .from('task_assignees')
        .select('task_id, user_id')

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
        console.error("Task Error", JSON.stringify(taskError, null, 2))
    }

    // Transformation for the frontend type
    const formattedTasks = tasks
        ?.filter((t: any) => t.project?.status !== 'archived')
        .map((t: any) => {
            // Find assignees for this task
            const currentAssignees = taskAssignees?.filter((ta: any) => ta.task_id === t.id) || []
            // Map to profiles
            const assigneeProfiles = currentAssignees.map((ta: any) =>
                profiles?.find((p: any) => p.id === ta.user_id)
            ).filter(Boolean) // Remove nulls

            return {
                ...t,
                assignees: assigneeProfiles
            }
        })

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
