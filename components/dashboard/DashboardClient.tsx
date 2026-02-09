'use client'

import { useState, useEffect } from 'react'
import { Task, Project, Profile } from '@/types'
import { List, LayoutGrid, Calendar, Plus, Settings, Filter, Check, ChevronDown, Users } from 'lucide-react'
import { TaskList } from '@/components/dashboard/TaskList'
import { KanbanView } from '@/components/dashboard/KanbanView'
import { GanttView } from '@/components/dashboard/GanttView'
import { format } from 'date-fns'
import { TaskModal } from '@/components/dashboard/TaskModal'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { useToast } from '@/components/ui/toast-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { archiveProject } from '@/app/actions/projects'
import { differenceInCalendarDays, startOfDay } from 'date-fns'

type ViewType = 'list' | 'kanban' | 'gantt'

export default function DashboardClient({
    tasks,
    projects,
    profiles,
    initialProjectId = null,
    hideProjectFilters = false,
    title = "Today's Kaizen",
    currentUserId,
    currentUserRole
}: {
    tasks: Task[],
    projects: Project[],
    profiles: Profile[],
    initialProjectId?: number | null,
    hideProjectFilters?: boolean,
    title?: string,
    currentUserId?: string,
    currentUserRole?: 'admin' | 'member'
}) {
    const [view, setView] = useState<ViewType>('kanban')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
    const [activeProjectId, setActiveProjectId] = useState<number | null>(initialProjectId)
    const { addToast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [hasCheckedArchival, setHasCheckedArchival] = useState(false)
    const [activeAssigneeId, setActiveAssigneeId] = useState<string | null>(null)

    // Project Edit Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isAssigneeFilterOpen, setIsAssigneeFilterOpen] = useState(false)
    const currentProject = projects.find(p => p.id === activeProjectId)

    // Auto-Open Modal from URL
    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsModalOpen(true)
            // Optional: Clean up URL without refresh
            const url = new URL(window.location.href)
            url.searchParams.delete('create')
            window.history.replaceState({}, '', url)
        }
    }, [searchParams])

    // Auto-Archive Logic
    useEffect(() => {
        if (hasCheckedArchival || projects.length === 0) return

        const checkArchival = async () => {
            const today = startOfDay(new Date())
            const toArchive = projects.filter(p => {
                if (p.status !== 'active' || !p.end_date) return false
                // Check if end_date is in the past (strictly before today)
                // Assuming end_date string YYYY-MM-DD
                const end = new Date(p.end_date)
                // We compare timestamps or date parts. 
                // startOfDay(new Date()) gives today 00:00.
                // If end_date is "2025-01-01", new Date iso gives UTC usually.
                // Safest to assume string comparison or date-fns helper.
                return differenceInCalendarDays(today, end) > 0
            })

            if (toArchive.length > 0) {
                await Promise.all(toArchive.map(p => archiveProject(p.id)))
                addToast(`Auto-archived ${toArchive.length} expired project(s).`, "info")
                router.refresh()
            }
            setHasCheckedArchival(true)
        }

        checkArchival()
    }, [projects, hasCheckedArchival, addToast, router]) // Logic runs once per load if projects exist

    // Filter Logic
    const filteredTasks = tasks.filter(t => {
        // Project Filter
        if (activeProjectId && t.project_id !== activeProjectId) {
            return false
        }

        // Exclude tasks from archived projects
        const taskProject = projects.find(p => p.id === t.project_id)
        if (taskProject && taskProject.status === 'archived') {
            return false
        }

        // Assignee Filter
        if (activeAssigneeId) {
            const hasAssignee = t.assignees?.some(a => a.id === activeAssigneeId)
            if (!hasAssignee) return false
        }

        return true
    })

    // Count Active Tasks (Pending, excluding 'done'/'complete')
    const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'complete')
    const pendingCount = pendingTasks.length

    const handleCreateNew = () => {
        setTaskToEdit(null)
        setIsModalOpen(true)
    }

    const handleEditTask = (task: Task) => {
        // Permission check
        const isAssignee = task.assignees?.some(a => a.id === currentUserId)
        const isAdmin = currentUserRole === 'admin'

        // Strict check: if I am not an assignee AND not an admin, I cannot edit.
        if (currentUserId && !isAssignee && !isAdmin) {
            addToast("Oops! It looks like this task is assigned to someone else.", "error")
            return
        }

        setTaskToEdit(task)
        setIsModalOpen(true)
    }

    const toggleProjectFilter = (projectId: number) => {
        if (activeProjectId === projectId) {
            setActiveProjectId(null) // deselect
        } else {
            setActiveProjectId(projectId)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 group">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {/* Show Edit Project Button if we are in a specific project view */}
                        {initialProjectId && currentProject && (
                            <button
                                onClick={() => setIsProjectModalOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                                title="Edit Project Details"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <p className="text-muted-foreground mt-2">
                        {format(new Date(), 'MMM d, yyyy')} • {title === 'Team Tasks'
                            ? `Team has ${pendingCount} pending tasks from various projects.`
                            : `You have ${pendingCount} pending tasks.`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateNew}
                        className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Filters & Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Project Filter Dropdown */}
                    {!hideProjectFilters && (
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    {activeProjectId ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: projects.find(p => p.id === activeProjectId)?.color_code }}></span>
                                            {projects.find(p => p.id === activeProjectId)?.name}
                                        </span>
                                    ) : (
                                        <span>All Projects</span>
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                    <div className="absolute top-full mt-2 left-0 w-[240px] bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto">
                                        <button
                                            onClick={() => { setActiveProjectId(null); setIsFilterOpen(false) }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center justify-between group"
                                        >
                                            <span>All Projects</span>
                                            {activeProjectId === null && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                        <div className="h-px bg-border my-1" />
                                        {projects.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setActiveProjectId(p.id); setIsFilterOpen(false) }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center justify-between group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color_code }}></span>
                                                    {p.name}
                                                </span>
                                                {activeProjectId === p.id && <Check className="w-4 h-4 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Assignee Filter Dropdown - Only for Team Tasks */}
                    {title === 'Team Tasks' && (
                        <div className="relative">
                            <button
                                onClick={() => setIsAssigneeFilterOpen(!isAssigneeFilterOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    {activeAssigneeId ? (
                                        <span>
                                            {profiles.find(p => p.id === activeAssigneeId)?.full_name || 'Unknown User'}
                                        </span>
                                    ) : (
                                        <span>All Assignees</span>
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {isAssigneeFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsAssigneeFilterOpen(false)} />
                                    <div className="absolute top-full mt-2 left-0 w-[240px] bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto">
                                        <button
                                            onClick={() => { setActiveAssigneeId(null); setIsAssigneeFilterOpen(false) }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center justify-between group"
                                        >
                                            <span>All Assignees</span>
                                            {activeAssigneeId === null && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                        <div className="h-px bg-border my-1" />
                                        {profiles.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setActiveAssigneeId(p.id); setIsAssigneeFilterOpen(false) }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center justify-between group"
                                            >
                                                <span className="truncate">{p.full_name}</span>
                                                {activeAssigneeId === p.id && <Check className="w-4 h-4 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* View Toggle */}
                <div className="border border-border/50 rounded-lg p-1 bg-card/50 w-fit flex gap-1 backdrop-blur-sm">
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'list' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <List className="w-4 h-4" /> List
                    </button>
                    <button
                        onClick={() => setView('kanban')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'kanban' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Kanban
                    </button>
                    <button
                        onClick={() => setView('gantt')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'gantt' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <Calendar className="w-4 h-4" /> Gantt
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={`min-h-[400px] ${view === 'kanban' ? 'h-[calc(100vh-220px)]' : ''}`}>
                {view === 'list' && (
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <TaskList tasks={filteredTasks} onEdit={handleEditTask} />
                    </div>
                )}

                {view === 'kanban' && <KanbanView tasks={filteredTasks} onEdit={handleEditTask} currentUserId={currentUserId} />}

                {view === 'gantt' && <GanttView tasks={filteredTasks} />}
            </div>

            {
                isModalOpen && (
                    <TaskModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        projects={projects}
                        profiles={profiles}
                        taskToEdit={taskToEdit}
                        defaultProjectId={activeProjectId}
                    />
                )
            }

            {
                isProjectModalOpen && (
                    <ProjectModal
                        isOpen={isProjectModalOpen}
                        onClose={() => setIsProjectModalOpen(false)}
                        projectToEdit={currentProject}
                    />
                )
            }
        </div >
    )
}
