
'use client'

import { useState } from 'react'
import { Pencil, Trash2, FileText } from 'lucide-react'
import { ResourceModal } from './ResourceModal'
import { deleteResource } from '@/app/actions/resources'
import { Resource } from '@/types'

export function ResourceList({ resources, isAdmin }: { resources: Resource[], isAdmin: boolean }) {
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            await deleteResource(id)
        }
    }


    const getIcon = (_url: string) => {
        // User requested: "show all icon for resource as docs"
        return FileText
    }

    return (
        <>
            <div className="flex flex-col gap-3">
                {resources.map((resource) => {
                    const Icon = getIcon(resource.link)

                    return (
                        <div key={resource.id} className="group border border-border rounded-xl p-4 transition-all bg-card/30 hover:bg-card/50 flex items-center justify-between gap-4">


                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-foreground shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold truncate group-hover:text-blue-500 transition-colors hover:underline"
                                    >
                                        {resource.title}
                                    </a>
                                    <p className="text-xs text-muted-foreground truncate">{resource.description || resource.link}</p>
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
