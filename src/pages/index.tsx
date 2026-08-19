import Head from 'next/head'
import React, { useEffect, useState } from 'react'

type Sale = {
  id: string
  reference: string
  date: string
  totalAmount: string
  totalProfit?: string
  paymentStatus?: string
  customer?: { id: string; name?: string } | null
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Inter, system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial",
    color: '#0f172a',
    lineHeight: 1.5,
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    background: 'linear-gradient(180deg,#f8fafc 0%,#ffffff 50%)',
  },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  brand: { display: 'flex', gap: 12, alignItems: 'center' },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#06b6d4 0%,#0ea5a4 50%,#14b8a6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: 18,
  },
  hero: { display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28 },
  left: { flex: 1 },
  right: { width: 380 },
  card: { background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.04)' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid rgba(2,6,23,0.04)' },
  muted: { color: '#64748b', fontSize: 13 },
  button: { background: '#0ea5a4', color: 'white', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' },
}

const demoSales: Sale[] = [
  { id: 'demo-1', reference: 'S-DEM1', date: new Date().toISOString(), totalAmount: '45.00', totalProfit: '12.50', paymentStatus: 'PAID', customer: { id: 'c1', name: 'Walk-in' } },
  { id: 'demo-2', reference: 'S-DEM2', date: new Date().toISOString(), totalAmount: '120.00', totalProfit: '30.00', paymentStatus: 'PARTIAL', customer: { id: 'c2', name: 'ABC Store' } },
]

export default function Home() {
  const [sales, setSales] = useState<Sale[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/sales?page=1&perPage=5')
        if (res.status === 401) {
          setError('Authentication required to load live data. Sign in to use the full app.')
          setSales(null)
          setLoading(false)
          return
        }
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(`Failed to load data: ${res.status} ${txt}`)
        }
        const json = await res.json()
        // api returns { data: sales }
        setSales(json.data || [])
      } catch (err: any) {
        console.error(err)
        setError('Unable to load live data. You can try Demo mode below.')
        setSales(null)
      } finally {
        setLoading(false)
      }
    }

    if (!demoMode) load()
  }, [demoMode])

  return (
    <div style={styles.page}>
      <Head>
        <title>Shop Management — Starter</title>
        <meta name="description" content="Shop management starter dashboard" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logoBox}>SM</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Shop Management</div>
              <div style={styles.muted}>Starter dashboard</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/api/auth/signin" style={{ ...styles.button, background: '#0369a1' }}>Sign in</a>
            <button
              style={{ ...styles.button, background: demoMode ? '#64748b' : '#0ea5a4' }}
              onClick={() => setDemoMode((d) => !d)}
            >
              {demoMode ? 'Live mode' : 'Demo mode'}
            </button>
          </div>
        </header>

        <main style={styles.hero}>
          <div style={styles.left}>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0 }}>Welcome</h2>
              <p style={styles.muted}>
                This dashboard connects to server APIs to manage products, sales and customers.
                If you are not signed in or the database is not configured, use Demo mode to try the UI.
              </p>

              <section style={{ marginTop: 12 }}>
                <h3 style={{ margin: '8px 0' }}>Recent sales</h3>

                {loading && <div style={styles.muted}>Loading…</div>}

                {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}

                <ul style={styles.list}>
                  {(demoMode ? demoSales : sales || []).map((s) => (
                    <li key={s.id} style={styles.listItem}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.reference}</div>
                        <div style={styles.muted}>{new Date(s.date).toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>₹{s.totalAmount}</div>
                        <div style={styles.muted}>{s.paymentStatus || '—'}</div>
                      </div>
                    </li>
                  ))}
                  {(!sales || (sales.length === 0 && !demoMode)) && !loading && (
                    <li style={{ padding: 12 }} className="empty">No sales to show.</li>
                  )}
                </ul>
              </section>
            </div>

            <div style={{ height: 16 }} />

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>Get started</h3>
              <ol style={{ margin: '8px 0 0 16px' }}>
                <li>Sign in (top-right) to use the full app</li>
                <li>If you are deploying, set DATABASE_URL in your Vercel project</li>
                <li>Visit <a href="/dashboard">/dashboard</a> to manage products and sales</li>
              </ol>
            </div>
          </div>

          <aside style={styles.right}>
            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>Quick actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ ...styles.button, width: '100%', background: '#0ea5a4' }}>Open dashboard</button>
                </a>
                <a href="/api/sales" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '8px 12px', borderRadius: 8 }}>API: /api/sales</button>
                </a>
                <a href="https://github.com/sanaullah980/bds" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '8px 12px', borderRadius: 8 }}>View source</button>
                </a>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>Demo info</h4>
              <p style={styles.muted}>Demo mode shows sample data and does not interact with your database. Sign in for live data.</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
