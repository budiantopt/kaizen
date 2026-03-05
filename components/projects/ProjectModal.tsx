'use client'

import { useState, useEffect, useActionState } from 'react'
import { Plus, X, Check, Leaf, Users, GraduationCap, Heart, Globe, Recycle, BookOpen, HeartHandshake, Sprout, Wind } from 'lucide-react'
import { upsertProject } from '@/app/actions/projects'
import { Project } from '@/types'
import { differenceInDays, differenceInWeeks, differenceInMonths, isValid } from 'date-fns'

const initialState = {
    message: '',
    errors: {} as any,
    success: false
}

const PRESET_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Zinc', value: '#71717a' },
]

const PRESET_ICONS = [
    { name: 'CSR', value: 'leaf', icon: Leaf },
    { name: 'Community', value: 'users', icon: Users },
    { name: 'Education', value: 'graduation-cap', icon: GraduationCap },
    { name: 'Sustainability', value: 'recycle', icon: Recycle },
    { name: 'Charity', value: 'heart', icon: Heart },
    { name: 'Global', value: 'globe', icon: Globe },
    { name: 'Teaching', value: 'book-open', icon: BookOpen },
    { name: 'Volunteer', value: 'heart-handshake', icon: HeartHandshake },
    { name: 'Agri', value: 'sprout', icon: Sprout },
    { name: 'Energy', value: 'wind', icon: Wind },
]

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    projectToEdit?: Project | null
    isAdmin?: boolean
}

export function ProjectModal({ isOpen, onClose, projectToEdit, isAdmin }: ProjectModalProps) {
    const [state, formAction, isPending] = useActionState(upsertProject, initialState)
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[5].value)
    const [selectedIcon, setSelectedIcon] = useState('leaf')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [duration, setDuration] = useState('')

    const isEdit = !!projectToEdit

    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                setSelectedColor(projectToEdit.color_code || PRESET_COLORS[5].value)
                setSelectedIcon(projectToEdit.icon || 'leaf')
                setStartDate(projectToEdit.start_date || '')
                setEndDate(projectToEdit.end_date || '')
            } else {
                setSelectedColor(PRESET_COLORS[5].value)
                setSelectedIcon('leaf')
                setStartDate('')
                setEndDate('')
            }
        }
    }, [isOpen, projectToEdit])

    useEffect(() => {
        if (!startDate || !endDate) {
            setDuration('')
            return
        }
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (!isValid(start) || !isValid(end)) {
            setDuration('')
            return
        }

        const days = differenceInDays(end, start)

        if (days < 0) {
            setDuration('End date must be after start date')
        } else if (days < 7) {
            setDuration(`${days} Day${days !== 1 ? 's' : ''}`)
        } else if (days < 30) {
            const weeks = differenceInWeeks(end, start)
            setDuration(`${weeks} Week${weeks !== 1 ? 's' : ''}`)
        } else {
            const months = differenceInMonths(end, start)
            const remainingDays = days % 30 // Approximate
            // Better logic: differenceInMonths gives full months. 
            // Let's just say "X Months" or "X Months, Y Weeks" if we want precision. 
            // Requirement asks "depend on duration".
            setDuration(`${months} Month${months !== 1 ? 's' : ''}`)
        }
    }, [startDate, endDate])

    useEffect(() => {
        if (state.success) {
            onClose()
        }
    }, [state.success, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Project' : 'New Project'}</h2>

                <form action={formAction} className="space-y-5">
                    {isEdit && <input type="hidden" name="id" value={projectToEdit.id} />}

                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={projectToEdit?.name}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                            placeholder="Project Name"
                        />
                        {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">About Project</label>
                        <textarea
                            name="description"
                            defaultValue={projectToEdit?.description || ''}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none resize-none"
                            placeholder="Describe your project goals..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                name="start_date"
                                type="date"
                                value={startDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                                End Date
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        className="text-[10px] text-red-500 hover:underline"
                                    >
                                        Clear Timeline
                                    </button>
                                )}
                            </label>
                            <input
                                name="end_date"
                                type="date"
                                value={endDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    {duration && (
                        <div className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Duration: {duration}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Project Value (IDR)</label>
                        <input
                            name="project_value"
                            type="number"
                            defaultValue={projectToEdit?.project_value || ''}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                            placeholder="e.g. 10000000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Project Folder Link</label>
                        <input
                            name="resource_link"
                            type="url"
                            defaultValue={projectToEdit?.resource_link || ''}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <input type="hidden" name="color_code" value={selectedColor} />
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <input type="hidden" name="icon" value={selectedIcon} />
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_ICONS.map(item => {
                                const Icon = item.icon
                                const isSelected = selectedIcon === item.value
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setSelectedIcon(item.value)}
                                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${isSelected ? 'bg-secondary border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:bg-secondary/50'}`}
                                        title={item.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[9px]">{item.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            name="status"
                            defaultValue={projectToEdit?.status || 'active'}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none"
                        >
                            <option value="active">Active</option>
                            {isAdmin && <option value="pinned">Pinned</option>}
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {state.message && (
                        <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{state.message}</p>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
