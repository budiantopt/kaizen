
import { createClient } from '@/lib/supabase/server'
import { KanbanView } from '@/components/dashboard/KanbanView'
import { redirect } from 'next/navigation'
import { Task } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminKanbanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify Admin Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard') // Or some unauthorized page
    }

    // Fetch ALL tasks for admin kanban
    // Using explicit foreign key for assignee
    // We assume 'tasks.assignee_id' -> 'profiles.id'
    // If multiple FKs exists, you need the constraint name: `assignee:profiles!tasks_assignee_id_fkey(*)`
    // Let's try flexible join first.
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:profiles!tasks_assignee_id_fkey(*),
            project:projects(*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin kanban tasks:', error)
    }

    // Fetch profiles for assignment if needed (passed to KanbanView usually?)
    // KanbanView might need active users for re-assignment drop-downs if implemented.
    // For now, let's just pass tasks.

    // Also fetch all active users
    const { data: activeUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('full_name')


    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col -mt-4 pl-4">
            <div className="mb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight">Gemba</h1>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">Go and See</span>
                </div>
            </div>

            <div className="flex-1 bg-background/50 border border-border rounded-xl relative">

                <KanbanView
                    tasks={(tasks as Task[]) || []}
                    currentUserId={profile?.id}
                    enablePolling={true}
                    readOnly={true}
                />
            </div>
        </div>
    )
}
