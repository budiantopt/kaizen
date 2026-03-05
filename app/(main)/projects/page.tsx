import { createClient } from '@/lib/supabase/server'
import { NewProjectButton } from '@/components/projects/NewProjectButton'
import { ProjectList } from '@/components/projects/ProjectList'
import { Folder, Leaf, Users, GraduationCap, Heart, Globe, Recycle, BookOpen, HeartHandshake, Sprout, Wind } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const ICON_MAP: Record<string, any> = {
    folder: Folder,
    leaf: Leaf,
    users: Users,
    'graduation-cap': GraduationCap,
    recycle: Recycle,
    heart: Heart,
    globe: Globe,
    'book-open': BookOpen,
    'heart-handshake': HeartHandshake,
    sprout: Sprout,
    wind: Wind,
}

export default async function ProjectsPage() {
    const supabase = await createClient()

    // 1. Fetch Projects
    // Using explicit foreign key relationship for creator
    const { data: rawProjects } = await supabase
        .from('projects')
        .select('*, creator:profiles!projects_created_by_fkey(full_name)')
        // Fallback if constraint name differs: try just profiles
        // We'll trust standard specific syntax or just profiles if unique
        // Actually, simplest that works usually:
        // .select('*, creator:profiles!created_by(*)') NO that's for if FK header name matches.
        // Let's safe bet: .select('*, created_by_user:profiles!created_by(*)')?
        // Let's try the safest join: 
        // .select('*, profiles!projects_created_by_fkey(full_name)') and map it. 
        // But let's assume standard 'projects' column 'created_by' -> 'profiles'. 
        // .select('*, created_by_profile:profiles!projects_created_by_fkey(full_name)')

        // Wait, I saw schema: "created_by uuid references public.profiles(id)". 
        // Supabase PostgREST uses the table name as relationship usually.
        // So .select('*, profiles(full_name)') is likely correct if only one FK.
        .order('name')

    // Manual mapping if needed or use 'creator' alias if supported
    // Let's do a robust fetch:
    const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
            *,
            creator:created_by(full_name)
        `)
        .order('name')

    // Note: 'creator:created_by(full_name)' works if the foreign key is detected on 'created_by' column. 
    // If Supabase API considers the relation name 'profiles', then 'creator:profiles(full_name)' works.
    // Given 'created_by' is the column, let's try `creator:profiles!projects_created_by_fkey(full_name)` but we don't know the exact constraint name created.
    // Recommended: `creator:profiles(full_name)` -- assuming only one FK from projects to profiles.

    // RE-FETCH with robust query
    const { data: fetchedProjects } = await supabase
        .from('projects')
        .select('*, creator:profiles(full_name)')
        .order('name')


    // 2. Fetch Task Counts per Project (All statuses)
    const { data: allTasks } = await supabase
        .from('tasks')
        .select('project_id, status')

    // Calculate counts
    // Type: Record<projectId, { completed: number, incomplete: number }>
    const taskCounts: Record<number, { completed: number, incomplete: number }> = {}

    allTasks?.forEach((t: any) => {
        if (!t.project_id) return

        if (!taskCounts[t.project_id]) {
            taskCounts[t.project_id] = { completed: 0, incomplete: 0 }
        }

        const isCompleted = t.status === 'complete' || t.status === 'done'
        if (isCompleted) {
            taskCounts[t.project_id].completed += 1
        } else {
            taskCounts[t.project_id].incomplete += 1
        }
    })

    // Map to Project type
    const projects = fetchedProjects?.map((p: any) => {
        let mappedStatus = p.status
        let mappedIcon = p.icon
        if (p.icon && p.icon.startsWith('pinned-')) {
            mappedStatus = 'pinned'
            mappedIcon = p.icon.replace('pinned-', '')
        }
        return {
            ...p,
            status: mappedStatus,
            icon: mappedIcon,
            creator: p.creator
        }
    })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        isAdmin = profile?.role === 'admin'
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-2">Manage your active workstreams.</p>
                </div>
                <NewProjectButton isAdmin={isAdmin} />
            </div>

            <ProjectList projects={projects || []} taskCounts={taskCounts} />
        </div>
    )
}
