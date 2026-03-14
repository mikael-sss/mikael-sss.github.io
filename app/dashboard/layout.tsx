'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-primary-foreground transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-primary/20">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-center text-sm'}`}>
            {sidebarOpen ? 'SPVM' : 'S'}
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            {sidebarOpen ? '📊 Dashboard' : '📊'}
          </Link>
          <Link
            href="/dashboard/products"
            className="block px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            {sidebarOpen ? '📦 Produtos' : '📦'}
          </Link>
          <Link
            href="/dashboard/quotations"
            className="block px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            {sidebarOpen ? '📄 Orçamentos' : '📄'}
          </Link>
          <Link
            href="/dashboard/sales"
            className="block px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            {sidebarOpen ? '💰 Vendas' : '💰'}
          </Link>
          <Link
            href="/dashboard/payments"
            className="block px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            {sidebarOpen ? '💳 Pagamentos' : '💳'}
          </Link>
        </nav>

        <div className="p-4 border-t border-primary/20 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-4 py-2 rounded-lg hover:bg-primary/80 transition text-sm"
          >
            {sidebarOpen ? '«' : '»'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition text-sm"
          >
            {sidebarOpen ? 'Sair' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
