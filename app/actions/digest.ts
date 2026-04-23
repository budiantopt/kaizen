import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { differenceInCalendarDays, startOfDay, format, isBefore } from 'date-fns'

export async function sendDailyDigestToUsers() {
    const supabase = createAdminClient()
    const { data: members } = await supabase.from('profiles').select('email').eq('digest_enabled', true)
    
    const recipientEmails = new Set<string>()
    if (members) {
        members.forEach(m => recipientEmails.add(m.email))
    }
    
    const results = await Promise.all(
        Array.from(recipientEmails).map(email => sendDailyDigest(email))
    )
    return { success: true, results }
}

export async function sendDailyDigest(recipientEmail: string, forceLeaderboard: boolean = false) {
    const supabase = createAdminClient()
    
    // 1. Fetch all tasks with project and assignee details
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
            *,
            project:projects(name, color_code),
            assignees:task_assignees(
                profile:profiles(id, full_name, avatar_url, role)
            )
        `)

    if (tasksError) {
        console.error('Error fetching tasks for digest:', tasksError)
        return { success: false, error: tasksError.message }
    }

    const today = startOfDay(new Date())
    const isFriday = new Date().getDay() === 5 || forceLeaderboard
    
    // 2. Filter tasks into sections
    const offTrackTasks = tasks?.filter(task => {
        if (['complete', 'done', 'on_hold'].includes(task.status)) return false
        const dueDate = startOfDay(new Date(task.end_date))
        return isBefore(dueDate, today)
    }) || []

    const atRiskTasks = tasks?.filter(task => {
        if (['complete', 'done', 'on_hold'].includes(task.status)) return false
        const dueDate = startOfDay(new Date(task.end_date))
        const diffDays = differenceInCalendarDays(dueDate, today)
        return diffDays >= 0 && diffDays <= 2
    }) || []

    const onHoldTasks = tasks?.filter(task => task.status === 'on_hold') || []

    if (offTrackTasks.length === 0 && atRiskTasks.length === 0 && onHoldTasks.length === 0 && !isFriday) {
        return { success: true, message: 'No tasks to report today.' }
    }

    // 3. Leaderboard calculation (Friday only or Forced)
    let topThree: any[] = []
    if (isFriday) {
        topThree = await calculateLeaderboard(supabase)
    }

    // 4. Generate HTML Content
    const emailHtml = generateDigestHtml(offTrackTasks, atRiskTasks, onHoldTasks, topThree)

    // 5. Send Email via Resend
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing')
        return { success: false, error: 'RESEND_API_KEY is missing' }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error: emailError } = await resend.emails.send({
        from: 'Kaizen <digest@kaizenapp.space>',
        to: recipientEmail,
        subject: `Daily Digest - ${format(new Date(), 'EEEE, MMM d')}`,
        html: emailHtml
    })

    if (emailError) {
        console.error('Error sending email:', emailError)
        return { success: false, error: emailError.message }
    }

    return { success: true, data }
}

async function calculateLeaderboard(supabase: any) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const isFirstSem = now.getMonth() < 6
    const semStart = `${currentYear}-${isFirstSem ? '01' : '07'}-01`
    const semEnd = `${currentYear}-${isFirstSem ? '06' : '12'}-${isFirstSem ? '30' : '31'}`

    const { data: teamTasks } = await supabase
        .from('tasks')
        .select(`*, assignees:task_assignees(user_id)`)
        .gte('end_date', semStart)
        .lte('end_date', semEnd)

    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url, role').neq('role', 'admin')

    const userStats: Record<string, { points: number }> = {}

    teamTasks?.forEach((task: any) => {
        let points = 0
        const isCompleted = task.status === 'done' || task.status === 'complete'
        if (isCompleted) {
            const completionDate = task.completed_at || task.updated_at
            if (completionDate && task.end_date) {
                const completedAt = new Date(completionDate)
                const dueDate = new Date(task.end_date)
                dueDate.setHours(23, 59, 59, 999)
                points = completedAt <= dueDate ? 2 : 1
            } else {
                points = 1
            }
        } else if (task.status === 'off_track') {
            points = -1
        }

        if (points !== 0) {
            task.assignees?.forEach((a: any) => {
                const uid = a.user_id
                if (!userStats[uid]) userStats[uid] = { points: 0 }
                userStats[uid].points += points
            })
        }
    })

    return Object.entries(userStats)
        .filter(([uid]) => profiles?.some((p: any) => p.id === uid))
        .map(([uid, stats]) => {
            const profile = profiles?.find((p: any) => p.id === uid)
            return {
                name: profile?.full_name || 'Unknown',
                avatar: profile?.avatar_url,
                points: stats.points
            }
        }).sort((a: any, b: any) => b.points - a.points).slice(0, 3)
}

function generateDigestHtml(offTrack: any[], atRisk: any[], onHold: any[], topThree: any[]) {
    const today = new Date()
    const baseUrl = 'https://www.kaizenapp.space'
    const weekDisplay = format(today, "'W'w ''yy") // e.g. W11 '26

    const renderLeaderboard = () => {
        if (!topThree || topThree.length === 0) return ''
        
        return `
            <div style="margin-bottom: 45px; text-align: left;">
                <h2 style="margin: 0 0 15px 0; font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em;">
                    🏆 ${weekDisplay} LEADERBOARD
                </h2>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; width: 100%; max-width: 400px;">
                    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
                        <tbody>
                            ${topThree.map((user, idx) => {
                                const isFirst = idx === 0;
                                const rowBg = isFirst ? '#f8fafc' : '#ffffff';
                                const rankColor = isFirst ? '#f59e0b' : '#94a3b8';
                                const borderBottom = idx === topThree.length - 1 ? 'none' : '1px solid #f1f5f9';

                                return `
                                    <tr style="background-color: ${rowBg};">
                                        <td style="padding: 16px 20px; border-bottom: ${borderBottom}; width: 50px; text-align: center;">
                                            <span style="font-size: 14px; font-weight: 950; color: ${rankColor};">${idx + 1}</span>
                                        </td>
                                        <td style="padding: 16px 0; border-bottom: ${borderBottom};">
                                            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${user.name.split(' ')[0]}</div>
                                        </td>
                                        <td style="padding: 16px 20px; border-bottom: ${borderBottom}; text-align: right;">
                                            <div style="font-size: 11px; font-weight: 800; color: #0f172a; background: ${isFirst ? '#fef3c7' : '#f1f5f9'}; padding: 4px 10px; border-radius: 20px; display: inline-block; min-width: 60px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">
                                                ${user.points} EXP
                                            </div>
                                        </td>
                                    </tr>
                                `
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `
    }

    const renderTable = (tasks: any[], title: string, titleColor: string) => {
        if (tasks.length === 0) return ''

        return `
            <div style="margin-bottom: 35px;">
                <h2 style="color: ${titleColor}; font-family: sans-serif; margin-bottom: 12px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${title}
                </h2>
                <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-family: sans-serif; border-radius: 10px; overflow: hidden; background-color: #ffffff; border: 1px solid #e2e8f0;">
                    <thead>
                        <tr style="background-color: #f8fafc; text-align: left;">
                            <th style="padding: 12px 15px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; width: 22%;">Project</th>
                            <th style="padding: 12px 15px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; width: 42%;">Task</th>
                            <th style="padding: 12px 15px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; width: 20%;">Due Date</th>
                            <th style="padding: 12px 15px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; width: 16%;">Assignee</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map((task, idx) => {
                            const dueDate = startOfDay(new Date(task.end_date))
                            const diffDays = differenceInCalendarDays(startOfDay(new Date()), dueDate)
                            
                            let dueLabel = format(dueDate, 'MMM dd')
                            if (diffDays > 0) {
                                dueLabel += ` (past ${diffDays}d)`
                            } else if (diffDays === 0) {
                                dueLabel += ` (Today)`
                            } else if (diffDays === -1) {
                                dueLabel += ` (Tomorrow)`
                            }

                            const assignees = task.assignees || []
                            let assigneeLabel = '-'
                            if (assignees.length > 0) {
                                assigneeLabel = assignees.map((a: any) => a.profile?.full_name?.split(' ')[0] || '-').slice(0, 2).join(', ')
                                if (assignees.length > 2) assigneeLabel += '..'
                            }

                            const isLast = idx === tasks.length - 1;
                            const borderBottom = isLast ? 'none' : '1px solid #f1f5f9';

                            return `
                                <tr>
                                    <td style="padding: 12px 15px; font-size: 13px; color: #475569; border-bottom: ${borderBottom}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">
                                        ${task.project?.name || 'No Project'}
                                    </td>
                                    <td style="padding: 12px 15px; font-size: 13px; border-bottom: ${borderBottom};">
                                        <a href="${baseUrl}/dashboard?taskId=${task.id}" style="color: #0f172a; text-decoration: underline; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">
                                            ${task.title}
                                        </a>
                                    </td>
                                    <td style="padding: 12px 15px; font-size: 12px; color: ${diffDays > 0 ? '#ef4444' : '#64748b'}; border-bottom: ${borderBottom};">
                                        ${dueLabel}
                                    </td>
                                    <td style="padding: 12px 15px; font-size: 13px; color: #475569; border-bottom: ${borderBottom};">
                                        ${assigneeLabel}
                                    </td>
                                </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="background-color: #ffffff; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <div style="max-width: 750px; margin: 0 auto; color: #1e293b;">
                <div style="padding: 15px 0; border-bottom: 2px solid #f1f5f9; margin-bottom: 25px; text-align: left;">
                    <div style="font-size: 22px; font-weight: 900; color: #020617; letter-spacing: -0.05em;">
                        KAIZEN <span style="font-weight: 300; color: #94a3b8;">DIGEST</span>
                    </div>
                </div>

                ${renderLeaderboard()}

                ${renderTable(offTrack, 'OFF TRACK', '#ef4444')}
                ${renderTable(atRisk, 'AT RISK', '#f59e0b')}
                ${renderTable(onHold, 'ON HOLD', '#64748b')}

                <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px;">
                        © 2026 Kaizen App
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
}
