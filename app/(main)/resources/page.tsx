
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResourceList } from '@/components/resources/ResourceList'
import { ResourceActions } from '@/components/resources/ResourceActions'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Check admin status
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .order('id', { ascending: true })

    const hasData = (resources && resources.length > 0) || false

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                    <p className="text-muted-foreground mt-2">Useful links and documents for the team.</p>
                </div>
                <ResourceActions isAdmin={isAdmin} hasData={hasData} />
            </div>

            {hasData ? (
                <ResourceList resources={resources || []} isAdmin={isAdmin} />
            ) : (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    No resources available.
                    {isAdmin && <div className="mt-2 text-sm">Click "Seed Sample Data" to start.</div>}
                </div>
            )}
        </div>
    )
}
