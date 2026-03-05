export type Profile = {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'admin' | 'member'
    job_title: string | null
}

export type Project = {
    id: number
    name: string
    description: string | null
    resource_link?: string | null
    project_value?: number | null
    color_code: string
    icon?: string | null
    start_date?: string | null
    end_date?: string | null
    status: 'active' | 'archived' | 'pinned'
    created_by: string | null
    created_at?: string
    creator?: Profile
}

export type TaskStatus =
    | 'todo'
    | 'in_progress'
    | 'done'
    | 'on_track'
    | 'at_risk'
    | 'off_track'
    | 'on_hold'
    | 'complete'

export type Task = {
    id: number
    title: string
    project_id: number
    // assignee_id is deprecated but might still exist on the type for legacy reasons, 
    // ideally we strictly check 'assignees' array now.
    assignee_id?: string | null
    start_date: string
    end_date: string
    status: TaskStatus
    priority?: 'low' | 'medium' | 'high' | null
    evidence_link: string | null
    remarks: string | null
    created_at: string
    completed_at?: string | null
    // Joined fields
    project?: Project
    // New: Multiple assignees
    assignees?: Profile[]
    // Legacy single (optional)
    assignee?: Profile
}

export type KPI = {
    id: number
    user_id: string
    semester_id: number
    description: string
    target_metric: string | null
    created_at: string
    is_completed?: boolean
}

export type Announcement = {
    id: number
    message: string
    link?: string | null
    link_text?: string | null
    is_active: boolean
    background_color: string
    text_color: string
    icon: string
    created_at: string
}

export type Resource = {
    id: number
    title: string
    link: string
    description?: string | null
    created_at: string
    created_by?: string | null
    creator?: Profile
}
