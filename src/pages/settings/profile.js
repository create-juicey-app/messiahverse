import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

export default function ProfileSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    bio: '',
    preferences: {
      theme: 'system',
      notifications: true
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (res.ok) {
        // Redirect to user's profile page
        router.push(`/profile/${session.user.id}`)
      } else {
        // Handle error
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
