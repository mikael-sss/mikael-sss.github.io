-- Database Trigger to Auto-Create Organization and User on Auth Signup
-- This trigger is recommended but requires careful setup
-- Run this AFTER setting up Supabase Auth

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_id uuid;
  org_slug text;
begin
  -- Generate slug from email
  org_slug := lower(split_part(new.email, '@', 1)) || '-' || substring(new.id::text, 1, 8);
  
  -- Create organization
  insert into public.organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Organization',
    org_slug
  )
  returning id into org_id;
  
  -- Create user record
  insert into public.users (id, organization_id, email, password_hash, full_name, role)
  values (
    new.id,
    org_id,
    new.email,
    '', -- Supabase Auth handles password hashing
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'owner' -- First user is owner
  );
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant permissions
grant execute on function public.handle_new_user() to postgres, authenticated;
