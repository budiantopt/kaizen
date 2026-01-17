'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()
    } catch (error) {
        console.error('Sign out error:', error)
    }
    redirect('/login')
}
