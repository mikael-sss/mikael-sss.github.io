# Database Setup Instructions

Complete step-by-step guide to set up the SPVM SaaS database.

## Prerequisites

- Supabase project created
- Access to Supabase SQL Editor
- Environment variables configured (.env.local)

## Step 1: Create Database Schema

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Copy entire contents from `scripts/01-initial-schema.sql`
6. Paste into the SQL Editor
7. Click **Run** button
8. Confirm successful execution

**What this creates:**
- Tables: organizations, users, products, quotations, sales, payments, etc.
- Indexes for optimal performance
- Row Level Security (RLS) policies for multi-tenant isolation
- Extensions: UUID and pgcrypto

## Step 2: Create Authentication Trigger (Optional but Recommended)

This trigger automatically creates organization and user records when someone signs up.

1. Go to **SQL Editor** → **New Query**
2. Copy contents from `scripts/02-auth-trigger.sql`
3. Paste and run
4. Verify no errors

**What this does:**
- Triggers on new Supabase Auth user creation
- Automatically creates organization record
- Creates user record linked to organization
- Sets new user as "owner"

**Alternative (Manual):**
If the trigger doesn't work, users can be created manually via signup form, but you'll need to:
1. Sign up at `/auth/signup`
2. Manually insert organization in Supabase
3. Link user to organization

## Step 3: Load Test Data (Optional)

To populate sample data for testing:

1. Go to **SQL Editor** → **New Query**
2. Copy contents from `scripts/03-test-data.sql`
3. Paste and run

**Creates:**
- Test organization (slug: 'test-org')
- 2 sample products

## Step 4: Verify Setup

### Check Tables Exist

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Should show: organizations, users, products, quotations, sales, payments, etc.

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'organizations';
```

Should show `rowsecurity = true`

### Test RLS Policy

```sql
-- This should return data only for current user's organization
SELECT * FROM products LIMIT 1;
```

## Step 5: Test Application

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Entrar" (Login)
4. Create new account at `/auth/signup`

**If trigger is set up:**
- Account creation should auto-create organization
- You'll be redirected to login
- Login and access dashboard

**If trigger NOT set up:**
- Account creation works via Supabase Auth
- But organization needs manual creation
- Contact support if issues

## Troubleshooting

### "RLS policy prevents..." error
- Ensure user is authenticated
- Verify organization_id is correct
- Check RLS policies in SQL Editor

### Can't insert data
- Check if RLS policies allow your role
- Verify organization_id matches user's org
- Confirm user has correct role (owner/admin/member)

### Authentication redirects to login infinitely
- Clear browser cookies
- Check Supabase Auth configuration
- Verify `NEXT_PUBLIC_SUPABASE_*` environment variables

### No data appears in dashboard
- Confirm data was inserted
- Check RLS policies allow SELECT
- Verify user's organization_id in database

## RLS Policy Reference

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| organizations | Own org | No | No | No |
| users | Same org | No | Own user | No |
| products | Same org | Admin only | Admin only | No |
| quotations | Same org | Own | Same org | Same org |
| sales | Same org | Own | Same org | Same org |
| payments | Same org | Own | Same org | Same org |

## Next Steps

1. Populate with real data
2. Create user accounts
3. Configure payment methods in `payments` table
4. Set up email notifications (optional)
5. Deploy to Vercel

## Support

For Supabase issues: https://supabase.com/docs/guides/auth/row-level-security
For app issues: Check logs with `npm run dev` and browser console
