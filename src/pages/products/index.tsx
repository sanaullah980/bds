import Link from 'next/link'

export default function ProductsPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <p>Placeholder products list. Implement product listing here.</p>
      <p>
        <Link href="/products/new">Add product</Link>
      </p>
    </main>
  )
}
