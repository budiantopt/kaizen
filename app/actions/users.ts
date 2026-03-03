'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Resend } from 'resend'

const updateUserSchema = z.object({
    userId: z.string(),
    role: z.string(),
    job_title: z.string().optional()
})

const createUserSchema = z.object({
    email: z.string().email(),
    full_name: z.string().min(1),
    role: z.string(),
    job_title: z.string().optional()
})

export async function createUser(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return { message: 'Unauthorized', success: false }

    const rawData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        job_title: formData.get('job_title')
    }

    const validated = createUserSchema.safeParse(rawData)
    if (!validated.success) return { message: 'Invalid data', success: false }

    const { email, full_name, role, job_title } = validated.data
    const tempPassword = generatePassword()

    // Use Admin Client to create user in Auth
    let supabaseAdmin
    try {
        supabaseAdmin = createAdminClient()
    } catch (e: any) {
        return { message: "Server config error: " + e.message, success: false }
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto confirm
        user_metadata: { full_name: full_name }
    })

    if (createError) return { message: 'Failed to create user: ' + createError.message, success: false }

    if (newUser.user) {
        // Create Profile (Trigger might do this, but we want to set role/title explicitly)
        // Usually trigger sets default. We update it.
        // Wait, typical trigger: insert on profiles when user is created.
        // We should wait or upsert.
        // Let's upsert to be safe.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email: email,
                full_name: full_name,
                role: role as 'admin' | 'member',
                job_title: job_title
            })

        if (profileError) console.error("Profile update error", profileError) // Log but don't fail, user is created.

        // Send Email with credentials
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY)
            await resend.emails.send({
                from: 'Kaizen Admin <admin@kaizenapp.space>',
                to: email,
                subject: 'Welcome to Kaizen - Your Account',
                html: `
                    <h1>Welcome to Kaizen</h1>
                    <p>An account has been created for you.</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> <code>${tempPassword}</code></p>
                    <p>Please log in and change your password.</p>
                `
            })
        }
    }

    revalidatePath('/admin')
    return { message: 'User created successfully', success: true }
}

export async function updateUserRole(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Admin Check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        return { message: 'Unauthorized' }
    }

    const rawData = {
        userId: formData.get('userId'),
        role: formData.get('role'),
        job_title: formData.get('job_title')
    }

    const validated = updateUserSchema.safeParse(rawData)

    if (!validated.success) {
        return { message: 'Invalid data' }
    }

    const { userId, role, job_title } = validated.data

    const { error } = await supabase
        .from('profiles')
        .update({ role, job_title })
        .eq('id', userId)

    if (error) return { message: 'Failed: ' + error.message }

    revalidatePath('/', 'layout')
    revalidatePath('/admin')
    return { message: 'User Updated', success: true }
}

const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function resetUserPassword(userId: string, email: string, name: string, title?: string) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    // Admin Check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        return { message: 'Unauthorized', success: false }
    }

    const newPassword = generatePassword()

    let supabaseAdmin
    try {
        supabaseAdmin = createAdminClient()
    } catch (e: any) {
        console.error("Admin Client Creation Failed:", e)
        return { message: "Server configuration error: " + e.message, success: false }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
    })

    if (updateError) return { message: 'Update failed: ' + updateError.message, success: false }

    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY")
        return { message: "Server configuration error: Missing Email API Key. Please add RESEND_API_KEY to .env.local", success: false }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error: emailError } = await resend.emails.send({
        from: 'Kaizen Admin <admin@kaizenapp.space>',
        to: email,
        subject: 'Your Kaizen Account Credentials',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #000;">Welcome to Kaizen</h1>
                <p>Hello ${name},</p>
                <p>Here are your login credentials for Kaizen. The administrator has reset your password to onboard you.</p>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 15px 0 5px 0; font-size: 18px;"><strong>Temporary Password:</strong></p>
                    <code style="background: #000; color: #fff; padding: 8px 12px; border-radius: 4px; font-size: 16px; display: inline-block;">${newPassword}</code>
                </div>
                <p>Please log in and change your password immediately.</p>
            </div>
        `
    })

    if (emailError) return { message: 'Email failed: ' + emailError.message, success: false }

    return { message: 'Password reset and emailed', success: true, newPassword }
}

export async function updateUserPassword(prevState: any, formData: FormData) {
    const userId = formData.get('userId') as string
    const password = formData.get('password') as string

    if (!userId || !password) return { message: 'Missing required fields', success: false }
    if (password.length < 6) return { message: 'Password too short', success: false }

    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized', success: false }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { message: 'Unauthorized', success: false }

    let supabaseAdmin
    try {
        supabaseAdmin = createAdminClient()
    } catch (e: any) {
        return { message: "Server config error: " + e.message, success: false }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password
    })

    if (error) return { message: 'Failed to update password: ' + error.message, success: false }

    return { message: 'Password updated successfully', success: true }
}
