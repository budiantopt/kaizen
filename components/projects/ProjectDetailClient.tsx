'use client'

import React, { useState } from 'react'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { Task, Project, Profile } from '@/types'
import { ExternalLink, Info, Folder, Leaf, Users, GraduationCap, Heart, Globe, Recycle, BookOpen, HeartHandshake, Sprout, Wind } from 'lucide-react'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { format } from 'date-fns'

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

export default function ProjectDetailClient({
    project,
    tasks,
    projects,
    profiles,
    currentUserId
}: {
    project: Project,
    tasks: Task[],
    projects: Project[],
    profiles: Profile[],
    currentUserId: string
}) {
    const [tab, setTab] = useState<'tasks' | 'about'>('tasks')
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)

    // Filter tasks for "My Tasks"
    const myTasks = tasks.filter(task =>
        task.assignees?.some(assignee => assignee.id === currentUserId)
    )


    const currentUserProfile = profiles.find(p => p.id === currentUserId)
    const canEdit = currentUserProfile?.role === 'admin' || project.created_by === currentUserId

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex items-center gap-4 border-b border-border pb-1">
                <button
                    onClick={() => setTab('tasks')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'tasks' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    My Tasks
                </button>
                <button
                    onClick={() => setTab('about')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'about' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    About
                </button>
            </div>

            {tab === 'tasks' && (
                <DashboardClient
                    tasks={myTasks}
                    projects={projects}
                    profiles={profiles}
                    initialProjectId={project.id}
                    hideProjectFilters={true}
                    title={project.name}
                />
            )}

            {tab === 'about' && (
                <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary text-foreground">
                                {(() => {
                                    const IconComponent = ICON_MAP[project.icon || 'leaf'] || Folder
                                    return <IconComponent className="w-6 h-6" style={{ color: project.color_code || '#fff' }} />
                                })()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{project.name}</h2>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] border uppercase ${project.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                        {canEdit && (
                            <button
                                onClick={() => setIsEditProjectOpen(true)}
                                className="text-sm border border-border bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors"
                            >
                                Edit Project
                            </button>
                        )}
                    </div>


                    <div className="space-y-6">
                        {/* Project Value */}
                        {project.project_value && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Project Value</h3>
                                <p className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(project.project_value)}
                                </p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {project.description || "No description provided."}
                            </p>
                        </div>

                        {project.start_date && project.end_date && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Project Period</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-foreground">
                                        {format(new Date(project.start_date), 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-muted-foreground">to</span>
                                    <span className="font-medium text-foreground">
                                        {format(new Date(project.end_date), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {project.resource_link && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Project Folder</h3>
                                <a
                                    href={project.resource_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 hover:underline text-sm break-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {project.resource_link}
                                </a>
                            </div>
                        )}

                        <div className="pt-6 border-t border-border mt-8">
                            <p className="text-xs text-muted-foreground">
                                Created by {project.creator?.full_name || 'Unknown'} • Created on {project.created_at ? format(new Date(project.created_at), 'MMM d, yyyy') : 'Recently'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ProjectModal
                isOpen={isEditProjectOpen}
                onClose={() => setIsEditProjectOpen(false)}
                projectToEdit={project}
            />
        </div>
    )
}
