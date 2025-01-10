import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Profile() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/user/${id}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [id])

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-surface/95 backdrop-blur-sm p-8 rounded-lg border border-border"
      >
        <div className="flex items-center gap-6 mb-8">
          <img 
            src={profile.image || '/default-avatar.png'}
            alt={profile.name}
            className="w-24 h-24 rounded-full border-2 border-primary/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
            <p className="text-foreground/60">{profile.email}</p>
          </div>
        </div>
        
        {profile.bio && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Bio</h2>
            <p className="text-foreground">{profile.bio}</p>
          </div>
        )}

        {session?.user?.id === id && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/settings/profile')}
            className="text-primary hover:text-primary/80"
          >
            Edit Profile
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
