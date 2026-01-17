# Focus App Implementation Plan

This document outlines the step-by-step process to build the "Focus" project management platform with all requested features.

## Phase 1: Foundation & Authentication
- [ ] **Database Setup**: Ensure `supabase/schema.sql` is executed in the Supabase SQL Editor.
- [ ] **Environment Variables**: Verify `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] **Supabase Client**: Ensure `lib/supabase/client.ts` and `server.ts` (if needed) are correctly set up.
- [ ] **Middleware**: Create `middleware.ts` to handle session refreshing and route protection.
- [ ] **Auth Pages**:
    - Build `app/login/page.tsx` with email/password or magic link login.
    - Build `app/auth/callback/route.ts` for handling auth redirects.

## Phase 2: Core Data Integration (Dashboard)
- [ ] **Type Definitions**: Create TypeScript interfaces for `Task`, `Project`, `Profile` based on the database schema.
- [ ] **Data Fetching**:
    - Create React Query hooks (or server actions) to fetch tasks and projects.
    - Replace the static content in `app/dashboard/page.tsx` with real data.
- [ ] **Task Creation**:
    - Create a `NewTaskModal` component.
    - specific field inputs: Title, Project (dropdown), Priority/Status, Due Date.
- [ ] **Task State Management**:
    - Implement "Mark as Done" functionality.
    - Implement Status changes.

## Phase 3: Project Management & Views
- [ ] **Project CRUD**:
    - Create `app/projects/page.tsx` to list all projects.
    - Add capability to create/edit projects (name, color, status).
- [ ] **Kanban Board**:
    - Create a Kanban view component (using `@dnd-kit` or similar if drag-and-drop is desired, or simple flex columns first).
    - Allow moving tasks between status columns.
- [ ] **Focus Mode (Morning Recap)**:
    - Create a special view/modal that shows "Today's Tasks" one by one or in a focused list.
    - Only show tasks due today or overdue.

## Phase 4: Performance Management (KPIs)
- [ ] **KPI Dashboard**:
    - Create `app/performance/page.tsx`.
    - Fetch and display KPIs for the current semester.
- [ ] **Semester Management**:
    - Admin-only view to create/activate semesters.
- [ ] **KPI Entry**:
    - Allow users to add their KPIs and track progress.

## Phase 5: UI/UX Polynomial & Refinements
- [ ] **Headings & Metadata**: dynamic `<title>` and meta tags.
- [ ] **Loading States**: Add skeletons (`app/dashboard/loading.tsx`).
- [ ] **Error Handling**: Graceful error UI.
- [ ] **Visual Polish**: Ensure the "Vercel Aesthetic" (gradients, subtle borders, inter font) is consistent.

---

## Immediate Next Step
We will start with **Phase 1: Foundation & Authentication**.
1. Create the middleware.
2. Create the Login page using Supabase Auth.
