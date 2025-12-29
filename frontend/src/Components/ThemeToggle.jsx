import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      const t = localStorage.getItem('theme')
      if (t) return t === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      if (dark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e){
      console.error(e);
    }
  }, [dark])

  return (
        <button
        onClick={() => setDark(d => !d)}
        aria-pressed={dark}
        title="Toggle theme"
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 absolute right-[10px] top-[10px] hover:cursor-pointer"
        >
        {dark ? '🌙' : '☀️'}
        </button>
  )
}