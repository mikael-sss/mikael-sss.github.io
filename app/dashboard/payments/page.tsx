'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Payment = {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    async function loadPayments() {
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
          .from('payments')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })

        setPayments(data || [])
        setTotalAmount((data || []).reduce((sum, p) => sum + p.amount, 0))
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [supabase])

  if (loading) {
    return <div className="text-muted-foreground">Carregando pagamentos...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Pagamentos</h1>

      <div className="mb-6 p-4 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground mb-1">Total de Pagamentos</p>
        <p className="text-3xl font-bold text-accent">R$ {totalAmount.toFixed(2)}</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">Nenhum pagamento registrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Método</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Valor</th>
                <th className="px-4 py-2 text-center font-semibold text-foreground">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 text-foreground capitalize">{payment.payment_method}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    R$ {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-900 rounded text-xs font-semibold">
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(payment.created_at).toLocaleDateString('pt-BR')}
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
