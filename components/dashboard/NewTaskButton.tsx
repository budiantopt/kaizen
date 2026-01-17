'use client'

import { useState } from 'react'
import { Task, Project, Profile } from '@/types'
import { Plus } from 'lucide-react'
import { TaskModal } from '@/components/dashboard/TaskModal'

// This component is similar to the one in DashboardClient, but standalone for "All Tasks" page
export function NewTaskButton({ projects, profiles = [] }: { projects: Project[], profiles?: Profile[] }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
                <Plus className="w-4 h-4" />
                New Task
            </button>

            <TaskModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                projects={projects}
                profiles={profiles}
                taskToEdit={null} // Always null for 'New'
            />
        </>
    )
}
