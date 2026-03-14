'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getSetting(key: string, useAdmin: boolean = false) {
    const supabase = useAdmin ? createAdminClient() : await createClient()
    const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle()

    if (error) {
        console.error(`Error fetching setting ${key}:`, error)
        return null
    }

    return data?.value
}

export async function updateSetting(key: string, value: any) {
    const supabase = await createClient()

    // Authorization check
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required.')
    }

    const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw new Error(`Failed to update setting: ${error.message}`)
    }

    revalidatePath('/')
    return { success: true }
}
