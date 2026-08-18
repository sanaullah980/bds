import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    const form = e.target as HTMLFormElement
    const data = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      confirmPassword: (form.elements.namedItem('confirmPassword') as HTMLInputElement).value,
      shopName: (form.elements.namedItem('shopName') as HTMLInputElement).value,
      ownerName: (form.elements.namedItem('ownerName') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLInputElement).value,
      currency: (form.elements.namedItem('currency') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Registration failed')
      // Auto sign-in after successful registration
      const signInResult = await signIn('credentials', { redirect: false, email: data.email, password: data.password })
      if (signInResult && (signInResult as any).ok) {
        // Redirect to dashboard
        router.push('/')
        return
      }

      setSuccess('Registration successful — you can now sign in')
      form.reset()
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Create account & shop</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Full name</label>
            <input name="fullName" className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input name="password" type="password" minLength={8} className="mt-1 block w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm password</label>
              <input name="confirmPassword" type="password" minLength={8} className="mt-1 block w-full border rounded px-3 py-2" required />
            </div>
          </div>

          <hr className="my-4" />

          <div className="mb-4">
            <label className="block text-sm font-medium">Shop / Business name</label>
            <input name="shopName" className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Owner name</label>
              <input name="ownerName" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input name="phone" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Address</label>
            <input name="address" className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input name="category" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <input name="currency" defaultValue={process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'PKR'} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? 'Creating...' : 'Create account & shop'}
          </button>
        </form>
      </div>
    </div>
  )
}
