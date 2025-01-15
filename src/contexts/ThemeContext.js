import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { data: session, status } = useSession()
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.setAttribute('data-theme', 'dark')
    
    // Check for stored preference, but default to dark
    const stored = localStorage.getItem('darkMode')
    const initialDarkMode = stored === null ? true : stored === 'true'
    setDarkMode(initialDarkMode)
    document.documentElement.setAttribute('data-theme', initialDarkMode ? 'dark' : 'light')

    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          const isDark = data.preferences?.darkMode ?? true // Default to dark
          setDarkMode(isDark)
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
          localStorage.setItem('darkMode', isDark)
        })
        .catch(() => {
          setDarkMode(true)
          document.documentElement.setAttribute('data-theme', 'dark')
          localStorage.setItem('darkMode', 'true')
        })
    }
  }, [session, status])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
