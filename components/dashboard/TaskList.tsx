'use client'

import { format, isAfter, isBefore, startOfDay } from 'date-fns'
import { Task } from '@/types'
import { useToast } from '@/components/ui/toast-context'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import { toggleTaskStatus } from '@/app/actions/tasks'
import { getInitials } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { ExternalLink } from 'lucide-react'

type SortField = 'title' | 'project' | 'status' | 'end_date' | 'assignee' | 'priority'
type SortDirection = 'asc' | 'desc'

export function TaskList({ tasks, onEdit }: { tasks: Task[], onEdit?: (task: Task) => void }) {
    const { addToast } = useToast()
    const [sortField, setSortField] = useState<SortField>('end_date')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No tasks found. Click "New Task" to get started.
            </div>
        )
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const sortedTasks = [...tasks].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1

        switch (sortField) {
            case 'title':
                return a.title.localeCompare(b.title) * direction
            case 'project':
                return ((a.project?.name || '')).localeCompare(b.project?.name || '') * direction
            case 'status':
                return a.status.localeCompare(b.status) * direction
            case 'priority':
                const pMap: any = { low: 1, medium: 2, high: 3 }
                return ((pMap[a.priority || 'medium'] || 2) - (pMap[b.priority || 'medium'] || 2)) * direction
            case 'end_date':
                if (!a.end_date) return 1 * direction
                if (!b.end_date) return -1 * direction
                return (new Date(a.end_date).getTime() - new Date(b.end_date).getTime()) * direction
            case 'assignee':
                // Approximation: Sort by first assignee name
                const assigneeA = a.assignees?.[0]?.full_name || ''
                const assigneeB = b.assignees?.[0]?.full_name || ''
                return assigneeA.localeCompare(assigneeB) * direction
            default:
                return 0
        }
    })

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null
        return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
    }

    const Header = ({ field, label, width }: { field: SortField, label: string, width: string }) => (
        <div
            className={`${width} px-2 flex items-center cursor-pointer select-none hover:text-foreground`}
            onClick={() => handleSort(field)}
        >
            {label} <SortIcon field={field} />
        </div>
    )

    return (
        <div className="w-full">
            {/* Custom Header injected here or must be in parent? 
               Wait, DashboardClient renders the header previously. I should probably RENDER the header INSIDE TaskList or modify DashboardClient?
               The user asked to "add sort task by header". It is better if the Header is part of the Table component now so I can control the click handlers easier.
               I will Modify DashboardClient to REMOVE the hardcoded header and put it here.
            */}
            <div className="bg-muted/30 text-muted-foreground font-medium border-b border-border flex p-4 text-sm sticky top-0 backdrop-blur-md z-10">
                <Header field="title" label="Task" width="w-[30%]" />
                <Header field="project" label="Project" width="w-[25%]" />
                <Header field="status" label="Status" width="w-[12%]" />
                <Header field="priority" label="Priority" width="w-[8%]" />
                <Header field="end_date" label="Due Date" width="w-[15%]" />
                <Header field="assignee" label="Assignee" width="w-[10%]" />
            </div>

            <div className="divide-y divide-border/50">
                {sortedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="group flex items-center py-3 px-4 cursor-pointer hover:bg-secondary/50"
                        onClick={() => onEdit && onEdit(task)}
                    >
                        <div className="w-[30%] flex items-center gap-3">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    if (task.status !== 'done' && task.status !== 'complete') {
                                        confetti({
                                            particleCount: 100,
                                            spread: 70,
                                            origin: { y: 0.6 }
                                        })
                                        if (!task.evidence_link) {
                                            addToast("Please provide an attachment link (output/evidence like report, sheet, deck, etc.) for completed tasks.", "error")
                                        }
                                    }
                                    await toggleTaskStatus(task.id, task.status)
                                }}
                                className={`cursor-pointer w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.status === 'done' || task.status === 'complete'
                                    ? 'bg-green-600 border-green-600 text-white'
                                    : 'border-muted-foreground hover:border-green-600 hover:border-2'
                                    }`}
                            >
                                {(task.status === 'done' || task.status === 'complete') && <Check className="w-3 h-3" />}
                            </button>
                            <div className="flex items-center gap-2 truncate">
                                <span title={task.title} className={`font-medium truncate ${task.status === 'done' || task.status === 'complete' ? 'text-muted-foreground/50 line-through' : 'text-foreground'}`}>
                                    {task.title}
                                </span>
                                {task.evidence_link && (
                                    <a
                                        href={task.evidence_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-muted-foreground hover:text-blue-500 shrink-0"
                                        title="Open Attachment"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="w-[25%]">
                            {task.project && (
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-neutral-900/50 text-neutral-300"
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: task.project.color_code || '#fff' }}
                                    ></span>
                                    <span
                                        className="truncate max-w-[150px]"
                                        title={task.project.name}
                                    >
                                        {task.project.name}
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className="w-[12%]">
                            {(() => {
                                const statusColors: Record<string, string> = {
                                    'todo': 'text-neutral-500 border-neutral-500/20 bg-neutral-500/10',
                                    'on_track': 'text-blue-500 border-blue-500/20 bg-blue-500/10',
                                    'in_progress': 'text-blue-500 border-blue-500/20 bg-blue-500/10',
                                    'at_risk': 'text-amber-500 border-amber-500/20 bg-amber-500/10',
                                    'off_track': 'text-red-500 border-red-500/20 bg-red-500/10',
                                    'on_hold': 'text-orange-500 border-orange-500/20 bg-orange-500/10',
                                    'complete': 'text-green-600 border-green-600/20 bg-green-600/10',
                                    'done': 'text-green-600 border-green-600/20 bg-green-600/10',
                                }
                                const colorClass = statusColors[task.status] || 'text-muted-foreground border-border bg-secondary'

                                return (
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border border-opacity-50 capitalize ${colorClass}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                )
                            })()}
                        </div>

                        <div className="w-[8%]">
                            {(() => {
                                const priorityColors: Record<string, string> = {
                                    'low': 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20',
                                    'medium': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                                    'high': 'text-red-500 bg-red-500/10 border-red-500/20',
                                    'urgent': 'text-red-600 bg-red-600/10 border-red-600/20 animate-pulse',
                                }
                                const p = task.priority || 'medium'
                                const colorClass = priorityColors[p] || priorityColors['medium']

                                return (
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorClass} capitalize`}>
                                        {p}
                                    </span>
                                )
                            })()}
                        </div>

                        <div className={`w-[15%] text-sm pl-2 ${task.status === 'off_track' && task.end_date && isBefore(startOfDay(new Date(task.end_date)), startOfDay(new Date())) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                            {task.end_date ? format(new Date(task.end_date), 'MMM d') : '-'}
                        </div>

                        <div className="w-[10%] flex -space-x-2 overflow-hidden items-center">
                            {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.map((assignee, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-background flex items-center justify-center text-[8px] font-bold text-white z-10" title={assignee.full_name || 'User'}>
                                        {getInitials(assignee.full_name)}
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
