'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePassword(prevState: any, formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { message: 'All fields are required', success: false }
    }

    if (newPassword !== confirmPassword) {
        return { message: 'New passwords do not match', success: false }
    }

    if (newPassword.length < 6) {
        return { message: 'Password must be at least 6 characters', success: false }
    }

    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user || !user.email) {
        return { message: 'Not authenticated', success: false }
    }

    // 2. Verify old password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    })

    if (signInError) {
        return { message: 'Incorrect current password', success: false }
    }

    // 3. Update password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        return { message: 'Failed to update password: ' + updateError.message, success: false }
    }

    revalidatePath('/')
    return { message: 'Password updated successfully', success: true }
}
