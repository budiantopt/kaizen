import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/projects/ProjectDetailClient'

export const dynamic = 'force-dynamic'

type Params = Promise<{ projectId: string }>

export default async function ProjectDetailPage(props: { params: Params }) {
    const params = await props.params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const projectId = parseInt(params.projectId)

    // Fetch Project Details
    const { data: project } = await supabase
        .from('projects')
        .select('*, creator:profiles(full_name)')
        .eq('id', projectId)
        .single()

    if (!project) {
        notFound()
    }

    // Fetch Tasks for this Project
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
        .eq('project_id', projectId)
        .order('end_date', { ascending: true })

    // Fetch All Projects (for moving tasks or creating new ones)
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')

    // Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

    const formattedTasks = tasks?.map((t: any) => ({
        ...t,
        assignees: t.assignees?.map((a: any) => a.profile) || []
    }))

    return (
        <div>
            <ProjectDetailClient
                project={project}
                tasks={formattedTasks || []}
                projects={projects || []}
                profiles={profiles || []}
                currentUserId={user.id}
            />
        </div>
    )
}
