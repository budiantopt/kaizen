'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Calendar, Smile, Calculator, User, CreditCard, Settings, Search, LayoutGrid, CheckSquare, Layers, BarChart2, Library, Plus, ArrowRight, X } from 'lucide-react'
import { searchProjects } from '@/app/actions/projects'
import { searchTasks } from '@/app/actions/tasks'

export function CommandMenu() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [projects, setProjects] = React.useState<any[]>([])
    const [tasks, setTasks] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
            if (e.key === 'Escape') {
                setOpen(false)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    React.useEffect(() => {
        if (!open) {
            setQuery('')
            setProjects([])
            setTasks([])
            return
        }

        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setProjects([])
                setTasks([])
                return
            }

            setLoading(true)
            try {
                const [projectsData, tasksData] = await Promise.all([
                    searchProjects(query),
                    searchTasks(query)
                ])
                setProjects(projectsData || [])
                setTasks(tasksData || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(fetchSearchResults, 300)
        return () => clearTimeout(debounceTimer)
    }, [query, open])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Command className="w-full flex flex-col overflow-hidden rounded-xl bg-transparent">
                    <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            autoFocus
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Type a command or search..."
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/tasks?create=true'))}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Create New Task</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard'))}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/projects'))}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                            >
                                <Layers className="mr-2 h-4 w-4" />
                                <span>Projects</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/tasks'))}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>Tasks</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/resources'))}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                            >
                                <Library className="mr-2 h-4 w-4" />
                                <span>Resources</span>
                            </Command.Item>
                        </Command.Group>

                        {query.trim().length > 0 && (
                            <>
                                {loading && (
                                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">Searching...</div>
                                )}
                                
                                {!loading && projects.length > 0 && (
                                    <Command.Group heading="Projects" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                                        {projects.map((project) => (
                                            <Command.Item
                                                key={`project-${project.id}`}
                                                value={project.name}
                                                onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                                            >
                                                <div
                                                    className="mr-2 h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: project.color_code || '#666' }}
                                                />
                                                <span>{project.name}</span>
                                                <ArrowRight className="ml-auto h-3 w-3 opacity-50" />
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}

                                {!loading && tasks.length > 0 && (
                                    <Command.Group heading="Tasks" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mt-2">
                                        {tasks.map((task) => (
                                            <Command.Item
                                                key={`task-${task.id}`}
                                                value={task.title}
                                                onSelect={() => runCommand(() => router.push(`/tasks?taskId=${task.id}`))}
                                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted text-foreground"
                                            >
                                                <CheckSquare className="mr-2 h-4 w-4 opacity-50" />
                                                <span className="truncate">{task.title}</span>
                                                <div className="ml-auto pl-2 flex items-center gap-2 text-[10px] text-muted-foreground shrink-0 uppercase pointer-events-none">
                                                    <span className="px-1.5 py-0.5 rounded-full border border-border/50 bg-secondary/50">
                                                        {task.status?.replace('_', ' ')}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3" />
                                                </div>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}
                            </>
                        )}

                        <div className="mt-4 pt-4 border-t border-border px-2 pb-2">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded">↵</kbd> to select</span>
                                    <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded">↑↓</kbd> to navigate</span>
                                    <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded">esc</kbd> to close</span>
                                </div>
                            </div>
                        </div>
                    </Command.List>
                </Command>
            </div>
        </div>
    )
}
