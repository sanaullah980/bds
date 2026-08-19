import Head from 'next/head'
import React from 'react'

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
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  brand: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background:
      'linear-gradient(135deg,#06b6d4 0%,#0ea5a4 50%,#14b8a6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: 18,
    boxShadow: '0 6px 18px rgba(14,165,164,0.14)',
  },
  nav: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  ctaPrimary: {
    background: '#0ea5a4',
    color: 'white',
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    boxShadow: '0 6px 18px rgba(14,165,164,0.12)',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: 32,
    alignItems: 'center',
    marginBottom: 48,
  },
  heroCard: {
    background: 'linear-gradient(180deg, rgba(14,165,164,0.06), rgba(14,165,164,0.02))',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 30px rgba(2,6,23,0.04)',
  },
  heroTitle: {
    fontSize: 36,
    margin: 0,
    color: '#022c3a',
  },
  heroSubtitle: {
    color: '#334155',
    marginTop: 12,
    marginBottom: 20,
  },
  gridFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginTop: 20,
  },
  feature: {
    background: 'white',
    borderRadius: 10,
    padding: 14,
    border: '1px solid rgba(2,6,23,0.04)',
  },
  footer: {
    marginTop: 56,
    paddingTop: 28,
    borderTop: '1px solid rgba(2,6,23,0.04)',
    color: '#475569',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  small: { fontSize: 13, color: '#64748b' },
  screenshotBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(2,6,23,0.04)',
    background: '#fff',
  },
  mockScreen: {
    padding: 18,
  },
  mockRow: {
    height: 14,
    borderRadius: 8,
    background: 'linear-gradient(90deg,#e6f4f3,#f1f8f8)',
    marginBottom: 10,
  },
  centered: { textAlign: 'center' },
  link: { color: '#075985', textDecoration: 'underline' },
}

export default function Home() {
  return (
    <div style={styles.page}>
      <Head>
        <title>Shop Management — Dashboard Starter</title>
        <meta
          name="description"
          content="Shop Management SaaS Starter — manage products, sales and customers with a simple, extensible starter."
        />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logoBox}>SM</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Shop Management</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>SaaS Starter</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <a href="#features" style={{ color: '#0f172a', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#pricing" style={{ color: '#0f172a', textDecoration: 'none' }}>
              Pricing
            </a>
            <a href="/api/sales" style={styles.ctaPrimary}>
              Try API
            </a>
          </nav>
        </header>

        <section style={styles.hero}>
          <div>
            <div style={styles.heroCard}>
              <h1 style={styles.heroTitle}>Manage sales, inventory and customers — fast</h1>
              <p style={styles.heroSubtitle}>
                A lightweight, extensible starter for shop & POS backends — built with Next.js,
                Prisma and Tailwind-ready structure. Deploy instantly, scale later.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <a href="/dashboard" style={styles.ctaPrimary}>
                  Open Dashboard
                </a>
                <a href="#features" style={{ padding: '10px 16px', borderRadius: 8, textDecoration: 'none', color: '#0f172a', background: 'transparent', border: '1px solid rgba(2,6,23,0.04)' }}>
                  Explore features
                </a>
              </div>

              <div style={styles.gridFeatures} id="features">
                <div style={styles.feature}>
                  <strong>Inventory</strong>
                  <div style={{ marginTop: 8, color: '#475569', fontSize: 13 }}>
                    Track stock, adjustments, and low-stock alerts.
                  </div>
                </div>

                <div style={styles.feature}>
                  <strong>Sales</strong>
                  <div style={{ marginTop: 8, color: '#475569', fontSize: 13 }}>
                    Create quick or named sales, handle payments and refunds.
                  </div>
                </div>

                <div style={styles.feature}>
                  <strong>Customers</strong>
                  <div style={{ marginTop: 8, color: '#475569', fontSize: 13 }}>
                    Maintain balances, ledger entries, and payment history.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, background: 'white', boxShadow: '0 6px 16px rgba(2,6,23,0.03)', flex: 1 }}>
                <div style={{ fontSize: 12, color: '#475569' }}>Deploy</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>Vercel ready</div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Automatic builds & instant preview URLs</div>
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: 'white', boxShadow: '0 6px 16px rgba(2,6,23,0.03)', flex: 1 }}>
                <div style={{ fontSize: 12, color: '#475569' }}>Database</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>Postgres + Prisma</div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Migrations and typed client included</div>
              </div>
            </div>
          </div>

          <aside style={styles.screenshotBox} aria-hidden>
            <div style={styles.mockScreen}>
              <div style={{ height: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 120, height: 12, borderRadius: 8, background: '#eafaf9' }} />
                <div style={{ width: 40, height: 12, borderRadius: 8, background: '#eafaf9' }} />
              </div>

              <div style={{ height: 12, width: '70%', borderRadius: 8, background: '#f1faf9', marginBottom: 12 }} />
              <div style={{ height: 12, width: '50%', borderRadius: 8, background: '#f1faf9', marginBottom: 12 }} />

              <div style={{ marginTop: 8 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eafaf9' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 10, width: '60%', borderRadius: 6, background: '#f1faf9', marginBottom: 6 }} />
                      <div style={{ height: 8, width: '30%', borderRadius: 6, background: '#f1faf9' }} />
                    </div>
                    <div style={{ width: 60, height: 12, borderRadius: 8, background: '#eafaf9' }} />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section id="pricing" style={{ marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Plans that grow with you</h3>
          <p style={{ marginTop: 0, color: '#475569' }}>
            Start free for development — add a simple paid plan when you scale.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', background: 'white', padding: 16, borderRadius: 12, border: '1px solid rgba(2,6,23,0.04)' }}>
              <div style={{ fontWeight: 700 }}>Developer</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>Free • For development & testing</div>
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 20 }}>$0</div>
              <div style={{ marginTop: 12, color: '#475569', fontSize: 13 }}>
                Self-hosted / Vercel Preview • Postgres dev DB
              </div>
            </div>

            <div style={{ flex: '1 1 220px', background: 'white', padding: 16, borderRadius: 12, border: '1px solid rgba(2,6,23,0.04)' }}>
              <div style={{ fontWeight: 700 }}>Starter</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>For small shops</div>
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 20 }}>$12/mo</div>
              <div style={{ marginTop: 12, color: '#475569', fontSize: 13 }}>
                Basic support • Daily backups • One production DB
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={styles.logoBox}>SM</div>
            <div>
              <div style={{ fontWeight: 700 }}>Shop Management</div>
              <div style={styles.small}>Built with Next.js & Prisma</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={styles.small}>© {new Date().getFullYear()} Shop Management</div>
            <a href="/api" style={styles.link}>API docs</a>
            <a href="https://github.com/sanaullah980/bds" style={styles.link} target="_blank" rel="noreferrer">Source</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
