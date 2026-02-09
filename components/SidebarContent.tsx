'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, CheckSquare, Gauge, Layers, Circle, ShieldAlert, LogOut, Megaphone, Users, Library } from 'lucide-react'
import { Profile } from '@/types'
import { signOut } from '@/app/actions/auth'
import { getInitials } from '@/lib/utils'
import { format } from 'date-fns'

const navigation = [
    { name: 'Team Tasks', href: '/dashboard', icon: LayoutGrid },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: Layers },
    { name: 'Performance', href: '/performance', icon: Gauge },
    { name: 'Resources', href: '/resources', icon: Library },
]

function WorkClock() {
    // Initialize with null to avoid hydration mismatch, or use a mounted check
    // Simpler: just render, but suppress hydration warning or use useEffect to set time
    const [time, setTime] = useState<Date | null>(null)

    useEffect(() => {
        setTime(new Date())
        const timer = setInterval(() => setTime(new Date()), 1000 * 30) // Update every 30s
        return () => clearInterval(timer)
    }, [])

    if (!time) return null // Or a skeleton

    const hours = time.getHours()
    // const minutes = time.getMinutes()

    let status = 'inactive'
    let colorClass = 'text-neutral-400 border-neutral-200 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500' // Default Grey

    // Active Hours: 09:00 - 18:00 (hours 9 to 17.59...)
    if (hours >= 9 && hours < 18) {
        if (hours === 12) {
            // Lunch 12:00 - 12:59
            status = 'lunch'
            colorClass = 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30'
        } else {
            status = 'active'
            colorClass = 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30'
        }
    }

    return (
        <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${colorClass} flex items-center gap-1.5 shadow-sm`}>

            <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : status === 'lunch' ? 'bg-red-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'bg-neutral-400'}`} />
            {format(time, 'HH:mm')}
        </div>
    )
}



import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Monitor, Key } from 'lucide-react'
import { useProfileModal } from '@/components/providers/ProfileModalProvider'

// ... existing WorkClock (no changes needed) ...

export function SidebarContent({ profile }: { profile: Profile | null }) {
    const pathname = usePathname()
    const isAdmin = profile?.role === 'admin'
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [pendingTasksCount, setPendingTasksCount] = useState(0)
    const { openProfileModal } = useProfileModal()
    const supabase = createClient()

    // Fetch and Update Document Title
    useEffect(() => {
        const fetchCount = async () => {
            if (!profile?.id) return

            try {
                // Querying task_assignees is often more reliable for "my tasks"
                const { count, error } = await supabase
                    .from('task_assignees')
                    .select('task_id, tasks!inner(status)', { count: 'exact', head: true })
                    .eq('user_id', profile.id)
                    // If we want neq done/complete:
                    .neq('tasks.status', 'done')
                    .neq('tasks.status', 'complete')
                // Note: Supabase might interpret 'tasks.status' only if 'tasks' is embedded with !inner

                if (error) throw error
                if (count !== null) setPendingTasksCount(count)
            } catch (err) {
                console.error("Failed to fetch pending tasks count", JSON.stringify(err, null, 2))
            }
        }

        fetchCount()

        // Poll every minute or when path changes (to catch updates after navigation)
        // Also could subscribe to changes, but polling is simpler for count
        const interval = setInterval(fetchCount, 60000)
        return () => clearInterval(interval)
    }, [pathname, profile?.id, supabase]) // Re-run on navigation to refresh count

    // Update Title Effect
    useEffect(() => {
        document.title = `Kaizen | ${pendingTasksCount} pending tasks`
    }, [pendingTasksCount, pathname])

    // Get initial for avatar
    const initial = getInitials(profile?.full_name)
    const displayName = profile?.full_name || 'My Workspace'
    const displayRole = profile?.job_title || (profile?.role === 'admin' ? 'Admin' : 'Member')

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-border h-full bg-secondary/30 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 z-50 w-6 h-6 bg-secondary border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:scale-105 transition-all"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <div className={`p-4 flex ${isCollapsed ? 'flex-col items-center gap-4' : 'flex-row items-center justify-between gap-2'} border-b border-transparent shrink-0`}>
                <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background shrink-0">
                        <Circle className="w-3 h-3 fill-current" />
                    </div>
                    {!isCollapsed && <span className="truncate">Kaizen</span>}
                </Link>
                {!isCollapsed && (
                    <div className="scale-100 transition-all">
                        <WorkClock />
                    </div>
                )}
            </div>

            <nav className={`px-2 space-y-2 w-full flex flex-col ${isCollapsed ? 'items-center' : 'items-stretch'} mt-4 overflow-y-auto flex-1 scrollbar-hide`}>
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ''}
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2'} rounded-md text-sm font-medium transition-all shrink-0 ${isActive
                                ? 'bg-foreground text-background shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'} ${isCollapsed ? '' : 'w-4 h-4'}`} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}

                {isAdmin && (
                    <div className={`pt-4 mt-2 border-t border-border w-full flex flex-col ${isCollapsed ? 'items-center' : 'items-stretch'} gap-2 pb-4`}>
                        {!isCollapsed && <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Admin</p>}

                        <Link
                            href="/admin/kanban"
                            title={isCollapsed ? "Gemba" : ''}
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2'} rounded-md transition-all shrink-0 ${pathname.startsWith('/admin/kanban')
                                ? 'bg-foreground text-background shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Monitor className={`w-5 h-5 ${pathname.startsWith('/admin/kanban') ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'} ${isCollapsed ? '' : 'w-4 h-4'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Gemba</span>}
                        </Link>

                        <Link
                            href="/admin/announcements"
                            title={isCollapsed ? "Announcements" : ''}
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2'} rounded-md transition-all shrink-0 ${pathname.startsWith('/admin/announcements')
                                ? 'bg-foreground text-background shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Megaphone className={`w-5 h-5 ${pathname.startsWith('/admin/announcements') ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'} ${isCollapsed ? '' : 'w-4 h-4'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Announcements</span>}
                        </Link>

                        <Link
                            href="/admin/users"
                            title={isCollapsed ? "Users" : ''}
                            className={`group flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2'} rounded-md transition-all shrink-0 ${pathname.startsWith('/admin/users')
                                ? 'bg-foreground text-background shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Users className={`w-5 h-5 ${pathname.startsWith('/admin/users') ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'} ${isCollapsed ? '' : 'w-4 h-4'}`} />
                            {!isCollapsed && <span className="text-sm font-medium">Users</span>}
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-border flex justify-center">
                <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'w-full items-center justify-between'} gap-3 group relative`}>

                    {/* Profile Section - Click to Open Settings */}
                    <div
                        onClick={() => openProfileModal(profile)}
                        className={`flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-white/10 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border border-neutral-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 text-xs">
                            {initial}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{displayName}</p>
                                <p className="text-xs text-muted-foreground capitalize truncate">{displayRole}</p>
                            </div>
                        )}
                    </div>
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}
