import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import UserMenu from '../../components/Navigation/UserMenu'
import { useTheme } from '../../contexts/ThemeContext'

export default function ProfileSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    preferences: {
      theme: 'system',
      notifications: true,
      darkMode: false
    }
  })

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch')
          return res.json()
        })
        .then(data => {
          setProfile({
            name: data.name || session.user.name,
            bio: data.bio || '',
            preferences: {
              theme: data.preferences?.theme || 'system',
              notifications: data.preferences?.notifications ?? true,
              darkMode: data.preferences?.darkMode ?? false
            }
          })
          setLoading(false)
        })
        .catch(error => {
          console.error('Error loading profile:', error)
          setLoading(false)
        })
    } else if (status === "unauthenticated") {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  useEffect(() => {
    if (!loading) {
      const isDark = profile.preferences.darkMode
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }
  }, [profile.preferences.darkMode, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (res.ok) {
        router.push(`/profile/${session.user.id}`)
      } else {
        const error = await res.json()
        console.error('Failed to update profile:', error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleThemeChange = (isDark) => {
    setProfile({
      ...profile,
      preferences: { ...profile.preferences, darkMode: isDark }
    })
    setDarkMode(isDark)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <UserMenu />
        <div className="max-w-2xl mx-auto text-center">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserMenu/>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-primary mb-8">Profile Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 rounded-lg bg-surface border border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-2 rounded-lg bg-surface border border-border h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={profile.preferences.theme}
              onChange={(e) => setProfile({
                ...profile,
                preferences: { ...profile.preferences, theme: e.target.value }
              })}
              className="w-full p-2 rounded-lg bg-surface border border-border"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">Theme Mode</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleThemeChange(false)}
                className={`px-4 py-2 rounded-lg border ${
                  !profile.preferences.darkMode 
                    ? 'bg-primary text-white'
                    : 'bg-surface border-border'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange(true)}
                className={`px-4 py-2 rounded-lg border ${
                  profile.preferences.darkMode 
                    ? 'bg-primary text-white'
                    : 'bg-surface border-border'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} />
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
