import Link from 'next/link'

export default function SalesPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sales</h1>
      <p>Placeholder sales listing. Use /sales/new to create a sale.</p>
      <p>
        <Link href="/sales/new">New sale</Link>
      </p>
    </main>
  )
}
