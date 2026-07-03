# Supabase Manual Setup Instructions

Follow these steps to set up your Supabase project for the Us app.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in (or create an account).
2. Click **"New project"**.
3. Choose your organization, pick a name (e.g., "Us"), select a region closest to you, and set a strong database password.
4. Wait for the project to provision (usually 2-3 minutes).

## Step 2: Copy API Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon in the sidebar) > **API**.
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "project API keys")
3. Create a `.env.local` file in the project root (`C:\Users\saddamnew\us-app\.env.local`) with these values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

4. To get the **service role key**, scroll down on the same API settings page and click "Show" next to the service_role key.

## Step 3: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (in the sidebar).
2. Click **"New query"**.
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from this project.
4. Paste it into the SQL editor and click **"Run"**.
5. You should see a success message. The following tables will be created:
   - `profiles` — User profiles linked to auth.users
   - `entries` — Journal entries with moods
   - `app_settings` — Admin-only app configuration
   - `love_letters` — 30-day love letter challenges

## Step 4: Create Storage Buckets

1. In your Supabase dashboard, go to **Storage** (in the sidebar).
2. Click **"New bucket"**.
3. Create a bucket named **`photos`**:
   - Public bucket: **Yes**
   - File size limit: `10485760` (10 MB)
4. Click **"Create"**.
5. Click **"New bucket"** again.
6. Create a bucket named **`voice-notes`**:
   - Public bucket: **Yes**
   - File size limit: `52428800` (50 MB)
7. Click **"Create"**.

## Step 5: Verify Everything Works

1. Run `npm run dev` to start the development server.
2. Open http://localhost:3000 in your browser.
3. You should see the "Us" landing page with a "Log In" button.

## Troubleshooting

- **Build fails with "Cannot find module"**: Run `npm install` again.
- **Supabase client throws errors**: Double-check that `.env.local` has correct values and that the file is NOT committed to git (it's in `.gitignore`).
- **SQL migration fails**: Make sure you are running it against the correct project. The `auth.users` table only exists after Supabase provisions your project.
