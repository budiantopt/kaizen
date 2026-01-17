import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserList } from '@/components/admin/UserList'

export default async function UserManagementPage() {
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

    const { data: allProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-2">Manage user roles and titles.</p>
            </div>

            <UserList profiles={allProfiles || []} />
        </div>
    )
}
