import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import UserMenu from '@/components/Navigation/UserMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPenToSquare, 
  faRightFromBracket, 
  faEnvelope, 
  faCalendar, 
  faLocationDot,
  faMedal,
  faUser,
  faPenFancy
} from '@fortawesome/free-solid-svg-icons'

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

  const handleLogout = async () => {
    await signOut({ 
      redirect: false
    });
    router.push('/auth/signin');
  }

  if (!profile) {
    return (
      <>
        <UserMenu />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-screen"
        >
          <div className="animate-pulse text-primary">Loading...</div>
        </motion.div>
      </>
    )
  }

  return (
    <>
      <UserMenu />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-background to-surface/50 pb-20"
      >
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto bg-surface/95 backdrop-blur-sm p-8 rounded-lg border border-border shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <motion.div className="relative group">
                <motion.img 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  src={profile.image || '/default-avatar.png'}
                  alt={profile.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 shadow-xl"
                />
                <motion.div 
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                </motion.div>
              </motion.div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{profile.name}</h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-foreground/60">
                    <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground/60">
                    <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                    <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-6 bg-surface/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
                <FontAwesomeIcon icon={faPenFancy} className="w-5 h-5" />
                About
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
            </motion.div>

            {session?.user?.id === id && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/settings/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                  Logout
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
