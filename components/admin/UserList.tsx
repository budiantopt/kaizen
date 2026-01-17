'use client'

import { useActionState, useState, useEffect, useTransition } from 'react'
import { updateUserRole, resetUserPassword, createUser } from '@/app/actions/users'
import { Profile } from '@/types'

const initialState = {
    message: '',
    success: false
}

export function UserList({ profiles }: { profiles: Profile[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [credentialModal, setCredentialModal] = useState<{ email: string, password: string, name: string } | null>(null)

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden relative">
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-bold">Add New User</h3>
                            <button onClick={() => setIsCreating(false)} className="cursor-pointer text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <CreateUserForm onCancel={() => setIsCreating(false)} />
                    </div>
                </div>
            )}

            {credentialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl p-6 space-y-4">
                        <h3 className="text-xl font-bold">User Credentials</h3>
                        <p className="text-muted-foreground text-sm">
                            These credentials have been sent to <strong>{credentialModal.email}</strong> via email.
                        </p>
                        <div className="bg-secondary/50 p-4 rounded-lg space-y-2 border border-border text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{credentialModal.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{credentialModal.email}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/50">
                                <span className="text-muted-foreground">Password:</span>
                                <div className="flex items-center gap-2">
                                    <code className="bg-black text-white px-2 py-1 rounded select-all font-mono">{credentialModal.password}</code>
                                    <button
                                        onClick={(e) => {
                                            navigator.clipboard.writeText(`Email: ${credentialModal.email}\nPassword: ${credentialModal.password}`)
                                            const target = e.currentTarget
                                            const originalText = target.innerText
                                            target.innerText = 'Copied!'
                                            setTimeout(() => target.innerText = originalText, 2000)
                                        }}
                                        className="cursor-pointer text-xs border border-border bg-background px-2 py-1 rounded hover:bg-muted transition-colors font-medium"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setCredentialModal(null)} className="cursor-pointer w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90">
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 className="font-bold">User Management</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="cursor-pointer text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity shadow-sm"
                >
                    Add User
                </button>
            </div>

            {/* Removed inline CreateForm */}

            <div className="divide-y divide-border">
                {profiles.map(profile => (
                    <UserRow
                        key={profile.id}
                        profile={profile}
                        isEditing={editingId === profile.id}
                        onEdit={() => setEditingId(profile.id)}
                        onCancel={() => setEditingId(null)}
                        onOnboard={(creds) => setCredentialModal(creds)}
                    />
                ))}
            </div>
        </div>
    )
}

function CreateUserForm({ onCancel }: { onCancel: () => void }) {
    const [state, formAction, isPending] = useActionState(createUser, initialState)

    useEffect(() => {
        if (state.success) onCancel()
    }, [state.success, onCancel])

    return (
        <form action={formAction} className="p-6 space-y-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Create Account For</label>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="full_name" placeholder="Full Name" required className="cursor-text text-sm p-2.5 rounded-md border border-border bg-background w-full" />
                        <input name="email" type="email" placeholder="Email Address" required className="cursor-text text-sm p-2.5 rounded-md border border-border bg-background w-full" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Role</label>
                        <select name="role" className="cursor-pointer text-sm p-2.5 rounded-md border border-border bg-background w-full appearance-none">
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Job Title</label>
                        <input name="job_title" placeholder="Job Title" className="cursor-text text-sm p-2.5 rounded-md border border-border bg-background w-full" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={isPending} className="cursor-pointer text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-90">
                    {isPending ? 'Creating...' : 'Create User'}
                </button>
            </div>
            {state.message && <div className="p-3 bg-red-500/10 text-red-500 rounded-md text-xs">{state.message}</div>}
        </form>
    )
}

function UserRow({ profile, isEditing, onEdit, onCancel, onOnboard }: { profile: Profile, isEditing: boolean, onEdit: () => void, onCancel: () => void, onOnboard: (creds: any) => void }) {
    const [state, formAction, isPending] = useActionState(updateUserRole, initialState)
    const [isResetPending, startReset] = useTransition()

    const handleOnboard = () => {
        if (!confirm(`Are you sure you want to reset credentials for ${profile.full_name} and send onboarding email?`)) return

        startReset(async () => {
            const result = await resetUserPassword(profile.id, profile.email, profile.full_name || 'User', profile.job_title || undefined)
            if (result.success) {
                onOnboard({ email: profile.email, password: result.newPassword, name: profile.full_name || 'User' })
            } else {
                alert(result.message)
            }
        })
    }

    useEffect(() => {
        if (state.success) {
            onCancel()
        }
    }, [state.success, onCancel])

    if (isEditing) {
        return (
            <form action={formAction} className="p-4 flex items-center gap-4 bg-secondary/20">
                <input type="hidden" name="userId" value={profile.id} />
                <div className="flex-1">
                    <p className="font-medium text-sm">{profile.full_name || 'No Name'}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <div className="w-[150px]">
                    <input
                        name="job_title"
                        defaultValue={profile.job_title || ''}
                        placeholder="Job Title"
                        className="w-full text-xs p-1 rounded border bg-background"
                    />
                </div>
                <div className="w-[100px]">
                    <select name="role" defaultValue={profile.role === 'admin' ? 'admin' : 'member'} className="w-full text-xs p-1 rounded border bg-background">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex gap-2 items-center">
                    {state.message && <span className="text-red-500 text-[10px]">{state.message}</span>}
                    <button type="submit" disabled={isPending} className="text-xs bg-white text-black px-2 py-1 rounded font-medium">
                        {isPending ? 'Saving' : 'Save'}
                    </button>
                    <button type="button" onClick={onCancel} className="text-xs px-2 py-1 rounded hover:bg-muted">Cancel</button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-4 flex items-center justify-between hover:bg-muted/20">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{profile.full_name || 'No Name'}</p>
                    {profile.role === 'admin' && <span className="text-[10px] bg-red-500/20 text-red-500 px-1 rounded">ADMIN</span>}
                </div>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <div className="w-[150px] text-xs text-muted-foreground">
                {profile.job_title || '-'}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleOnboard}
                    disabled={isResetPending}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                    {isResetPending ? 'Sending...' : 'Onboard User'}
                </button>
                <button onClick={onEdit} className="text-xs border px-3 py-1 rounded hover:bg-secondary transition-colors">
                    Edit
                </button>
            </div>
        </div>
    )
}
