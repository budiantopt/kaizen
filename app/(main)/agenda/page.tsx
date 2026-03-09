import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="space-y-6 flex flex-col h-full min-h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Agenda</h1>
                    <p className="text-muted-foreground mt-2">View the shared team calendar and upcoming events.</p>
                </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-border bg-card shadow-sm min-h-[600px]">
                <div style={{ filter: "invert(90%) hue-rotate(180deg)", background: "white", display: "block", width: "100%", height: "100%", minHeight: "600px" }}>
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=c_3e9b8ff62dd40d059b47c7f9572e90467bbe8eea7584e89d8d1fc8f847a018a4%40group.calendar.google.com&ctz=Asia%2FJakarta&mode=AGENDA"
                        style={{ border: 0 }}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no">
                    </iframe>
                </div>
            </div>
        </div>
    )
}
