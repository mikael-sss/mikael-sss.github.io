import { createClient } from '@/lib/supabase/server'

export async function getUserWithOrganization() {
  const supabase = await createClient()
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', authUser.id)
    .single()

  if (error || !userData) {
    return null
  }

  return userData
}

export async function getCurrentOrganization() {
  const user = await getUserWithOrganization()
  return user?.organizations || null
}
