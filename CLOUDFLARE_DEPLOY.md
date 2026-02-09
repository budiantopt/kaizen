# Deploying to Cloudflare Workers (Pages)

This guide explains how to deploy your Next.js application to Cloudflare Pages.

## Prerequisites

1.  A Cloudflare account.
2.  A GitHub repository connected to your local project.

## Step 1: Push Code to GitHub

Ensure your latest changes are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Configure for Cloudflare deployment"
git push origin main
```

> **Note**: Cloudflare Pages currently requires Next.js version <= 15.5.2 for compatibility with `@cloudflare/next-on-pages`. Ensure your `package.json` reflects this if you encounter build errors.

## Step 2: Create a Cloudflare Pages Project

1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Go to **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.
3.  Select your GitHub repository.
4.  **Configure the build settings**:
    *   **Framework preset**: `Next.js` (if available, otherwise "None")
    *   **Build command**: `npx @cloudflare/next-on-pages@1`
    *   **Build output directory**: `.vercel/output/static`
    *   **Node.js compatibility**: Ensure strict compatibility is enabled if possible, or rely on `nodejs_compat`.

## Step 3: Configure Environment Variables

In the Cloudflare Pages project settings, go to **Settings** -> **Environment Variables**. Add the following variables (matching your local `.env.local`):

*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY` (if used in server actions/API routes)
*   `RESEND_API_KEY` (if using Resend)

## Step 4: Add Compatibility Flags

1.  Go to **Settings** -> **Functions** -> **Compatibility Flags**.
2.  Add a production compatibility flag: `nodejs_compat`.
3.  Add a preview compatibility flag: `nodejs_compat`.

## Step 5: Save and Deploy

Click **Save and Deploy**. Cloudflare will build your application using `@cloudflare/next-on-pages` and deploy it to the edge network.

## Troubleshooting

-   **Image Optimization**: If images are not loading, ensure `next.config.ts` has `images: { unoptimized: true }` (which we have configured).
-   **Middleware Issues**: Check the deployment logs for any middleware specific errors. Ensure strict mode for cookies is handled correctly.
-   **Node.js APIs**: If you encounter errors about missing Node.js APIs, double-check that `nodejs_compat` compatibility flag is set.
