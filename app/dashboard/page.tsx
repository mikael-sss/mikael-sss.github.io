'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    products: 0,
    quotations: 0,
    sales: 0,
    payments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get organization from user metadata or query
        const { data: userData } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!userData) return

        const orgId = userData.organization_id

        // Load stats
        const [productsRes, quotationsRes, salesRes, paymentsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('quotations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('sales')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
        ])

        setStats({
          products: productsRes.count || 0,
          quotations: quotationsRes.count || 0,
          sales: salesRes.count || 0,
          payments: paymentsRes.count || 0,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  const cards = [
    { label: 'Produtos', value: stats.products, icon: '📦', color: 'bg-blue-100 text-blue-900' },
    { label: 'Orçamentos', value: stats.quotations, icon: '📄', color: 'bg-green-100 text-green-900' },
    { label: 'Vendas', value: stats.sales, icon: '💰', color: 'bg-purple-100 text-purple-900' },
    { label: 'Pagamentos', value: stats.payments, icon: '💳', color: 'bg-orange-100 text-orange-900' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>

      {loading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className={`${card.color} p-6 rounded-lg shadow-md`}>
              <div className="text-4xl mb-2">{card.icon}</div>
              <p className="text-sm opacity-75">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
