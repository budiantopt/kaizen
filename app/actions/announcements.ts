'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'


const announcementSchema = z.object({
    message: z.string().min(1),
    link: z.string().optional(),
    link_text: z.string().optional(),
    is_active: z.coerce.boolean(),
    background_color: z.string().optional(),
    text_color: z.string().optional(),
    icon: z.string().optional(), // Added icon field
})

export async function upsertAnnouncement(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // ... (Authorization checks remain the same) ...
    // Verify Admin Role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        return { message: 'Unauthorized: Admin access required.' }
    }

    const rawData = {
        message: formData.get('message'),
        link: formData.get('link'),
        link_text: formData.get('link_text'),
        is_active: formData.get('is_active') === 'on',
        background_color: formData.get('background_color'),
        text_color: formData.get('text_color'),
        icon: formData.get('icon'), // Extract icon from form data
    }

    const validated = announcementSchema.safeParse(rawData)


    if (!validated.success) {
        return { errors: validated.error.flatten().fieldErrors }
    }

    // We only support ONE active global announcement for now, or just the latest one?
    // Let's assume we are editing "THE" announcement or creating a new one that supercedes.
    // Ideally we might want a singleton pattern, or just update row ID 1.
    // But let's just Insert a new one and set all others to inactive? Or just standard CRUD.
    // Valid strategy: "Set this as active, set others inactive"

    if (validated.data.is_active) {
        await supabase.from('announcements').update({ is_active: false }).neq('id', 0) // deactive all
    }

    // Check if we already have an active one?
    // Let's just Insert a new row for history logging.
    const { error } = await supabase.from('announcements').insert({
        ...validated.data,
        created_by: user.id
    })

    if (error) return { message: 'Failed to save announcement: ' + error.message }

    revalidatePath('/')
    return { message: 'Announcement Updated', success: true }
}

export async function getActiveAnnouncement() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    return data
}
