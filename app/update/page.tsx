import { createAdminClient } from '@/lib/supabase/admin'
import UpdateClient from '@/components/update/UpdateClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Proposal Development Updates | Public Access',
    description: 'Track the status of ongoing and completed proposal development tasks.',
}

export default async function UpdatePage() {
    const supabase = createAdminClient()

    // 1. Fetch the project named "Proposal Development"
    const { data: project } = await supabase
        .from('projects')
        .select('id, name')
        .ilike('name', 'Proposal Development')
        .single()

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black text-white font-sans selection:bg-blue-500/30">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <span className="text-xl font-black text-neutral-500">KP</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter">Project Not Identified</h1>
                <p className="text-neutral-500 max-w-sm text-lg leading-relaxed">
                    The <span className="text-white font-bold opacity-80">"Proposal Development"</span> project container is missing from the system.
                </p>
                <div className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">
                    Kaizen Management System
                </div>
            </div>
        )
    }

    // 2. Fetch all tasks for this project
    const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })

    // 3. Fetch task assignees mapping
    const { data: taskAssignees } = await supabase
        .from('task_assignees')
        .select('task_id, user_id')

    // 4. Fetch all profiles for mapping names
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')

    if (taskError) {
        console.error("Task Fetch Error:", JSON.stringify(taskError, null, 2))
    }

    // 5. Format tasks with their assignees
    const formattedTasks = (tasks || []).map((t: any) => {
        // Find assignees for this task
        const taskAssigneeRecords = taskAssignees?.filter((ta: any) => ta.task_id === t.id) || []
        // Map to profile objects
        let assigneeProfiles = taskAssigneeRecords.map((ta: any) =>
            profiles?.find((p: any) => p.id === ta.user_id)
        ).filter(Boolean)

        // Fallback: If no junction records, use legacy single assignee_id if present
        if (assigneeProfiles.length === 0 && t.assignee_id) {
            const legacyProfile = profiles?.find((p: any) => p.id === t.assignee_id)
            if (legacyProfile) assigneeProfiles = [legacyProfile]
        }

        return {
            ...t,
            assignees: assigneeProfiles,
            project: project
        }
    })

    return (
        <UpdateClient tasks={formattedTasks} />
    )
}
