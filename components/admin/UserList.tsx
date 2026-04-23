'use client'

import { useActionState, useState, useEffect, useTransition } from 'react'
import { updateUserRole, resetUserPassword, createUser, deleteUser } from '@/app/actions/users'
import { Profile } from '@/types'

const initialState = {
    message: '',
    success: false
}

export function UserList({ profiles }: { profiles: Profile[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [credentialModal, setCredentialModal] = useState<{ email: string, password: string, name: string } | null>(null)
    const [changePasswordUser, setChangePasswordUser] = useState<Profile | null>(null)
    const [manageGoalsUser, setManageGoalsUser] = useState<Profile | null>(null)

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

            {changePasswordUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-bold">Change Password</h3>
                            <button onClick={() => setChangePasswordUser(null)} className="cursor-pointer text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <ChangePasswordForm profile={changePasswordUser} onCancel={() => setChangePasswordUser(null)} />
                    </div>
                </div>
            )}

            {manageGoalsUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
                            <div>
                                <h3 className="font-bold">Semester Goals</h3>
                                <p className="text-xs text-muted-foreground">Manage goals for {manageGoalsUser.full_name}</p>
                            </div>
                            <button onClick={() => setManageGoalsUser(null)} className="cursor-pointer text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="overflow-y-auto p-0">
                            <GoalsManager userId={manageGoalsUser.id} />
                        </div>
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
                        onChangePassword={() => setChangePasswordUser(profile)}
                        onManageGoals={() => setManageGoalsUser(profile)}
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

function ChangePasswordForm({ profile, onCancel }: { profile: Profile, onCancel: () => void }) {
    // We will create a new action for manual password change
    const [state, formAction, isPending] = useActionState(updateUserPassword, initialState)

    useEffect(() => {
        if (state.success) {
            alert('Password changed successfully')
            onCancel()
        }
    }, [state.success, onCancel])

    return (
        <form action={formAction} className="p-6 space-y-4">
            <input type="hidden" name="userId" value={profile.id} />
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">New Password</label>
                <input name="password" type="password" minLength={6} placeholder="Enter new password" required className="cursor-text text-sm p-2.5 rounded-md border border-border bg-background w-full" />
                <p className="text-[10px] text-muted-foreground">Minimum 6 characters.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={isPending} className="cursor-pointer text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-90">
                    {isPending ? 'Saving...' : 'Change Password'}
                </button>
            </div>
            {state.message && <div className="p-3 bg-red-500/10 text-red-500 rounded-md text-xs">{state.message}</div>}
        </form>
    )
}

import { createKpi, deleteKpi, toggleKpiStatus } from '@/app/actions/kpis'
import { createClient } from '@/lib/supabase/client'
import { Check, Trash2, Key, Target, UserX, Mail } from 'lucide-react'
import { KPI } from '@/types'

function GoalsManager({ userId }: { userId: string }) {
    const [kpis, setKpis] = useState<KPI[]>([])
    const [loading, setLoading] = useState(true)
    const [newGoal, setNewGoal] = useState('')
    const [newTarget, setNewTarget] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    const fetchKpis = async () => {
        const { data } = await supabase.from('kpis').select('*').eq('user_id', userId).order('created_at', { ascending: true })
        if (data) setKpis(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchKpis()
    }, [userId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGoal) return
        const result = await createKpi(userId, newGoal, newTarget)
        if (!result.success) {
            alert(result.message)
        } else {
            setNewGoal('')
            setNewTarget('')
            await fetchKpis()
        }
        setIsSubmitting(false)
    }

    const handleToggle = async (id: number, currentStatus: boolean | undefined) => {
        // Optimistic update
        setKpis(kpis.map(k => k.id === id ? { ...k, is_completed: !currentStatus } : k))
        await toggleKpiStatus(id, !currentStatus)
        await fetchKpis() // Refresh to be safe
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this goal?')) return
        setKpis(kpis.filter(k => k.id !== id))
        await deleteKpi(id)
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading goals...</div>

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {kpis.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        No goals assigned yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {kpis.map(kpi => (
                            <div key={kpi.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border border-border group">
                                <button
                                    onClick={() => handleToggle(kpi.id, kpi.is_completed)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${kpi.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground hover:border-primary'}`}
                                >
                                    {kpi.is_completed && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${kpi.is_completed ? 'line-through text-muted-foreground' : ''}`}>{kpi.description}</p>
                                    {kpi.target_metric && <p className="text-xs text-muted-foreground">{kpi.target_metric}</p>}
                                </div>
                                <button onClick={() => handleDelete(kpi.id)} className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleAdd} className="p-4 bg-muted/30 border-t border-border mt-auto">
                <div className="flex gap-2">
                    <input
                        value={newGoal}
                        onChange={e => setNewGoal(e.target.value)}
                        placeholder="Add new goal..."
                        className="flex-1 text-sm p-2 rounded border border-border bg-background"
                        required
                    />
                    <input
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                        placeholder="Target (optional)"
                        className="w-1/3 text-sm p-2 rounded border border-border bg-background"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    )
}

// Add to imports
import { updateUserPassword, toggleUserDigest } from '@/app/actions/users'

function UserRow({ profile, isEditing, onEdit, onCancel, onOnboard, onChangePassword, onManageGoals }: UserRowProps) {
    const [isPending, startTransition] = useTransition()
    const [errorMessage, setErrorMessage] = useState('')
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

    const handleDeleteUser = async () => {
        if (!confirm(`Are you absolutely sure you want to permanently delete the user ${profile.full_name || profile.email}? This cannot be undone.`)) return

        const result = await deleteUser(profile.id)
        if (!result.success) {
            alert(result.message)
        } else {
            // It will revalidate and refresh the list
        }
    }

    const handleSave = (formData: FormData) => {
        setErrorMessage('')
        startTransition(async () => {
            const result = await updateUserRole(initialState, formData)
            if (result?.success) {
                onCancel()
            } else if (result?.message) {
                setErrorMessage(result.message)
            }
        })
    }

    if (isEditing) {
        return (
            <form action={handleSave} className="p-4 flex items-center gap-4 bg-secondary/20">
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
                <div className="w-[100px]">
                    <select name="digest_enabled" defaultValue={(profile.digest_enabled ?? true) ? 'true' : 'false'} className="w-full text-xs p-1 rounded border bg-background">
                        <option value="true">Digest On</option>
                        <option value="false">Digest Off</option>
                    </select>
                </div>
                <div className="flex gap-2 items-center">
                    {errorMessage && <span className="text-red-500 text-[10px]">{errorMessage}</span>}
                    <button type="submit" disabled={isPending} className="text-xs bg-white text-black px-2 py-1 rounded font-medium disabled:opacity-50">
                        {isPending ? 'Saving' : 'Save'}
                    </button>
                    <button type="button" onClick={onCancel} disabled={isPending} className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-50">Cancel</button>
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
                    onClick={onManageGoals}
                    className="text-xs flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80 transition-colors font-medium border border-border"
                    title="Manage Goals"
                >
                    <Target className="w-3.5 h-3.5" />
                    Goals
                </button>
                <button
                    onClick={onChangePassword}
                    className="text-xs flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80 transition-colors font-medium border border-border"
                    title="Change Password"
                >
                    <Key className="w-3.5 h-3.5" />
                    Change Password
                </button>
                <div className="flex items-center gap-1 px-2 border border-border rounded py-1 bg-muted/10 cursor-default" title="Email Digest Status">
                    <Mail className={`w-3 h-3 ${(profile.digest_enabled ?? true) ? 'text-green-500' : 'opacity-40'}`} />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {(profile.digest_enabled ?? true) ? 'ON' : 'OFF'}
                    </span>
                </div>
                <div className="w-[1px] bg-border mx-1 h-6 self-center"></div>
                <button
                    onClick={handleOnboard}
                    disabled={isResetPending}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                    {isResetPending ? 'Sending...' : 'Reset'}
                </button>
                <button onClick={onEdit} className="text-xs border px-3 py-1 rounded hover:bg-secondary transition-colors">
                    Edit
                </button>
                <button onClick={handleDeleteUser} className="text-xs border border-red-500/30 text-red-500 hover:bg-red-500/10 px-2 py-1 rounded transition-colors" title="Delete User">
                    <UserX className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
// Add props types
type UserRowProps = {
    profile: Profile,
    isEditing: boolean,
    onEdit: () => void,
    onCancel: () => void,
    onOnboard: (creds: any) => void,
    onChangePassword: () => void,
    onManageGoals: () => void
}
