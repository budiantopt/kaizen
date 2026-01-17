import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnnouncementForm } from '@/components/admin/AnnouncementForm'

export default async function AnnouncementsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
            </div>
        )
    }

    const { data: activeAnnouncement } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                <p className="text-muted-foreground mt-2">Set global banner messages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Global Announcement</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Set a banner message that appears at the top of the screen for all users.
                    </p>
                    <AnnouncementForm activeAnnouncement={activeAnnouncement} />
                </div>
            </div>
        </div>
    )
}
