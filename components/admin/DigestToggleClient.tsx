'use client'

import { useState } from 'react'
import { updateSetting } from '@/app/actions/settings'
import { Loader2 } from 'lucide-react'

export function DigestToggleClient({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [isLoading, setIsLoading] = useState(false)

    async function handleToggle() {
        setIsLoading(true)
        try {
            const nextValue = !enabled
            await updateSetting('digest_email_enabled', nextValue)
            setEnabled(nextValue)
        } catch (error) {
            console.error('Failed to update setting:', error)
            alert('Failed to update setting')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border mt-4">
            <div className="mr-4">
                <h4 className="text-sm font-semibold">Daily Digest Email</h4>
                <p className="text-xs text-muted-foreground mt-1">
                    Send automated daily summaries of tasks to all members.
                </p>
            </div>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${enabled ? 'bg-green-600' : 'bg-neutral-600'}`}
            >
                <span className="sr-only">Enable Digest</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                    </div>
                )}
            </button>
        </div>
    )
}
