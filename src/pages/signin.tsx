import Link from 'next/link'

export default function SignInPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in</h1>
      <p>This is a placeholder sign in page. Configure NextAuth sign in flow in /api/auth.</p>
      <p>
        <Link href="/">Back home</Link>
      </p>
    </main>
  )
}
