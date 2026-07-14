import Header from './components/Header/Header.jsx'
import Body from './components/body/Body.jsx'
import { useMode } from './context/useMode.js'

import './App.css'

function App() {
  const { isDark } = useMode()

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-950'
      }`}
    >
      <Header />
      <Body/>
    </div>
  )
}

export default App
