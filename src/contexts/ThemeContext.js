import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { data: session, status } = useSession()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Fetch user preferences
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          const isDark = data.preferences?.darkMode ?? false
          setDarkMode(isDark)
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        })
        .catch(() => {
          // Fallback to system preference
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setDarkMode(systemDark)
          document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
        })
    } else {
      // Use system preference for non-authenticated users
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(systemDark)
      document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
    }
  }, [session, status])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
