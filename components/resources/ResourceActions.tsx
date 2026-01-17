
'use client'
import { useState } from 'react'
import { Plus, Database } from 'lucide-react'
import { ResourceModal } from './ResourceModal'
import { seedResources } from '@/app/actions/resources'

export function ResourceActions({ isAdmin, hasData }: { isAdmin: boolean, hasData: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSeeding, setIsSeeding] = useState(false)

    const handleSeed = async () => {
        setIsSeeding(true)
        await seedResources()
        setIsSeeding(false)
    }

    if (!isAdmin) return null

    return (
        <div className="flex gap-2">
            {!hasData && (
                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                    <Database className="w-4 h-4" />
                    {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
                </button>
            )}
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-foreground hover:bg-foreground/90 rounded-md transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Resource
            </button>
            <ResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}
