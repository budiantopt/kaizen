'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ... existing taskSchema ...
const taskSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1),
    project_id: z.coerce.number(),
    status: z.string(),
    priority: z.string().optional(),
    start_date: z.string(),
    end_date: z.string(),
    assignee_ids: z.array(z.string()).optional(),
    remarks: z.string().optional(),
    evidence_link: z.string().optional()
})

// NEW: Fetch all tasks for admin kanban (live polling)
export async function fetchGlobalTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Ensure admin? Or just let RLS handle it?
    // RLS should handle it. If admin policy is set, they see all.

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:profiles!tasks_assignee_id_fkey(*),
            project:projects(*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching global tasks:', error)
        return []
    }
    return tasks
}

export async function upsertTask(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const assigneeIds = formData.getAll('assignee_ids') as string[]

    const rawData = {
        id: formData.get('id'),
        title: formData.get('title'),
        project_id: formData.get('project_id'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        assignee_ids: assigneeIds,
        remarks: formData.get('remarks'),
        evidence_link: formData.get('evidence_link')
    }

    const validatedFields = taskSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { id, title, project_id, status, priority, start_date, end_date, remarks, evidence_link } = validatedFields.data

    let taskId = id

    if (taskId) {
        // PERMISSION CHECK
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const isAdmin = profile?.role === 'admin'

        if (!isAdmin) {
            const { data: assigneeCheck } = await supabase
                .from('task_assignees')
                .select('user_id')
                .eq('task_id', taskId)
                .eq('user_id', user.id)
                .single()

            if (!assigneeCheck) {
                return { message: 'Unauthorized: Only Admins or Assignees can edit this task.' }
            }
        }

        // UPDATE
        const { error: updateError } = await supabase
            .from('tasks')
            .update({
                title,
                project_id,
                status,
                priority,
                start_date,
                end_date,
                remarks,
                evidence_link: evidence_link || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)

        if (updateError) return { message: 'Failed to update task: ' + updateError.message }

    } else {
        // INSERT
        const { data: newTask, error: insertError } = await supabase
            .from('tasks')
            .insert({
                title,
                project_id,
                status,
                priority: priority || 'medium',
                start_date,
                end_date,
                remarks,
                evidence_link: evidence_link || null,
                assignee_id: assigneeIds.length > 0 ? assigneeIds[0] : user.id,
                completed_at: (status === 'done' || status === 'complete') ? new Date().toISOString() : null
            })
            .select()
            .single()

        if (insertError) return { message: 'Failed to create task: ' + insertError.message }
        taskId = newTask.id
    }

    if (taskId) {
        const { error: deleteError } = await supabase
            .from('task_assignees')
            .delete()
            .eq('task_id', taskId)

        if (deleteError) console.error('Error clearing assignees', deleteError)

        if (assigneeIds.length > 0) {
            const assigneeRows = assigneeIds.map(uid => ({
                task_id: taskId,
                user_id: uid
            }))
            const { error: assignError } = await supabase
                .from('task_assignees')
                .insert(assigneeRows)

            if (assignError) console.error('Error adding assignees', assignError)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/kanban') // Ensure polling sees latest immediately?
    return { message: taskId ? 'Task Updated' : 'Task Created', success: true }
}

export async function toggleTaskStatus(taskId: number, currentStatus: string) {
    const supabase = await createClient()
    const isDone = currentStatus === 'done' || currentStatus === 'complete'
    const newStatus = isDone ? 'todo' : 'complete'
    const now = new Date().toISOString()

    const { error } = await supabase
        .from('tasks')
        .update({
            status: newStatus,
            updated_at: now,
            completed_at: newStatus === 'complete' ? now : null
        })
        .eq('id', taskId)

    if (error) throw new Error('Failed to update task')
    revalidatePath('/dashboard')
    revalidatePath('/admin/kanban')
}

export async function updateTaskStatus(taskId: number, newStatus: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // If moving to done/complete, set completed_at. If moving away, clear it.
    const isCompleted = newStatus === 'done' || newStatus === 'complete'

    const { data, error } = await supabase
        .from('tasks')
        .update({
            status: newStatus,
            updated_at: now,
            completed_at: isCompleted ? now : null
        })
        .eq('id', taskId)
        .select()
        .single()

    if (error) {
        console.error("Update Task Status Error:", error)
        throw new Error('Failed to update task status')
    }

    // If RLS allows UPDATE but filters the row (e.g. not assignee), data might be null or error "PGRST116" (JSON object requested, multiple (or no) rows returned).
    // .single() usually throws if 0 rows.
    if (!data) {
        throw new Error('Task not found or permission denied')
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/kanban')
}
