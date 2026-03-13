'use client'

import React, { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Task } from '@/types'
import { format } from 'date-fns'
import { updateTaskStatus } from '@/app/actions/tasks'
import { Info, Clock, RefreshCw, ChevronsLeft } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { fetchGlobalTasks } from '@/app/actions/tasks'
import { ExternalLink } from 'lucide-react'

// -- Configuration --
const COLUMNS = [
    { id: 'todo', label: 'To Do', color: 'bg-neutral-500', description: 'Task created but not started' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-600', description: 'Currently being worked on' },
    { id: 'on_track', label: 'On Track', color: 'bg-blue-400', description: 'Due date is > 2 days away' },
    { id: 'at_risk', label: 'At Risk', color: 'bg-amber-500', description: 'Due within 2 days' },
    { id: 'off_track', label: 'Off Track', color: 'bg-red-500', description: 'Past due date' },
    { id: 'on_hold', label: 'On Hold', color: 'bg-orange-500', description: 'Manually paused' },
    { id: 'complete', label: 'Complete', color: 'bg-green-600', description: 'Task finished' },
]

// -- Components --
// ... Data fetching imports ...
import { differenceInCalendarDays, startOfDay, isBefore } from 'date-fns'

// Used in automation
function TaskCard({ task, isOverlay, onEdit }: { task: Task, isOverlay?: boolean, onEdit?: (task: Task) => void }) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
        disabled: isOverlay
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="bg-card/50 border border-border p-3 rounded-lg shadow-sm opacity-30 h-[100px]"></div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onEdit && onEdit(task)}
            className={`bg-card border border-border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-foreground/20 group cursor-grab active:cursor-grabbing ${isOverlay ? 'cursor-grabbing scale-105 rotate-2 shadow-xl border-foreground/30' : ''}`}
        >

            <div className="flex justify-between items-start mb-2">
                <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-secondary/50 text-muted-foreground"
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: task.project?.color_code || '#666' }}
                    ></span>
                    <span className="truncate max-w-[140px]">{task.project?.name || 'No Project'}</span>
                </span>

                {(() => {
                    const p = task.priority?.toLowerCase() || 'low'
                    const color = p === 'high' ? 'bg-red-500 text-white' : p === 'medium' ? 'bg-yellow-500 text-black' : 'bg-neutral-500 text-white'
                    return (
                        <span className={`text-[8px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded ml-2 ${color}`} title={`${p} priority`}>
                            {p.charAt(0).toUpperCase()}
                        </span>
                    )
                })()}
            </div>
            <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium bg-transparent ${task.status === 'complete' || task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                </h4>
                {task.evidence_link && (
                    <a
                        href={task.evidence_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-blue-500 transition-colors z-20 shrink-0"
                        title="Open Attachment"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className={`flex items-center gap-1 ${task.status === 'off_track' && task.end_date && isBefore(startOfDay(new Date(task.end_date)), startOfDay(new Date())) ? 'text-red-500 font-medium' : ''}`}>
                    <Clock className="w-3 h-3" />
                    {task.end_date ? format(new Date(task.end_date), 'MMM d') : '-'}
                </div>

                {/* Assignees */}
                <div className="flex -space-x-1.5">
                    {(() => {
                        const assignees = task.assignees || (task.assignee ? [task.assignee] : [])
                        if (assignees.length > 0) {
                            return assignees.slice(0, 3).map((assignee, i) => (
                                <div
                                    key={assignee?.id || i}
                                    className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-background"
                                    title={assignee?.full_name || 'User'}
                                >
                                    {assignee?.avatar_url ? (
                                        <img src={assignee.avatar_url} alt={assignee.full_name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[8px] font-bold text-foreground">
                                            {getInitials(assignee?.full_name)}
                                        </span>
                                    )}
                                </div>
                            ))
                        } else {
                            return (
                                <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[8px] text-muted-foreground">
                                    -
                                </div>
                            )
                        }
                    })()}
                    {(() => {
                        const assignees = task.assignees || (task.assignee ? [task.assignee] : [])
                        if (assignees.length > 3) {
                            return (
                                <div className="w-5 h-5 rounded-full bg-secondary border border-muted flex items-center justify-center text-[8px] font-medium text-muted-foreground ring-1 ring-background">
                                    +{assignees.length - 3}
                                </div>
                            )
                        }
                    })()}
                </div>
            </div>
        </div>
    )
}

function KanbanColumn({ id, title, tasks, color, description, onEdit }: { id: string, title: string, tasks: Task[], color: string, description?: string, onEdit?: (task: Task) => void }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
            id: id,
        },
    })

    if (isCollapsed) {
        return (
            <div
                ref={setNodeRef}
                onClick={() => setIsCollapsed(false)}
                className="flex flex-col h-full w-[44px] min-w-[44px] bg-muted/20 rounded-xl border border-border/50 items-center py-4 gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
                title={`Expand ${title}`}
            >
                <div className={`w-3 h-3 rounded-full ${color} shrink-0`}></div>
                <div className="flex-1 flex items-center justify-center">
                    <span
                        className="text-sm font-semibold text-muted-foreground whitespace-nowrap tracking-tight"
                        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                    >
                        {title}
                    </span>
                </div>
                <span className="bg-background text-muted-foreground w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold border border-border shrink-0">
                    {tasks.length}
                </span>
            </div>
        )
    }

    return (
        <div ref={setNodeRef} className="flex flex-col h-full min-w-[280px] bg-muted/20 rounded-xl border border-border/50 transition-all">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/30 rounded-t-xl sticky top-0 z-10 backdrop-blur-md group/header">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <span className="font-semibold text-sm whitespace-nowrap">{title}</span>
                    <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs border border-border">
                        {tasks.length}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                    {description && (
                        <div className="group relative">
                            <Info className="w-4 h-4 text-muted-foreground/50 cursor-help hover:text-foreground transition-colors" />
                            <div className="absolute right-0 top-6 w-56 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left leading-relaxed">
                                <span className="font-semibold block mb-1 text-foreground">{title}</span>
                                {description}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-background/50"
                        title="Collapse column"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Droppable Area */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={onEdit} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full w-full min-h-[100px] flex items-center justify-center border border-dashed border-border/30 rounded-lg text-muted-foreground/30 text-xs text-center p-4">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    )
}

// -- Main View --

import { useToast } from '@/components/ui/toast-context'

export function KanbanView({
    tasks: initialTasks,
    onEdit,
    currentUserId,
    enablePolling = false,
    readOnly = false
}: {
    tasks: Task[],
    onEdit?: (task: Task) => void,
    currentUserId?: string,
    enablePolling?: boolean,
    readOnly?: boolean
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [hasAutomated, setHasAutomated] = useState(false)
    const { addToast } = useToast()
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    // Live Polling
    React.useEffect(() => {
        if (!enablePolling) return

        const interval = setInterval(async () => {
            setIsRefreshing(true)
            try {
                const latestTasks = await fetchGlobalTasks()
                if (Array.isArray(latestTasks)) {
                    setTasks(latestTasks as Task[])
                    setLastUpdated(new Date())
                }
            } catch (err) {
                console.error("Failed to poll tasks", err)
            } finally {
                setIsRefreshing(false)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [enablePolling])

    // Automation Logic: Run once on mount/data load
    React.useEffect(() => {
        if (!isMounted || hasAutomated || tasks.length === 0) return

        const automateStatuses = async () => {
            const today = startOfDay(new Date())
            let updates = 0

            const updatesPromises = tasks.map(async (task) => {
                // Skip completed/done/on_hold tasks - explicit user states
                if (['done', 'complete', 'on_hold'].includes(task.status)) return

                const dueDate = startOfDay(new Date(task.end_date))
                const diffDays = differenceInCalendarDays(dueDate, today)

                let newStatus = task.status

                // Rule 1: Overdue -> Off Track
                if (diffDays < 0 && task.status !== 'off_track') {
                    newStatus = 'off_track'
                }
                // Rule 2: Due within 2 days -> At Risk (if not already off_track)
                else if (diffDays >= 0 && diffDays <= 2 && task.status !== 'at_risk' && task.status !== 'off_track') {
                    newStatus = 'at_risk'
                }
                // Rule 3: Recovery (future date) -> On Track (if currently flagged as risk/off)
                else if (diffDays > 2 && (task.status === 'at_risk' || task.status === 'off_track')) {
                    newStatus = 'on_track'
                }

                if (newStatus !== task.status) {
                    updates++
                    // Optimistic update locally? 
                    // Better to just fire server update. The UI will reflect on re-fetch or we can force local.
                    // Let's force local update for immediate feedback
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus as any } : t))
                    await updateTaskStatus(task.id, newStatus)
                }
            })

            await Promise.all(updatesPromises)
            if (updates > 0) {
                console.log(`Automated ${updates} task statuses based on dates.`)
            }
            setHasAutomated(true)
        }

        automateStatuses()
    }, [isMounted, hasAutomated, tasks]) // tasks dependency might trigger loop if we update tasks? 
    // Wait, if we update tasks locally via setTasks, this effect fires again.
    // But `hasAutomated` prevents re-run.
    // However, if `initialTasks` prop updates from parent (due to server revalidation), `hasAutomated` should reset?
    // Maybe we only run this ONCE per page load.
    // Ideally, the Automation should happen on Server Action when fetching? No, user wants Frontend Automation feel.
    // Keeping `hasAutomated` true ensures it only runs once per session/mount which is safer.

    // ... rest of component ...


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
            disabled: readOnly // Disable drag if readOnly
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            disabled: readOnly
        })
    )

    if (!isMounted) {
        return (
            <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start w-full">
                {/* Skeleton Loading State to prevent layout shift */}
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex flex-col h-full min-h-[500px] min-w-[280px] bg-muted/20 rounded-xl border border-border/50">
                        <div className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/30 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                <span className="font-semibold text-sm whitespace-nowrap">{col.label}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Helper to get task by id
    const getTask = (id: number) => tasks.find(t => t.id === id)

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        const isActiveTask = active.data.current?.type === 'Task'
        const isOverTask = over.data.current?.type === 'Task'
        // const isOverColumn = over.data.current?.type === 'Column' // Unused variable

        if (!isActiveTask) return

        // 1. Dragging Task over Task
        if (isActiveTask && isOverTask) {
            return
        }
    }

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id as number
        const overId = over.id

        const activeTask = getTask(activeId)
        if (!activeTask) return

        // Permission Check for Moving
        if (currentUserId && !activeTask.assignees?.some(a => a.id === currentUserId) && !readOnly) {
            if (!currentUserId) return
            addToast("Oops! This task is assigned to someone else, so you can't move it.", "error")
            return
        }

        // Determine the drop target column
        let newStatus = ''
        if (over.data.current?.type === 'Column') {
            newStatus = overId as string
        } else if (over.data.current?.type === 'Task') {
            const overTask = getTask(overId as number)
            if (overTask) {
                newStatus = overTask.status
            }
        }

        // If status changed
        if (newStatus && newStatus !== activeTask.status) {
            if (newStatus === 'complete' || newStatus === 'done') {
                if (!activeTask.evidence_link) {
                    addToast("Please provide an attachment link (output/evidence like report, sheet, deck, etc.) for completed tasks.", "error")
                    return
                }
            }
            // 1. Optimistic Update
            setTasks((prev) => prev.map(t =>
                t.id === activeId ? { ...t, status: newStatus as any } : t
            ))

            // 2. Server Update
            try {
                await updateTaskStatus(activeId, newStatus)
                addToast("Task updated", "success")
                if (newStatus === 'complete' || newStatus === 'done') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })
                }
            } catch (err) {
                console.error("Failed to update status", err)
                addToast("Failed to update task", "error")
                // Revert optimistic update
                setTasks((prev) => prev.map(t =>
                    t.id === activeId ? { ...t, status: activeTask.status } : t
                ))
            }
        }
    }

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task)
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    }

    // Sensors - Disable if readOnly

    return (
        <div className="h-full flex flex-col relative group/kanban">
            {/* Header with Updated Info - Top Right Overlay */}
            {enablePolling && (
                <div className="absolute top-[-40px] right-0 flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded-full border border-border/50 backdrop-blur-sm z-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                    <span>Updated {format(lastUpdated, 'HH:mm')}</span>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start w-full shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rounded-xl px-4">
                    {COLUMNS.map(col => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.label}
                            color={col.color}
                            description={col.description}
                            onEdit={onEdit}
                            tasks={(tasks || []).filter(t => {
                                // Map legacy statuses
                                // if (col.id === 'on_track' && t.status === 'in_progress') return true // REMOVED: Now has own column
                                if (col.id === 'complete' && t.status === 'done') return true
                                return t.status === col.id
                            })}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? (
                        <div className="w-[280px]">
                            <TaskCard task={activeTask} isOverlay />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
