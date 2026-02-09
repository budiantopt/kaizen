'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { KPI } from '@/types'

export async function createKpi(userId: string, description: string, targetMetric?: string) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { message: 'Unauthorized', success: false }

    // Ensure default semester exists
    const { data: semester } = await supabase.from('semesters').select('id').eq('id', 1).single()

    if (!semester) {
        // Attempt to create default semester
        const { error: semError } = await supabase.from('semesters').upsert({
            id: 1,
            name: 'Default Semester',
            start_date: new Date().getFullYear() + '-01-01',
            end_date: new Date().getFullYear() + '-06-30'
        })
        if (semError) {
            console.error("Failed to ensure semester:", semError)
            // Proceeding hoping it might exist or insert works otherwise, but likely will fail next
        }
    }

    const { error } = await supabase.from('kpis').insert({
        user_id: userId,
        description,
        target_metric: targetMetric || null,
        semester_id: 1
    })

    if (error) {
        console.error("KPI Create Error:", error)
        return { message: 'Failed to create KPI: ' + error.message, success: false }
    }

    revalidatePath('/admin')
    revalidatePath('/performance')
    return { message: 'KPI Created', success: true }
}

export async function toggleKpiStatus(kpiId: number, isCompleted: boolean) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { message: 'Unauthorized', success: false }

    const { error } = await supabase
        .from('kpis')
        .update({ is_completed: isCompleted })
        .eq('id', kpiId)

    if (error) return { message: 'Failed to update KPI', success: false }

    revalidatePath('/admin')
    revalidatePath('/performance')
    return { message: 'KPI Updated', success: true }
}

export async function deleteKpi(kpiId: number) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { message: 'Unauthorized', success: false }

    const { error } = await supabase.from('kpis').delete().eq('id', kpiId)

    if (error) return { message: 'Failed to delete KPI', success: false }

    revalidatePath('/admin')
    revalidatePath('/performance')
    return { message: 'KPI Deleted', success: true }
}
