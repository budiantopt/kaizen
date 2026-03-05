'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const projectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    resource_link: z.string().optional(),
    project_value: z.coerce.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    color_code: z.string(),
    icon: z.string().optional(),
    status: z.enum(['active', 'archived', 'pinned']),
})


export async function upsertProject(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is admin to decide which client to use
    // Regular client is fine if RLS allows, but for "Admin overrides", we might need admin client.
    // However, mixing clients is complex. Let's try to stick to RLS. 
    // If the user says "Admin can change project detail", they likely mean the BUTTON/UI.
    // But let's check permissions. 
    // We will verify admin status.

    // Fetch profile to check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const rawData = {
        id: formData.get('id'),
        name: formData.get('name'),
        description: formData.get('description'),
        resource_link: formData.get('resource_link'),
        project_value: formData.get('project_value'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        color_code: formData.get('color_code'),
        icon: formData.get('icon'),
        status: formData.get('status'),
    }

    const validatedFields = projectSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { id, name, description, resource_link, project_value, start_date, end_date, color_code, icon, status } = validatedFields.data

    const cleanStartDate = start_date || null
    const cleanEndDate = end_date || null

    // If admin is updating, we want to bypass RLS if RLS is strict and prevents pinned status.
    let supabaseAction = supabase
    if (isAdmin) {
        try {
            supabaseAction = createAdminClient()
        } catch (e) {
            console.error(e)
        }
    }

    let dbStatus = status
    let dbIcon = icon || 'leaf'

    if (status === 'pinned') {
        dbStatus = 'active'
        dbIcon = `pinned-${dbIcon}`
    } else {
        // Enforce cleanup just in case
        if (dbIcon.startsWith('pinned-')) {
            dbIcon = dbIcon.replace('pinned-', '')
        }
    }

    if (id) {
        // UPDATE
        const { error } = await supabaseAction
            .from('projects')
            .update({ name, description, resource_link, project_value, start_date: cleanStartDate, end_date: cleanEndDate, color_code, icon: dbIcon, status: dbStatus })
            .eq('id', id)

        if (error) {
            // If error is permission denied and user is admin, try admin client?
            // Actually, I'll just assume RLS is the way. 
            return { message: 'Failed to Update Project: ' + error.message }
        }
    } else {
        // CREATE
        const { error } = await supabaseAction.from('projects').insert({
            name,
            description,
            resource_link,
            project_value,
            start_date: cleanStartDate,
            end_date: cleanEndDate,
            color_code,
            icon: dbIcon,
            status: dbStatus,
            created_by: user.id
            // created_at will default to now() due to migration
        })

        if (error) return { message: 'Failed to Create Project: ' + error.message }
    }

    revalidatePath('/projects')
    if (id) revalidatePath(`/projects/${id}`) // Revalidate detail page

    return { message: id ? 'Project Updated' : 'Project Created', success: true }
}


export async function archiveProject(projectId: number) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/projects')
    return { success: true }
}

export async function searchProjects(query: string) {
    const supabase = await createClient()

    // Simple ILIKE search on name
    const { data, error } = await supabase
        .from('projects')
        .select('id, name, icon, color_code')
        .ilike('name', `%${query}%`)
        .eq('status', 'active')
        .limit(50)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error searching projects:", error)
        return []
    }
    const dataWithPinned = data?.map(p => {
        if (p.icon && p.icon.startsWith('pinned-')) {
            return { ...p, status: 'pinned', icon: p.icon.replace('pinned-', '') }
        }
        return p
    })
    return dataWithPinned
}
