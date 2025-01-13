import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSave, 
  faUser, 
  faPalette,
  faPenFancy
} from '@fortawesome/free-solid-svg-icons'
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
              notifications: true,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30">
        <UserMenu />
        <div className="flex justify-center items-center h-[80vh]">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-primary text-xl font-medium"
          >
            Loading your profile...
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30 pb-20">
      <UserMenu />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Profile Settings
          </h1>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-primary opacity-20"
          >
            <FontAwesomeIcon icon={faUser} size="2x" />
          </motion.div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            variants={itemVariants}
            className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <FontAwesomeIcon icon={faUser} className="text-primary" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Display Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Bio
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-32 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <FontAwesomeIcon icon={faPalette} className="text-primary" />
              <h2 className="text-xl font-semibold">Theme Settings</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="button"
                onClick={() => handleThemeChange(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 p-4 rounded-xl border transition-all duration-200 ${
                  !profile.preferences.darkMode 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">☀️</span>
                  <span>Light Mode</span>
                </div>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleThemeChange(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 p-4 rounded-xl border transition-all duration-200 ${
                  profile.preferences.darkMode 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">🌙</span>
                  <span>Dark Mode</span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-primary text-white rounded-xl flex items-center justify-center gap-3 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faSave} />
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
