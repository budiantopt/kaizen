# 🚀 Vercel Deployment Guide for Kaizen App

This guide outlines the complete, step-by-step process to deploy your newly optimized Next.js application to Vercel.

## Step 1: Push Your Code to Git
Vercel's optimal deployment method is via Git integration (GitHub, GitLab, or Bitbucket).
1. Make sure all my recent code changes are committed and pushed:
   ```bash
   git add .
   git commit -m "chore: Vercel production setup and optimizations"
   git push origin main
   ```

## Step 2: Import the Project in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Add New...** button and select **Project**.
3. Locate your Git repository in the list and click **Import**.

## Step 3: Configure Project Settings
1. **Project Name:** Vercel will suggest a name based on the repo; rename if desired (e.g., `kaizen-app`).
2. **Framework Preset:** Vercel will cleanly auto-detect **Next.js**. Leave this exactly as-is.
3. **Build and Output Settings:** Leave the default overrides unchecked (`npm run build` is already optimized natively).

## Step 4: Add Environment Variables
Before clicking Deploy, expand the **Environment Variables** section. You must copy the exact values from your local `.env.local` file over to Vercel so your integrations continue working smoothly in production.

Add the following keys:
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(Required for admin SDK bypass actions)*
- `CRON_SECRET` *(Required to securely run your Daily Summary cron API)*
- `RESEND_API_KEY` *(Required for outgoing user action emails)*

## Step 5: Deploy
1. Click the **Deploy** button.
2. Vercel will install dependencies, run your new error-free `npm run build`, and assign standard caching & optimizations.
3. Once the build finishes, you will be given a live deployment URL (e.g., `https://kaizen-app.vercel.app`).

## Step 6: Update Supabase Authentication URL
Now that your app has a new public URL, you must tell your Supabase instance to accept authentication and callbacks from it.
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **URL Configuration**.
3. Under **Site URL**, paste your new Vercel production URL (e.g., `https://kaizen-app.vercel.app`).
4. Under **Redirect URLs**, add the callback endpoint: `https://kaizen-app.vercel.app/auth/callback` (alongside `http://localhost:3000/auth/callback` so local dev still works).

## Step 7: Finalize Vercel Cron Jobs (Important!)
Since you have a daily summary route (`/api/cron/daily-summary`), Vercel can automatically trigger this for you.
To do this quickly, simply create a `vercel.json` file in the root of your project:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 8 * * *"
    }
  ]
}
```
*Note: The cron expression `0 8 * * *` triggers the job every day at 8:00 AM UTC. Adjust as needed.*
