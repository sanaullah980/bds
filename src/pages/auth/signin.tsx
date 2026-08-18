import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res: any = await signIn('credentials', { redirect: false, email, password })
      if (res?.error) throw new Error(res.error)
      if (res?.ok) {
        router.push('/')
        return
      }
      throw new Error('Unable to sign in')
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input name="password" type="password" className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
