import { createClient } from '@/lib/supabase/server'

type DashboardStats = {
  total_products: number
  total_quotations: number
  total_sales: number
  total_revenue: number
  pending_quotations: number
  completed_sales: number
  total_payments: number
  total_collected: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData) {
    throw new Error('User not found')
  }

  const orgId = userData.organization_id

  // Fetch all data
  const [productsRes, quotationsRes, salesRes, paymentsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase
      .from('quotations')
      .select('total_amount, status', { count: 'exact' })
      .eq('organization_id', orgId),
    supabase
      .from('sales')
      .select('total_amount, status', { count: 'exact' })
      .eq('organization_id', orgId),
    supabase
      .from('payments')
      .select('amount, status', { count: 'exact' })
      .eq('organization_id', orgId),
  ])

  const quotations = quotationsRes.data || []
  const sales = salesRes.data || []
  const payments = paymentsRes.data || []

  const totalRevenue = sales
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.total_amount || 0), 0)

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return {
    total_products: productsRes.count || 0,
    total_quotations: quotationsRes.count || 0,
    total_sales: salesRes.count || 0,
    total_revenue: totalRevenue,
    pending_quotations: quotations.filter((q) => q.status === 'draft').length,
    completed_sales: sales.filter((s) => s.status === 'completed').length,
    total_payments: paymentsRes.count || 0,
    total_collected: totalCollected,
  }
}
