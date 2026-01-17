
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Folder, Leaf, Users, GraduationCap, Heart, Globe, Recycle, BookOpen, HeartHandshake, Sprout, Wind, LayoutGrid, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Project } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns'

const ICON_MAP: Record<string, any> = {
    folder: Folder,
    leaf: Leaf,
    users: Users,
    'graduation-cap': GraduationCap,
    recycle: Recycle,
    heart: Heart,
    globe: Globe,
    'book-open': BookOpen,
    'heart-handshake': HeartHandshake,
    sprout: Sprout,
    wind: Wind,
}

export function ProjectList({ projects, taskCounts }: { projects: any[], taskCounts: Record<number, { completed: number, incomplete: number }> }) {
    const [view, setView] = useState<'grid' | 'list' | 'calendar'>('grid')
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const activeProjectsList = projects.filter(p => p.status === 'active')
    const archivedProjectsList = projects.filter(p => p.status === 'archived')

    const getCounts = (pid: number) => taskCounts[pid] || { completed: 0, incomplete: 0 }

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

        return (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <h2 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-secondary rounded transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentMonth(today => new Date())} className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-secondary transition-colors">Today</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-secondary rounded transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-xs font-semibold text-muted-foreground border-b border-border text-center py-3 bg-secondary/10">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-border/50 bg-background/50">
                    {calendarDays.map((date, i) => {
                        const inMonth = isSameMonth(date, monthStart)
                        // Find projects active on this date (Only ACTIVE projects)
                        const activeProjectsOnDate = activeProjectsList.filter(p => {
                            if (!p.start_date || !p.end_date) return false
                            return isWithinInterval(date, { start: new Date(p.start_date), end: new Date(p.end_date) })
                        })

                        return (
                            <div key={i} className={`p-1 flex flex-col gap-1 relative group ${!inMonth ? 'bg-secondary/20 text-muted-foreground/30' : 'hover:bg-secondary/10 transition-colors'}`}>
                                <div className={`text-right text-xs p-1 mb-1 font-medium ${isSameDay(date, new Date()) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto shadow-sm' : ''}`}>
                                    {format(date, 'd')}
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide">
                                    {activeProjectsOnDate.slice(0, 3).map(p => (
                                        <Link href={`/projects/${p.id}`} key={p.id} className="block">
                                            <div
                                                className="text-[10px] truncate px-1.5 py-1 rounded-md border border-border/50 text-foreground shadow-sm transition-transform hover:scale-[1.02]"
                                                style={{ backgroundColor: p.color_code ? `${p.color_code}20` : '#262626', borderColor: p.color_code ? `${p.color_code}40` : '', borderLeftWidth: '3px', borderLeftColor: p.color_code || '#fff' }}
                                                title={`${p.name}\n${format(new Date(p.start_date!), 'MMM d')} - ${format(new Date(p.end_date!), 'MMM d')}`}
                                            >
                                                {p.name}
                                            </div>
                                        </Link>
                                    ))}
                                    {activeProjectsOnDate.length > 3 && (
                                        <div className="text-[9px] text-muted-foreground pl-1 cursor-help" title={activeProjectsOnDate.slice(3).map(p => p.name).join('\n')}>
                                            + {activeProjectsOnDate.length - 3} more...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="border border-border/50 rounded-lg p-1 bg-card/50 w-fit flex gap-1 backdrop-blur-sm">
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'list' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <List className="w-4 h-4" /> List
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'grid' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Grid
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                        <CalendarIcon className="w-4 h-4" /> Calendar
                    </button>
                </div>
            </div>

            {view === 'calendar' && renderCalendar()}

            {view === 'grid' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeProjectsList.length > 0 ? activeProjectsList.map((project) => {
                            const IconComponent = ICON_MAP[project.icon || 'folder'] || Folder
                            const ownerName = project.creator?.full_name || 'System'

                            return (
                                <Link href={`/projects/${project.id}`} key={project.id} className="block">
                                    <div className="group border border-border rounded-xl p-5 hover:border-foreground/20 transition-all bg-card/30 hover:bg-card/50 cursor-pointer h-full flex flex-col shadow-sm hover:shadow-md">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground group-hover:scale-105 transition-transform shadow-inner">
                                                    <IconComponent className="w-5 h-5" style={{ color: project.color_code }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">{project.name}</h3>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{ownerName}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${project.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'}`}>
                                                {project.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">{project.description || "No description provided."}</p>

                                        <div className="space-y-3 pt-3 border-t border-border/50">
                                            {project.project_value && (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Value</span>
                                                    <span className="font-semibold font-mono">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(project.project_value)}
                                                    </span>
                                                </div>
                                            )}
                                            {project.start_date && project.end_date && (
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Timeline</span>
                                                    <span className="font-medium">
                                                        {format(new Date(project.start_date), 'MMM d')} - {format(new Date(project.end_date), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                                <span className="text-[10px] text-muted-foreground">Tasks Status</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5" title="Incomplete Tasks">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                        <span className="font-medium text-foreground">{getCounts(project.id).incomplete}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5" title="Completed Tasks">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <span className="font-medium text-foreground">{getCounts(project.id).completed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }) : (
                            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                                No active projects.
                            </div>
                        )}
                    </div>

                    {archivedProjectsList.length > 0 && (
                        <div>
                            <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider mt-8 border-t border-border pt-8">Archived Projects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75 grayscale hover:grayscale-0 transition-all">
                                {archivedProjectsList.map((project) => {
                                    const IconComponent = ICON_MAP[project.icon || 'folder'] || Folder
                                    const ownerName = project.creator?.full_name || 'System'

                                    return (
                                        <Link href={`/projects/${project.id}`} key={project.id} className="block">
                                            <div className="group border border-border rounded-xl p-5 hover:border-foreground/20 transition-all bg-card/30 hover:bg-card/50 cursor-pointer h-full flex flex-col">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground group-hover:scale-110 transition-transform">
                                                        <IconComponent className="w-5 h-5" style={{ color: project.color_code }} />
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full text-[10px] border bg-neutral-500/10 text-neutral-500 border-neutral-500/20">
                                                        ARCHIVED
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-500 transition-colors">{project.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{project.description || "No description provided."}</p>
                                                <div className="mt-auto pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                                    <span>Owner: {ownerName}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'list' && (
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="divide-y divide-border">
                            {activeProjectsList.length > 0 ? activeProjectsList.map((project) => {
                                const IconComponent = ICON_MAP[project.icon || 'folder'] || Folder
                                const ownerName = project.creator?.full_name || 'System'

                                return (
                                    <Link href={`/projects/${project.id}`} key={project.id} className="block hover:bg-secondary/30 transition-colors">
                                        <div className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground shrink-0">
                                                <IconComponent className="w-5 h-5" style={{ color: project.color_code }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold truncate group-hover:text-blue-500">{project.name}</h3>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] border ${project.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'}`}>
                                                        {project.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{project.description || "No description provided."}</p>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                                                <div className="flex items-center gap-1" title="Incomplete Tasks">
                                                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">{getCounts(project.id).incomplete}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1" title="Completed Tasks">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">{getCounts(project.id).completed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            }) : (
                                <div className="p-8 text-center text-muted-foreground">No active projects.</div>
                            )}
                        </div>
                    </div>

                    {archivedProjectsList.length > 0 && (
                        <div>
                            <h3 className="text-muted-foreground text-sm font-medium mb-4 uppercase tracking-wider mt-8 border-t border-border pt-8">Archived Projects</h3>
                            <div className="bg-card border border-border rounded-xl overflow-hidden opacity-75 grayscale hover:grayscale-0 transition-all">
                                <div className="divide-y divide-border">
                                    {archivedProjectsList.map((project) => {
                                        const IconComponent = ICON_MAP[project.icon || 'folder'] || Folder
                                        const ownerName = project.creator?.full_name || 'System'

                                        return (
                                            <Link href={`/projects/${project.id}`} key={project.id} className="block hover:bg-secondary/30 transition-colors">
                                                <div className="p-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground shrink-0">
                                                        <IconComponent className="w-5 h-5" style={{ color: project.color_code }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-semibold truncate group-hover:text-blue-500">{project.name}</h3>
                                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] border bg-neutral-500/10 text-neutral-500 border-neutral-500/20">
                                                                ARCHIVED
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{project.description || "No description provided."}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {projects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    No projects created yet.
                </div>
            )}
        </div>
    )
}
