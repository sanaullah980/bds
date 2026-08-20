import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>This is a placeholder dashboard page. Replace with your real dashboard UI.</p>
      <p>
        Quick links: <Link href="/">Home</Link> | <Link href="/products">Products</Link>
      </p>
    </main>
  )
}
