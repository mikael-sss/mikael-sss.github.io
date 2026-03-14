'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  sku: string
  unit_price: number
  stock_quantity: number
  is_active: boolean
}

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get user's organization
        const { data: userData } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!userData) return

        // Load products for organization
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setProducts(data || [])
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [supabase])

  if (loading) {
    return <div className="text-muted-foreground">Carregando produtos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
        <Link
          href="/dashboard/products/new"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 font-medium transition"
        >
          Novo Produto
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive mb-4">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
          <Link
            href="/dashboard/products/new"
            className="text-accent hover:underline font-medium"
          >
            Adicionar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-foreground">Nome</th>
                <th className="px-4 py-2 text-left font-semibold text-foreground">SKU</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Preço</th>
                <th className="px-4 py-2 text-right font-semibold text-foreground">Estoque</th>
                <th className="px-4 py-2 text-center font-semibold text-foreground">Status</th>
                <th className="px-4 py-2 text-center font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.sku || '-'}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    R$ {product.unit_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {product.stock_quantity}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="text-accent hover:underline text-sm"
                    >
                      Editar
                    </Link>
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
