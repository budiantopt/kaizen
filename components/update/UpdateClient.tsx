'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ExternalLink, Calendar, User, CheckCircle2, Clock, MousePointer2, Search, X } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

export default function UpdateClient({ tasks }: { tasks: any[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter tasks by proposal name
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Separate tasks
    const completedTasks = filteredTasks.filter(t => t.status === 'complete' || t.status === 'done')
        .sort((a, b) => new Date(b.completed_at || b.updated_at).getTime() - new Date(a.completed_at || a.updated_at).getTime())

    const onQueueTasks = filteredTasks.filter(t => t.status !== 'complete' && t.status !== 'done')
        .sort((a, b) => {
            if (!a.end_date) return 1
            if (!b.end_date) return -1
            return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
        })

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-blue-500/30 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-12 space-y-8 text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">
                            Public Access
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Proposal <br className="hidden md:block" />
                            <span className="text-blue-400">Development</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                            Track progress and provide quick updates.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find proposal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-3xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg backdrop-blur-md hover:bg-white/[0.08]"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </header>

                <div className="space-y-24">
                    {/* Completed Section First */}
                    <section className="relative">
                        <div className="sticky top-0 z-20 py-6 bg-black/80 backdrop-blur-md flex items-center gap-4 mb-2">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-blue-400">Completed Proposal</h2>
                            <div className="h-px flex-grow bg-white/10" />
                            <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                {completedTasks.length} Done
                            </span>
                        </div>
                        <TaskTable tasks={completedTasks} type="complete" />
                    </section>

                    {/* On Queue Section */}
                    <section className="relative">
                        <div className="sticky top-0 z-20 py-6 bg-black/80 backdrop-blur-md flex items-center gap-4 mb-2">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-blue-400">On Queue</h2>
                            <div className="h-px flex-grow bg-white/10" />
                            <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                                {onQueueTasks.length} Pending
                            </span>
                        </div>
                        <TaskTable tasks={onQueueTasks} type="queue" />
                    </section>
                </div>
                
                {filteredTasks.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-neutral-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No results found</h3>
                        <p className="text-neutral-500 max-w-xs">
                            We couldn't find any proposal matching "{searchQuery}". Try a different search term.
                        </p>
                    </div>
                )}
                
                <footer className="mt-32 pb-12 text-center text-neutral-600 text-sm border-t border-white/5 pt-12 flex flex-col items-center gap-4">
                     <div className="flex items-center gap-3 opacity-50 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                        <img src="/icon.svg" alt="Kaizen" className="w-8 h-8 rounded-lg shadow-2xl border border-white/10" />
                        <span className="font-extrabold text-lg tracking-tighter text-white">Kaizen</span>
                     </div>
                     <p className="text-neutral-600 font-medium text-xs uppercase tracking-widest opacity-80">
                        &copy; {new Date().getFullYear()} Budianto
                     </p>
                </footer>
            </div>
        </div>
    )
}

function TaskTable({ tasks, type }: { tasks: any[], type: 'complete' | 'queue' }) {
    if (tasks.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[40px] text-center backdrop-blur-3xl">
                <p className="text-neutral-500">No proposals in this category.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
            <table className="w-full text-left border-separate border-spacing-0 table-fixed min-w-[800px]">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="w-[45%] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-neutral-500">Proposal Name</th>
                        <th className="w-[15%] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-neutral-500">Assignees</th>
                        <th className="w-[20%] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-neutral-500">
                            {type === 'complete' ? 'Finished Date' : 'Timeline'}
                        </th>
                        <th className="w-[20%] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-neutral-500 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {tasks.map((task) => {
                        const isCompleted = type === 'complete'
                        const gformUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdBgAGrVHYB5hw_Ws9ASyMLbdOR3QsBPwU44rMSmDEfqkMjMg/viewform?usp=pp_url&entry.1911818993=${task.id}&entry.883241983=${encodeURIComponent(task.title)}`
                        const assigneeFullNames = task.assignees && task.assignees.length > 0 
                            ? task.assignees.map((a: any) => (a.full_name || 'User')).join(', ')
                            : '-'

                        return (
                            <tr key={task.id} className="group hover:bg-white/[0.03] transition-colors">
                                <td className="py-6 px-8">
                                    <div className="flex flex-col gap-1">
                                        {task.evidence_link ? (
                                            <a 
                                                href={task.evidence_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                title={task.title}
                                                className="text-lg font-bold group-hover:text-blue-400 transition-colors inline-flex items-center gap-2 truncate"
                                            >
                                                <span className="truncate">{task.title}</span>
                                                <ExternalLink className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ) : (
                                            <span className="text-lg font-bold truncate" title={task.title}>{task.title}</span>
                                        )}
                                        {!isCompleted && (
                                            <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-tighter truncate">
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center -space-x-2" title={assigneeFullNames}>
                                        {task.assignees && task.assignees.length > 0 ? (
                                            task.assignees.map((assignee: any, i: number) => (
                                                <div 
                                                    key={i} 
                                                    className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white z-10 hover:scale-110 transition-transform hover:z-20 cursor-help"
                                                >
                                                    {getInitials(assignee.full_name)}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-neutral-500">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center gap-2 text-neutral-400 group-hover:text-neutral-200 transition-colors whitespace-nowrap">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-sm font-medium">
                                            {isCompleted ? (
                                                <span className="text-emerald-500 font-bold">
                                                    {task.completed_at ? format(new Date(task.completed_at), 'MMM d, yyyy') : format(new Date(task.updated_at), 'MMM d, yyyy')}
                                                </span>
                                            ) : (
                                                <>
                                                    {task.start_date ? format(new Date(task.start_date), 'MMM d') : '?'} 
                                                    {' — '}
                                                    {task.end_date ? format(new Date(task.end_date), 'MMM d, yyyy') : '?'}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-6 px-8 text-center">
                                    <a 
                                        href={gformUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-white hover:text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-500/20 whitespace-nowrap"
                                    >
                                        Share Update
                                        <MousePointer2 className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
