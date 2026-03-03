'use client'

import { useState, useEffect, useActionState, useRef } from 'react'
import { X, Calendar as CalendarIcon, Users, AlignLeft, CheckSquare, ChevronDown } from 'lucide-react'
import { upsertTask } from '@/app/actions/tasks'
import { Project, Profile, Task } from '@/types'
import { getInitials } from '@/lib/utils'

const initialState = {
    message: '',
    errors: {} as any,
    success: false
}

interface TaskModalProps {
    isOpen: boolean
    onClose: () => void
    projects: Project[]
    profiles: Profile[]
    taskToEdit?: Task | null
    defaultProjectId?: number | null
}

const PRESET_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#71717a', // Zinc
]

export function TaskModal({ isOpen, onClose, projects, profiles, taskToEdit, defaultProjectId }: TaskModalProps) {
    const [state, formAction, isPending] = useActionState(upsertTask, initialState)
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [currentStatus, setCurrentStatus] = useState<string>(taskToEdit?.status || 'todo')
    const [currentPriority, setCurrentPriority] = useState<string>(taskToEdit?.priority || 'medium')

    // Reset state when opening/closing or changing task
    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                // Populate existing assignees
                const currentIds = taskToEdit.assignees?.map(a => a.id) || []
                if (currentIds.length === 0 && taskToEdit.assignee_id) {
                    currentIds.push(taskToEdit.assignee_id)
                }
                setSelectedAssignees(currentIds)
                setCurrentStatus(taskToEdit.status)
                setCurrentPriority(taskToEdit.priority || 'medium')
            } else {
                setSelectedAssignees([])
                setCurrentStatus('todo')
                setCurrentPriority('medium')
            }
        }
    }, [isOpen, taskToEdit])

    // Close on success
    useEffect(() => {
        if (state.success) {
            onClose()
        }
    }, [state.success, onClose])

    if (!isOpen) return null

    const isEdit = !!taskToEdit

    const toggleAssignee = (id: string) => {
        if (selectedAssignees.includes(id)) {
            setSelectedAssignees(prev => prev.filter(x => x !== id))
        } else {
            setSelectedAssignees(prev => [...prev, id])
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="text-lg font-bold">{isEdit ? 'Edit Task' : 'New Task'}</h2>
                    <div className="flex items-center gap-2">
                        {isEdit && (
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                #{taskToEdit.id}
                            </span>
                        )}
                        <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Body */}
                <div className="overflow-y-auto p-6 flex-1">
                    <form action={formAction} id="task-form" className="space-y-6">
                        {isEdit && <input type="hidden" name="id" value={taskToEdit.id} />}

                        {/* Title Input */}
                        <div>
                            <input
                                name="title"
                                type="text"
                                required
                                defaultValue={taskToEdit?.title}
                                className="cursor-text w-full bg-transparent border-0 border-b border-border px-0 py-2 text-2xl font-bold placeholder:text-muted-foreground focus:ring-0 focus:border-foreground outline-none transition-colors"
                                placeholder="Task Title"
                            />
                            {state.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>}
                        </div>

                        {/* Project, Status, Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Project
                                </label>
                                <div className="relative">
                                    <select
                                        name="project_id"
                                        defaultValue={taskToEdit?.project_id || defaultProjectId || ""}
                                        className="cursor-pointer w-full bg-secondary/30 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none font-medium"
                                    >
                                        <option value="" disabled>Select Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                                    <CheckSquare className="w-3 h-3" /> Status
                                </label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={currentStatus}
                                        onChange={(e) => setCurrentStatus(e.target.value)}
                                        className="cursor-pointer w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none pl-8"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="on_track">On Track</option>
                                        <option value="at_risk">At Risk</option>
                                        <option value="off_track">Off Track</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="complete">Complete</option>
                                    </select>
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none ${currentStatus === 'todo' ? 'bg-neutral-500' :
                                        currentStatus === 'in_progress' ? 'bg-blue-500' :
                                            currentStatus === 'on_track' ? 'bg-blue-500' :
                                                currentStatus === 'at_risk' ? 'bg-amber-500' :
                                                    currentStatus === 'off_track' ? 'bg-red-500' :
                                                        currentStatus === 'on_hold' ? 'bg-orange-500' :
                                                            'bg-green-600'
                                        }`} />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                                    <CheckSquare className="w-3 h-3" /> Priority
                                </label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={currentPriority}
                                        onChange={(e) => setCurrentPriority(e.target.value)}
                                        className="cursor-pointer w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none pl-8"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none ${currentPriority === 'high' ? 'bg-red-500' :
                                        currentPriority === 'medium' ? 'bg-yellow-500' :
                                            'bg-neutral-500'
                                        }`} />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Dates */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3" /> Timeline
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block mb-1">Start</span>
                                            <input
                                                name="start_date"
                                                type="date"
                                                required
                                                defaultValue={taskToEdit?.start_date ? new Date(taskToEdit.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                                                onClick={(e) => (e.currentTarget as any).showPicker()}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block mb-1">Due</span>
                                            <input
                                                name="end_date"
                                                type="date"
                                                required
                                                defaultValue={taskToEdit?.end_date ? new Date(taskToEdit.end_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                                                onClick={(e) => (e.currentTarget as any).showPicker()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks Field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Remarks / Description
                            </label>
                            <textarea
                                name="remarks"
                                rows={3}
                                defaultValue={taskToEdit?.remarks || ''}
                                className="cursor-text w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                                placeholder="Add any additional notes, links, or context here..."
                            />
                        </div>

                        {/* Assignees Section */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                                <Users className="w-3 h-3" /> Assignees
                            </label>

                            {/* Hidden inputs to submit array */}
                            {selectedAssignees.map(id => (
                                <input key={id} type="hidden" name="assignee_ids" value={id} />
                            ))}

                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedAssignees
                                .map(id => profiles.find(p => p.id === id))
                                .sort((a, b) => (a?.full_name || a?.email || '').localeCompare(b?.full_name || b?.email || ''))
                                .map(profile => {
                                        if (!profile) return null;
                                        const id = profile.id;
                                        return (
                                            <div key={id} className="inline-flex items-center gap-1 bg-white text-black pl-1 pr-2 py-0.5 rounded-full text-xs font-medium">
                                                <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center text-[10px] overflow-hidden">
                                                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : getInitials(profile?.full_name)}
                                                </div>
                                                {profile?.full_name || 'Unknown'}
                                                <button type="button" onClick={() => toggleAssignee(id)} className="ml-1 text-neutral-500 hover:text-black">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )
                                    })}
                            </div>

                            <div className="border border-border rounded-lg p-2 max-h-[150px] overflow-y-auto bg-secondary/30">
                                {[...profiles]
                                .sort((a, b) => (a.full_name || a.email || '').localeCompare(b.full_name || b.email || ''))
                                .map(profile => {
                                        const isSelected = selectedAssignees.includes(profile.id)
                                        return (
                                            <button
                                                key={profile.id}
                                                type="button"
                                                onClick={() => toggleAssignee(profile.id)}
                                                className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors ${isSelected ? 'opacity-50' : ''}`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border border-neutral-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                                    {getInitials(profile.full_name)}
                                                </div>
                                                <div className="text-left text-sm truncate">
                                                    {profile.full_name || profile.email}
                                                </div>
                                                {isSelected && <div className="ml-auto text-green-500 text-xs font-bold">Selected</div>}
                                            </button>
                                        )
                                    })}
                            </div>
                        </div>

                        {state.message && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                                {state.message}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="task-form"
                        disabled={isPending}
                        className="cursor-pointer bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Task')}
                    </button>
                </div>
            </div>
        </div>
    )
}
