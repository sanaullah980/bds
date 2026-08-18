import React, { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  stockQuantity: string
  sellingPrice: string
}

export default function CreateSalePage() {
  const [mode, setMode] = useState<'QUICK' | 'BULK'>('QUICK')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [totalAmount, setTotalAmount] = useState('0')
  const [totalCost, setTotalCost] = useState('0')
  const [paidAmount, setPaidAmount] = useState('0')
  const [customerId, setCustomerId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    // recalc totals for bulk
    if (mode === 'BULK') {
      let ta = 0
      let tc = 0
      for (const it of selectedItems) {
        const qty = parseFloat(it.qty || '0')
        const price = parseFloat(it.price || '0')
        const cost = parseFloat(it.cost || '0')
        ta += qty * price
        tc += qty * cost
      }
      setTotalAmount(ta.toFixed(2))
      setTotalCost(tc.toFixed(2))
    }
  }, [selectedItems, mode])

  function addItem(prod?: Product) {
    setSelectedItems(prev => ([...prev, { productId: prod?.id || null, name: prod?.name || '', qty: 1, price: prod?.sellingPrice || '0', cost: '0' }]))
  }

  function updateItem(index: number, key: string, value: any) {
    setSelectedItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: value }
      return copy
    })
  }

  async function submit() {
    setMessage(null)
    setLoading(true)
    try {
      const body: any = { type: mode }
      if (mode === 'QUICK') {
        body.totalAmount = totalAmount
        body.totalCost = totalCost
        body.paidAmount = paidAmount
      } else {
        body.items = selectedItems
        body.paidAmount = paidAmount
      }
      body.customerId = customerId || undefined
      body.note = note || undefined

      const res = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unable to create sale')
      setMessage('Sale recorded')
      // reset
      setSelectedItems([])
      setPaidAmount('0')
      setTotalAmount('0')
      setTotalCost('0')
    } catch (err: any) {
      setMessage(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create Sale</h1>
      <div className="mb-4">
        <label className="mr-2">
          <input type="radio" checked={mode === 'QUICK'} onChange={() => setMode('QUICK')} /> Quick
        </label>
        <label className="ml-4">
          <input type="radio" checked={mode === 'BULK'} onChange={() => setMode('BULK')} /> Bulk
        </label>
      </div>

      {mode === 'QUICK' && (
        <div className="bg-white p-4 rounded shadow">
          <div className="mb-2">
            <label className="block text-sm">Total amount</label>
            <input value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Estimated cost (optional)</label>
            <input value={totalCost} onChange={e => setTotalCost(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
        </div>
      )}

      {mode === 'BULK' && (
        <div className="bg-white p-4 rounded shadow">
          <div className="mb-2">
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => addItem()} className="bg-blue-600 text-white px-3 py-1 rounded">Add empty item</button>
              <div className="flex-1">
                <select onChange={e => {
                  const p = products.find(x => x.id === e.target.value)
                  if (p) addItem(p)
                }} className="w-full border rounded px-2 py-1">
                  <option value="">Add product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stockQuantity})</option>)}
                </select>
              </div>
            </div>
            {selectedItems.map((it, idx) => (
              <div key={idx} className="mb-2 p-2 border rounded">
                <div className="mb-1">{it.name || 'Unnamed'}</div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={it.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className="border rounded px-2 py-1" />
                  <input value={it.price} onChange={e => updateItem(idx, 'price', e.target.value)} className="border rounded px-2 py-1" />
                  <input value={it.cost} onChange={e => updateItem(idx, 'cost', e.target.value)} className="border rounded px-2 py-1" />
                </div>
              </div>
            ))}

            <div className="mt-2">
              <div>Total: {totalAmount}</div>
              <div>Cost: {totalCost}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-white p-4 rounded shadow">
        <label className="block text-sm mb-1">Paid amount</label>
        <input value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="w-full border rounded px-2 py-1" />
        <label className="block text-sm mt-2">Customer ID (optional)</label>
        <input value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border rounded px-2 py-1" />
        <label className="block text-sm mt-2">Note</label>
        <input value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded px-2 py-1" />

        {message && <div className="mt-2 text-sm text-red-600">{message}</div>}
        <div className="mt-3">
          <button onClick={submit} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">{loading ? 'Saving...' : 'Save Sale'}</button>
        </div>
      </div>
    </main>
  )
}
