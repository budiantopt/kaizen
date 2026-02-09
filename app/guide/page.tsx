'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, TrendingUp, Users, Target, RefreshCw } from 'lucide-react'

export default function GuidePage() {
    const [activeWaste, setActiveWaste] = useState('muda')

    const wasteTypes = [
        {
            id: 'muda',
            kanji: '無',
            title: 'Muda (Waste)',
            desc: 'Non-value-adding activities. In social impact projects, this refers to "waiting for approvals", "unused resources", or "redundant reporting".',
            help: 'The Kanban Board highlights tasks stuck in "In Progress" or "Review", exposing bottlenecks where work is sitting idle (waiting waste).',
            color: 'red'
        },
        {
            id: 'mura',
            kanji: '斑',
            title: 'Mura (Unevenness)',
            desc: 'Inconsistency in program execution. Sometimes the field team is overwhelmed, other times waiting for directives.',
            help: 'Statistics on the Performance page reveal completion consistency over semesters. Project Timelines (Gantt) help smooth out deadlines to prevent "crunch time".',
            color: 'blue'
        },
        {
            id: 'muri',
            kanji: '理',
            title: 'Muri (Overburden)',
            desc: 'Straining volunteers, staff, or beneficiaries beyond their capacity. This leads to burnout and diminishing returns.',
            help: 'My Tasks shows your total workload at a glance. If you have too many "At Risk" or "Due Today" items, it\'s a signal to renegotiate deadlines before you burn out.',
            color: 'yellow'
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Header / Nav */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                            <div className="w-3 h-3 bg-black rounded-full" />
                        </div>
                        Kaizen
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/login"
                            className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Use Guide
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Mastering Kaizen with <br /> the Kaizen Way.
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
                            Kaizen isn't just a tool; it's a philosophy. We built this platform around
                            <strong> Kaizen</strong> (kai-zen)—the Japanese practice of continuous improvement.
                            Here is how to optimize your workflow.
                        </p>
                    </div>

                    {/* Principles Grid */}
                    <div className="grid gap-12 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">

                        {/* Principle 1: PLAN */}
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500 transition-colors">
                                <Target className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    1. Plan
                                    <span className="text-sm font-normal text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">Projects</span>
                                </h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    Kaizen starts with identifying goals. In Kaizen, use <strong>Projects</strong> to define your high-level objectives.
                                    Map out the journey and set clear milestones.
                                </p>
                                <ul className="space-y-2 mt-4">
                                    <li className="flex items-center gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                        Break big goals into actionable projects.
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                        Set clear deadlines (Start & End dates).
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Principle 2: DO */}
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center z-10 group-hover:border-yellow-500 transition-colors">
                                <RefreshCw className="w-5 h-5 text-neutral-400 group-hover:text-yellow-500 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    2. Do
                                    <span className="text-sm font-normal text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">My Tasks & Kanban</span>
                                </h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    Execution is key. Your <strong>My Tasks</strong> view allows you to focus ONLY on what matters today.
                                    Move cards across the <strong>Kanban</strong> board to visualize progress and spot bottlenecks instantly.
                                </p>
                                <ul className="space-y-2 mt-4">
                                    <li className="flex items-center gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                                        Keep "In Progress" limits low to avoid burnout.
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                                        Update task status daily to keep the team aligned.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Principle 3: CHECK */}
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center z-10 group-hover:border-green-500 transition-colors">
                                <TrendingUp className="w-5 h-5 text-neutral-400 group-hover:text-green-500 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    3. Check
                                    <span className="text-sm font-normal text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">KPIs & Performance</span>
                                </h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    You can't improve what you don't measure. The <strong>Performance</strong> tab tracks your completion rates and KPI progress.
                                    Regularly check these metrics to see if you are on track or drifting.
                                </p>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl mt-4">
                                    <p className="text-xs text-neutral-400 italic">
                                        "Focus on the process, and the results will follow."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Principle 4: ACT */}
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center z-10 group-hover:border-red-500 transition-colors">
                                <Users className="w-5 h-5 text-neutral-400 group-hover:text-red-500 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    4. Act
                                    <span className="text-sm font-normal text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">Team Refinement</span>
                                </h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    Based on your checks, standardize what works and fix what doesn't.
                                    Use <strong>Resources</strong> to document new standards and share knowledge with the team.
                                    Collaborate to remove waste (Muda) from your processes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* The 3Ms Section - Horizontal Accordion */}
                    <div className="mt-24 mb-24">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Eliminating Waste (The 3Ms)</h2>
                            <p className="text-neutral-400">Kaizen is designed to help you identify and eliminate the three types of deviation.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {wasteTypes.map((waste) => {
                                const isActive = activeWaste === waste.id
                                // Dynamic color classes
                                const borderColor = isActive
                                    ? waste.color === 'red' ? 'border-red-500/50' : waste.color === 'blue' ? 'border-blue-500/50' : 'border-yellow-500/50'
                                    : 'border-white/5'

                                const bgColor = isActive
                                    ? 'bg-neutral-900/80'
                                    : 'bg-neutral-900/30'

                                const iconBg = waste.color === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : waste.color === 'blue' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'

                                return (
                                    <div
                                        key={waste.id}
                                        onClick={() => setActiveWaste(isActive ? '' : waste.id)}
                                        className={`relative rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${bgColor} ${borderColor} hover:bg-neutral-800/50`}
                                    >
                                        <div className="p-6 flex gap-6 items-start">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${iconBg}`}>
                                                <span className="font-bold text-xl">{waste.kanji}</span>
                                            </div>

                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-bold text-white">{waste.title}</h3>
                                                </div>

                                                <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-60'}`}>
                                                    <div className="overflow-hidden">
                                                        <p className="text-neutral-400 my-4 leading-relaxed text-sm">
                                                            {waste.desc}
                                                        </p>
                                                        <div className="text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                                            <strong className="text-white">How Kaizen Helps:</strong>
                                                            <span className="text-neutral-400 block mt-1 leading-relaxed">
                                                                {waste.help}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick Tour Section */}
                    <div className="mt-24">
                        <h2 className="text-3xl font-bold mb-10 text-center">Quick Tour</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Team Tasks (Dashboard)", desc: "Your command center. View all team tasks, filter by project or assignee, and switch between List, Kanban, and Gantt views." },
                                { title: "My Tasks", desc: "Your personal focus zone. Shows only tasks assigned to you. Sort by due date or priority." },
                                { title: "Projects", desc: "High-level management. Create projects, define timelines, and track value." },
                                { title: "Performance", desc: "Track your impact. View completion rates and manage your semester KPIs." },
                                { title: "Resources", desc: "Knowledge base. Share and find essential documents, guides, and standards." },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <h4 className="text-lg font-bold mb-2 text-white">{item.title}</h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-20 pt-10 border-t border-white/10 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-white hover:text-neutral-300 transition-colors group text-lg font-medium">
                            <span>Get Started</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
