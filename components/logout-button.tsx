'use client'

import { useState } from 'react'

export function LogoutButton() {
  const [busy, setBusy] = useState(false)

  async function logout() {
    if (busy) return
    setBusy(true)
    try {
      const response = await fetch('/logout', { method: 'POST', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Logout failed.')
      window.location.replace('/login')
    } catch {
      setBusy(false)
    }
  }

  return (
    <button className="secondary small" type="button" onClick={logout} disabled={busy}>
      {busy ? 'Signing out…' : 'Log out'}
    </button>
  )
}
