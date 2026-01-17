# Deployment Guide for Vercel

Follow these steps to deploy your Focus application to Vercel.

## 1. Prepare Your Code
Your project has uncommitted changes. You need to commit them to your local git repository first.

Run these commands in your terminal:
```bash
git add .
git commit -m "Ready for deployment"
```

## 2. Push to GitHub (Recommended)
The easiest way to deploy is by connecting a GitHub repository to Vercel.

1.  Create a new repository on [GitHub](https://github.com/new).
2.  Push your local code to the new repository:
    ```bash
    git remote add origin <your-github-repo-url>
    git branch -M main
    git push -u origin main
    ```

## 3. Deploy on Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the GitHub repository you just created.
4.  **Important**: Configuration
    *   **Framework Preset**: Next.js (should be auto-detected)
    *   **Root Directory**: `./` (default)
    *   **Environment Variables**: You MUST add the following variables from your `.env.local` file:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   `SUPABASE_SERVICE_ROLE_KEY`
        *   `RESEND_API_KEY`

5.  Click **"Deploy"**.

## 4. Post-Deployment Checks
*   After deployment, Vercel will give you a live URL (e.g., `focus-app.vercel.app`).
*   Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
*   Add your new Vercel URL to the **Site URL** or **Redirect URLs** to ensure login works correctly in production.
