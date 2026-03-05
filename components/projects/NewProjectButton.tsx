'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ProjectModal } from '@/components/projects/ProjectModal'

export function NewProjectButton({ isAdmin }: { isAdmin?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
                <Plus className="w-4 h-4" />
                New Project
            </button>

            <ProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} isAdmin={isAdmin} />
        </>
    )
}
