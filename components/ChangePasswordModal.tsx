'use client'

import { useState, useActionState, useEffect } from 'react'
import { X, Lock, Save } from 'lucide-react'
import { changePassword } from '@/app/actions/user'

import { Profile } from '@/types'

const initialState = {
    message: '',
    success: false
}

export function ChangePasswordModal({ isOpen, onClose, profile }: { isOpen: boolean, onClose: () => void, profile: Profile | null }) {
    const [state, formAction, isPending] = useActionState(changePassword, initialState)
    const [open, setOpen] = useState(isOpen)

    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    useEffect(() => {
        if (state.success) {
            const timer = setTimeout(() => {
                onClose()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [state.success, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        Change Password
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form action={formAction} id="password-form" className="space-y-4">

                        {/* Profile Info (Read Only) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={profile?.full_name || ''}
                                    readOnly
                                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm outline-none text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={profile?.job_title || profile?.role || ''}
                                    readOnly
                                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm outline-none text-muted-foreground cursor-not-allowed capitalize"
                                />
                            </div>
                        </div>

                        <div className="border-t border-border/50 my-4"></div>

                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                Current Password
                            </label>
                            <input
                                name="currentPassword"
                                type="password"
                                required
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-muted-foreground/30"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                New Password
                            </label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-muted-foreground/30"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-muted-foreground/30"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Messages */}
                        {state.message && (
                            <div className={`p-3 rounded-lg text-sm border ${state.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                {state.message}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full cursor-pointer bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    'Updating...'
                                ) : (
                                    <>
                                        Save New Password
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}
