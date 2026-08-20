import { useState } from 'react'

export default function NewProductPage() {
  const [name, setName] = useState('')
  return (
    <main style={{ padding: 24 }}>
      <h1>Add Product</h1>
      <p>This is a simple placeholder form.</p>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </main>
  )
}
