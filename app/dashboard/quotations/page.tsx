'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Quotation = {
  id: string
  customer_name: string
  customer_email: string
  status: string
  total_amount: number
  created_at: string
}

export default function QuotationsPage() {
  const supabase = createClient()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuotations() {
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
          .from('quotations')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .order('created_at', { ascending: false })

        setQuotations(data || [])
      } finally {
        setLoading(false)
      }
    }

    loadQuotations()
  }, [supabase])

  if (loading) {
    return <div className="text-muted-foreground">Carregando orçamentos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
        <Link
          href="/dashboard/quotations/new"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 font-medium transition"
        >
          Novo Orçamento
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Nenhum orçamento cadastrado</p>
          <Link
            href="/dashboard/quotations/new"
            className="text-accent hover:underline font-medium"
          >
            Criar primeiro orçamento
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
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 text-foreground">{q.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{q.customer_email}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    R$ {q.total_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs font-semibold">
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(q.created_at).toLocaleDateString('pt-BR')}
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
