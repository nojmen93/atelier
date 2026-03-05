'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  created_at: string
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    if (res.ok) {
      setUsers(await res.json())
    } else {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      toast.success('User created')
      setEmail('')
      setPassword('')
      fetchUsers()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create user')
    }
    setCreating(false)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Remove ${user.email}?`)) return

    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    })

    if (res.ok) {
      toast.success('User removed')
      fetchUsers()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to remove user')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Create User</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-neutral-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Add User'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        {loading ? (
          <p className="text-neutral-500 text-sm">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-neutral-500 text-sm">No users found.</p>
        ) : (
          <div className="border border-neutral-800 rounded divide-y divide-neutral-800">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{user.email}</p>
                  <p className="text-xs text-neutral-500">
                    Added {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(user)}
                  className="text-xs text-neutral-500 hover:text-red-400 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
