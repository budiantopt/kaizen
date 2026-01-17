'use client'


import { useActionState, useState } from 'react'
import { upsertAnnouncement } from '@/app/actions/announcements'
import { Announcement } from '@/types'

const initialState = {
    message: '',
    errors: {} as any,
    success: false
}


import { Info, CheckCircle, AlertTriangle, XCircle, Check } from 'lucide-react'


const PRESETS = [
    { name: 'Info', value: 'blue', bg: '#3b82f6', text: '#ffffff', icon: 'info' }, // Blue-500, White
    { name: 'Success', value: 'green', bg: '#22c55e', text: '#ffffff', icon: 'check-circle' }, // Green-500, White
    { name: 'Warning', value: 'yellow', bg: '#eab308', text: '#ffffff', icon: 'alert-triangle' }, // Yellow-500, White
    { name: 'Alert', value: 'red', bg: '#ef4444', text: '#ffffff', icon: 'x-circle' }, // Red-500, White
]



export function AnnouncementForm({ activeAnnouncement }: { activeAnnouncement: Announcement | null }) {
    const [state, formAction, isPending] = useActionState(upsertAnnouncement, initialState)

    // Find the matching preset based on icon or fallback to first
    const initialPreset = PRESETS.find(p => p.icon === activeAnnouncement?.icon) || PRESETS[0]
    const [selectedPreset, setSelectedPreset] = useState(initialPreset)

    const handlePresetChange = (preset: typeof PRESETS[0]) => {
        setSelectedPreset(preset)
    }

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <input
                    name="message"
                    type="text"
                    required
                    defaultValue={activeAnnouncement?.message}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                    placeholder="e.g. Upcoming Maintenance this Saturday..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input
                        name="link"
                        type="text"
                        defaultValue={activeAnnouncement?.link || ''}
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                        placeholder="https://..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Link Text</label>
                    <input
                        name="link_text"
                        type="text"
                        defaultValue={activeAnnouncement?.link_text || ''}
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
                        placeholder="Learn more"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Announcement Type</label>
                <div className="flex gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => handlePresetChange(preset)}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all min-w-[80px] ${selectedPreset.value === preset.value ? 'ring-2 ring-primary border-transparent bg-secondary' : 'border-border hover:bg-secondary/50'}`}
                        >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.bg, color: preset.text }}>
                                {preset.icon === 'info' && <Info className="w-4 h-4" />}
                                {preset.icon === 'check-circle' && <CheckCircle className="w-4 h-4" />}
                                {preset.icon === 'alert-triangle' && <AlertTriangle className="w-4 h-4" />}
                                {preset.icon === 'x-circle' && <XCircle className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-medium">{preset.name}</span>
                        </button>
                    ))}
                </div>
                {/* Hidden inputs to submit color values */}
                <input type="hidden" name="background_color" value={selectedPreset.bg} />
                <input type="hidden" name="text_color" value={selectedPreset.text} />
                <input type="hidden" name="icon" value={selectedPreset.icon} />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    defaultChecked={activeAnnouncement?.is_active}
                    className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active (Visible to Users)</label>
            </div>

            {state.message && (
                <p className={`text-sm p-2 rounded ${state.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {state.message}
                </p>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 w-full"
                >
                    {isPending ? 'Saving...' : 'Update Announcement'}
                </button>
            </div>
        </form>
    )
}

