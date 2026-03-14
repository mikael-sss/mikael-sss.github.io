'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Sale = {
  id: string
  customer_name: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
}

export default function SalesPage() {
  const supabase = createClient()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSales() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: userData } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!userData) return

        const { data } = await supabase
          .from('sales')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .order('created_at', { ascending: false })

        setSales(data || [])
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [supabase])

  if (loading) {
    return <div className="text-muted-foreground">Carregando vendas...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
        <Link
          href="/dashboard/sales/new"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 font-medium transition"
        >
          Nova Venda
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Nenhuma venda registrada</p>
          <Link
            href="/dashboard/sales/new"
            className="text-accent hover:underline font-medium"
          >
            Registrar primeira venda
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Cliente</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Email</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Valor</th>
                <th className="px-4 py-2 text-center font-semibold text-foreground">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 text-foreground">{sale.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{sale.customer_email}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    R$ {sale.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      sale.status === 'completed' 
                        ? 'bg-green-100 text-green-900'
                        : 'bg-yellow-100 text-yellow-900'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
