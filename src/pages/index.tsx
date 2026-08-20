import Head from 'next/head'
import React, { useEffect, useState } from 'react'

type Sale = {
  id: string
  reference: string
  date: string
  totalAmount: string
  paymentStatus?: string
  customer?: { id: string; name?: string } | null
}

const container = { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' } as React.CSSProperties
const tone = '#0f172a'

export default function Home() {
  const [sales, setSales] = useState<Sale[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (demoMode) return
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/sales?page=1&perPage=5')
        if (res.status === 401) {
          setError('Sign in to view live business data.')
          setSales(null)
          return
        }
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(`Failed to load data: ${res.status} ${txt}`)
        }
        const json = await res.json()
        if (!mounted) return
        setSales(json.data || [])
      } catch (err) {
        if (!mounted) return
        console.error(err)
        setError('Unable to load live data. Try Demo mode or check your deployment settings.')
        setSales(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [demoMode])

  const demoSales: Sale[] = [
    { id: 'd1', reference: 'S-DEMO-001', date: new Date().toISOString(), totalAmount: '45.00', paymentStatus: 'PAID', customer: { id: 'c1', name: 'Walk-in' } },
    { id: 'd2', reference: 'S-DEMO-002', date: new Date().toISOString(), totalAmount: '120.00', paymentStatus: 'PARTIAL', customer: { id: 'c2', name: 'Acme Ltd' } },
  ]

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial", color: tone, minHeight: '100vh', background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 40%, #FFB300 100%)' }}>
      <Head>
        <title>Shop Management</title>
        <meta name="description" content="Everything you need to manage your shop, sales and inventory in one place." />
      </Head>

      <div style={container}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#b8860b,#ffd700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
              SM
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Shop Management</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Everything you need to manage your shop, sales and inventory</div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/" style={{ textDecoration: 'none', color: tone }}>Home</a>
            <a href="/dashboard" style={{ textDecoration: 'none', color: tone }}>Dashboard</a>
            <a href="/signin" style={{ textDecoration: 'none', color: tone }}>Sign in</a>
            <button onClick={() => setDemoMode((d) => !d)} style={{ background: demoMode ? '#64748b' : '#0ea5a4', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              {demoMode ? 'Demo on' : 'Demo off'}
            </button>
          </nav>
        </header>

        <main style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <section style={{ background: 'rgba(255,255,255,0.9)', padding: 20, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.06)' }}>
            <h1 style={{ margin: '0 0 8px 0' }}>Welcome</h1>
            <p style={{ color: '#6b7280', marginTop: 0 }}>Manage products, sales, customers and expenses from a single, easy-to-use dashboard.</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <a href="/dashboard" style={{ background: '#0ea5a4', color: 'white', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>Open dashboard</a>
              <a href="/products" style={{ background: 'transparent', border: '1px solid rgba(2,6,23,0.06)', color: tone, padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>Products</a>
            </div>

            <section style={{ marginTop: 22 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Recent sales</h3>

              {loading && <div style={{ color: '#6b7280' }}>Loading…</div>}
              {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(demoMode ? demoSales : sales || []).map((s) => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid rgba(2,6,23,0.04)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.reference}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{new Date(s.date).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₹{s.totalAmount}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{s.paymentStatus || '—'}</div>
                    </div>
                  </li>
                ))}
                {(!sales || (sales.length === 0 && !demoMode)) && !loading && (
                  <li style={{ padding: 12, color: '#6b7280' }}>No sales to show</li>
                )}
              </ul>
            </section>

            <section style={{ marginTop: 22 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Get started</h3>
              <ol style={{ color: '#6b7280' }}>
                <li>Sign in to access your business dashboard</li>
                <li>Add your first products and customers</li>
                <li>Create a sale to record income and update stock</li>
              </ol>
            </section>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.06)' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Quick actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/sales/new" style={{ textDecoration: 'none' }}><div style={{ background: '#0ea5a4', color: 'white', padding: '10px', borderRadius: 8, textAlign: 'center' }}>New Sale</div></a>
                <a href="/products/new" style={{ textDecoration: 'none' }}><div style={{ padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(2,6,23,0.06)' }}>Add product</div></a>
                <a href="/customers/new" style={{ textDecoration: 'none' }}><div style={{ padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(2,6,23,0.06)' }}>Add customer</div></a>
                <a href="/expenses/new" style={{ textDecoration: 'none' }}><div style={{ padding: '10px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(2,6,23,0.06)' }}>Add expense</div></a>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.06)' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Demo mode</h4>
              <div style={{ color: '#6b7280' }}>When Demo mode is ON the page shows sample data and avoids calling your backend. Use it to explore the interface safely.</div>
            </div>
          </aside>
        </main>

        <footer style={{ marginTop: 36, color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© {new Date().getFullYear()} Shop Management</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/api" style={{ color: tone }}>API</a>
            <a href="https://github.com/sanaullah980/bds" target="_blank" rel="noreferrer" style={{ color: tone }}>Source</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
