
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { upsertResource } from '@/app/actions/resources'
import { useFormStatus } from 'react-dom'
import { Resource } from '@/types'

interface ResourceModalProps {
    isOpen: boolean
    onClose: () => void
    resourceToEdit?: Resource
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
            {pending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Resource')}
        </button>
    )
}

export function ResourceModal({ isOpen, onClose, resourceToEdit }: ResourceModalProps) {
    const [state, setState] = useState<{ success?: boolean; message?: string; errors?: Record<string, string[] | undefined> } | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (formData: FormData) => {
        const result = await upsertResource(state, formData)
        if (result?.success) {
            onClose()
        }
        setState(result)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold mb-4">{resourceToEdit ? 'Edit Resource' : 'Add Resource'}</h2>

                <form action={handleSubmit} className="space-y-4">
                    {resourceToEdit && <input type="hidden" name="id" value={resourceToEdit.id} />}

                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            defaultValue={resourceToEdit?.title}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground"
                            placeholder="Resource Title"
                        />
                        {state?.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Link URL</label>
                        <input
                            name="link"
                            type="url"
                            required
                            defaultValue={resourceToEdit?.link}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground"
                            placeholder="https://example.com"
                        />
                        {state?.errors?.link && <p className="text-red-500 text-xs mt-1">{state.errors.link}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            defaultValue={resourceToEdit?.description || ''}
                            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none resize-none focus:ring-1 focus:ring-foreground"
                            placeholder="Brief description..."
                            rows={3}
                        />
                    </div>

                    {state?.message && !state?.success && (
                        <p className="text-red-500 text-sm">{state.message}</p>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <SubmitButton isEdit={!!resourceToEdit} />
                    </div>
                </form>
            </div>
        </div>
    )
}
