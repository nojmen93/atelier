'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'magic' | 'password'>('magic')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Atelier
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Buyer Portal
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-3">
            <p className="text-foreground">Check your email</p>
            <p className="text-sm text-neutral-400">
              We sent a magic link to <span className="text-foreground">{email}</span>.
              Click the link to sign in.
            </p>
          </div>
        ) : mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-neutral-400 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-foreground placeholder:text-neutral-600"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('password'); setError(null) }}
              className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition"
            >
              Sign in with password instead
            </button>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label htmlFor="email2" className="block text-sm text-neutral-400 mb-1.5">
                Email address
              </label>
              <input
                id="email2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-foreground placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-neutral-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-foreground placeholder:text-neutral-600"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('magic'); setError(null) }}
              className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition"
            >
              Use magic link instead
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
