import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SidebarContent } from './SidebarContent'

// ... imports
import { Profile } from '@/types'

export async function Sidebar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile: Profile | null = null
    let pendingTasksCount = 0

    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
    }

    return (
        <div className="shrink-0 h-full z-40">
            <SidebarContent profile={profile} />
        </div>
    )
}
