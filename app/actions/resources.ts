
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const resourceSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    link: z.string().url("Must be a valid URL"),
})

export async function upsertResource(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const rawData = {
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
    }

    const validatedFields = resourceSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { id, title, description, link } = validatedFields.data

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    const adminSupabase = createAdminClient()

    if (id) {
        // UPDATE: Check permission first
        const { data: existing } = await adminSupabase.from('resources').select('created_by').eq('id', id).single()
        if (!existing) return { message: 'Resource not found', success: false }

        if (!isAdmin && existing.created_by !== user.id) {
            return { message: 'Permission denied: You can only edit your own resources', success: false }
        }

        const { error } = await adminSupabase
            .from('resources')
            .update({ title, description, link })
            .eq('id', id)

        if (error) return { message: 'Failed to Update Resource: ' + error.message, success: false }
    } else {
        // CREATE
        const { error } = await adminSupabase.from('resources').insert({
            title,
            description,
            link,
            created_by: user.id
        })

        if (error) return { message: 'Failed to Create Resource: ' + error.message, success: false }
    }

    revalidatePath('/resources')
    return { message: id ? 'Resource Updated' : 'Resource Added', success: true }
}


export async function deleteResource(id: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    const adminSupabase = createAdminClient()

    const { data: existing } = await adminSupabase.from('resources').select('created_by').eq('id', id).single()
    if (!existing) return { message: 'Resource not found', success: false }

    if (!isAdmin && existing.created_by !== user.id) {
        return { message: 'Permission denied: You can only delete your own resources', success: false }
    }

    const { error } = await adminSupabase.from('resources').delete().eq('id', id)
    if (error) return { message: error.message, success: false }
    revalidatePath('/resources')
    return { message: 'Resource Deleted', success: true }
}

export async function seedResources() {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const samples = [
        { title: 'Project Management Guidelines', description: 'Standard operating procedures for project execution.', link: 'https://docs.google.com/document/d/sample1' },
        { title: 'Brand Assets', description: 'Logos, fonts, and color palettes.', link: 'https://drive.google.com/drive/folders/sample2' },
        { title: 'Figma Design System', description: 'UI components and design tokens.', link: 'https://figma.com/file/sample3' },
        { title: 'Dribbble Inspiration', description: 'Collection of UI trends and ideas.', link: 'https://dribbble.com/shots/popular' },
        { title: 'Next.js Documentation', description: 'Technical reference for our frontend framework.', link: 'https://nextjs.org/docs' },
        { title: 'Supabase Reference', description: 'Database and auth API documentation.', link: 'https://supabase.com/docs' },
        { title: 'Tailwind CSS Cheatsheet', description: 'Utility classes reference.', link: 'https://tailwindcss.com/docs' },
        { title: 'Team Calendar', description: 'Holiday schedules and meeting slots.', link: 'https://calendar.google.com/calendar' },
        { title: 'Quarterly Reports', description: 'Archive of past performance reviews.', link: 'https://drive.google.com/drive/folders/reports' },
        { title: 'Onboarding Checklist', description: 'Guide for new team members.', link: 'https://notion.so/onboarding' },
    ]

    const { error } = await supabase.from('resources').insert(
        samples.map(s => ({ ...s, created_by: user.id }))
    )

    if (error) return { message: error.message, success: false }
    revalidatePath('/resources')
    return { success: true }
}

