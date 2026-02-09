
'use client'

import { useState } from 'react'
import { Pencil, Trash2, FileText, ArrowUpDown, Calendar, User, Search } from 'lucide-react'
import { ResourceModal } from './ResourceModal'
import { deleteResource } from '@/app/actions/resources'
import { Resource } from '@/types'
import { format } from 'date-fns'

export function ResourceList({ resources, isAdmin }: { resources: Resource[], isAdmin: boolean }) {
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [searchTerm, setSearchTerm] = useState('')

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            await deleteResource(id)
        }
    }

    const toggleSort = (key: 'date' | 'name') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(key)
            setSortOrder(key === 'date' ? 'desc' : 'asc') // Default new sort
        }
    }

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedResources = [...filteredResources].sort((a, b) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        } else {
            const nameA = a.title.toLowerCase()
            const nameB = b.title.toLowerCase()
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        }
    })

    const getIcon = (_url: string) => {
        // User requested: "show all icon for resource as docs"
        return FileText
    }

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-end md:items-center">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex justify-end gap-2 shrink-0">
                    <button
                        onClick={() => toggleSort('date')}
                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${sortBy === 'date' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Date
                        {sortBy === 'date' && <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                    </button>
                    <button
                        onClick={() => toggleSort('name')}
                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${sortBy === 'name' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Name
                        {sortBy === 'name' && <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {sortedResources.map((resource) => {
                    const Icon = getIcon(resource.link)

                    return (
                        <div key={resource.id} className="group border border-border rounded-xl p-4 transition-all bg-card/30 hover:bg-card/50 flex items-center justify-between gap-4">


                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold truncate group-hover:text-blue-500 transition-colors hover:underline block"
                                    >
                                        {resource.title}
                                    </a>

                                    {resource.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {resource.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 mt-2">
                                        {resource.created_at && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border/50">
                                                <Calendar className="w-3 h-3 opacity-50" />
                                                {format(new Date(resource.created_at), 'MMM d, yyyy')}
                                            </div>
                                        )}

                                        {resource.creator && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                {resource.creator.avatar_url ? (
                                                    <img src={resource.creator.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover border border-border" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center border border-border">
                                                        <User className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                                <span className="truncate max-w-[150px]">{resource.creator.full_name || resource.creator.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {isAdmin && (

                                    <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
                                        <button
                                            onClick={() => { setEditingResource(resource); setIsModalOpen(true) }}
                                            className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resource.id)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <ResourceModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingResource(null) }}
                resourceToEdit={editingResource || undefined}
            />
        </>
    )
}
