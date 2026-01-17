import { Sidebar } from '@/components/Sidebar'
import { ToastListener } from '@/components/ui/toast-listener'
import { getActiveAnnouncement } from '@/app/actions/announcements'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { CommandMenu } from '@/components/CommandMenu'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const announcement = await getActiveAnnouncement()

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <CommandMenu />
            <AnnouncementBanner announcement={announcement} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-4 overflow-y-auto h-full">
                    <div className="w-full h-full">
                        <ToastListener />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
