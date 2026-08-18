import React from 'react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-gray-600">Mobile-first starter</div>
        </header>

        <section className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded shadow">Today's Sales<br/><span className="text-xl font-bold">Rs. 0</span></div>
          <div className="bg-white p-4 rounded shadow">Today's Profit<br/><span className="text-xl font-bold">Rs. 0</span></div>
          <div className="bg-white p-4 rounded shadow">Customers Owe<br/><span className="text-xl font-bold">Rs. 0</span></div>
          <div className="bg-white p-4 rounded shadow">Inventory Value<br/><span className="text-xl font-bold">Rs. 0</span></div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Quick Actions</h2>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white p-3 rounded">Add Sale</button>
            <button className="flex-1 bg-green-600 text-white p-3 rounded">Add Product</button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Recent Sales</h2>
          <div className="bg-white p-4 rounded shadow">No sales yet</div>
        </section>
      </div>
    </main>
  )
}
