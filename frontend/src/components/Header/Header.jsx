import { useState } from 'react'
import { useMode } from '../../context/useMode.js'
import { useAuth } from '../../context/AuthContext.jsx'

const Header = () => {
  const { isDark, toggleMode } = useMode()
  const { user, signIn, signOut, signUp } = useAuth()
  const [mode, setMode] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submitAuth = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (mode === 'signup') {
        await signUp(form.name, form.email, form.password)
      } else {
        await signIn(form.email, form.password)
      }
      setMode(null)
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <header
      className={`border-b px-6 py-4 transition-colors duration-200 ${
        isDark
          ? 'border-zinc-800 bg-zinc-950 text-zinc-100'
          : 'border-zinc-200 bg-white text-zinc-950'
      }`}
    >
      <nav className="flex justify-between items-center">
        <ul className="flex items-center gap-6">
          <li >Home</li>
          <li >About</li>
          <li >Contact</li>
        </ul>

        <ul className="flex items-center gap-6">
          <li>
            <button
              type="button"
              onClick={toggleMode}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
              }`}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </li>
          {user ? (
            <>
              <li className="text-sm">{user.name}</li>
              <li>
                <button type="button" onClick={signOut}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button type="button" onClick={() => setMode('login')}>Login</button>
              </li>
              <li>
                <button type="button" onClick={() => setMode('signup')}>Sign Up</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      {mode && (
        <form onSubmit={submitAuth} className="mt-4 flex flex-wrap items-end gap-3">
          {mode === 'signup' && (
            <label className="grid gap-1 text-sm">
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="rounded border border-zinc-300 px-3 py-2 text-zinc-950"
              />
            </label>
          )}
          <label className="grid gap-1 text-sm">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="rounded border border-zinc-300 px-3 py-2 text-zinc-950"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="rounded border border-zinc-300 px-3 py-2 text-zinc-950"
            />
          </label>
          <button
            type="submit"
            className={`rounded px-4 py-2 text-sm font-medium ${
              isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-950 text-white'
            }`}
          >
            {mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
          <button type="button" onClick={() => setMode(null)} className="text-sm">
            Cancel
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      )}
    </header>
  );
}


export default Header
