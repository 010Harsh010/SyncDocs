import { useMode } from '../../context/useMode.js'

const Header = () => {
  const { isDark, toggleMode } = useMode()

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
          <li >Login</li>
          <li >Sign Up</li>
        </ul>
      </nav>
    </header>
  );
}


export default Header
