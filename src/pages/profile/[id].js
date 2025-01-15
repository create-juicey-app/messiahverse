import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
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
  faPenFancy,
  faCode,
  faLink
} from '@fortawesome/free-solid-svg-icons'
import BlurImage from '@/components/BlurImage'

export default function Profile() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [profile, setProfile] = useState(null)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Apply the user's color scheme to the profile
  useEffect(() => {
    if (profile?.preferences?.colorScheme) {
      document.documentElement.style.setProperty('--profile-color', profile.preferences.colorScheme);
    }
    return () => {
      document.documentElement.style.removeProperty('--profile-color');
    };
  }, [profile?.preferences?.colorScheme]);

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
      <AnimatePresence mode="wait">
        {isAvatarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ 
                type: "spring",
                duration: 0.3,
                bounce: 0.2
              }}
              className="bg-surface/95 backdrop-blur-sm rounded-lg overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground/60 overflow-hidden">
                  <button
                    onClick={() => handleCopyUrl(profile.image)}
                    className="hover:text-primary truncate transition-colors"
                    title="Click to copy URL"
                  >
                    {profile.image || '/default-avatar.png'}
                  </button>
                  {isCopied && (
                    <span className="text-xs text-primary animate-fade-in">
                      Copied!
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <BlurImage
                  src={profile.image || '/default-avatar.png'}
                  alt={profile.name}
                  className="h-[70vh] w-auto mx-auto rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
              <motion.div 
                className="relative group cursor-pointer"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <BlurImage 
                  src={profile.image || '/default-avatar.png'}
                  alt={profile.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 shadow-xl"
                  priority
                />
              </motion.div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2" 
                    style={{ color: profile.preferences?.colorScheme || 'var(--primary)' }}>
                  {profile.name}
                </h1>
                <div className="flex flex-col gap-2">
                  {/* Only show email if it's the user's own profile */}
                  {session?.user?.id === id && profile.email && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {/* Only show elements based on preferences */}
                  {profile.preferences?.showLocation && profile.location && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.preferences?.showJoinDate && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                      <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  )}

                  {profile.provider && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <FontAwesomeIcon icon={faCode} className="w-4 h-4" />
                      <span className="flex items-center gap-2">
                        via {profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}
                        {profile.provider === 'github' && (
                          <a
                            href={`https://github.com/${profile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faLink} className="w-3 h-3" />
                            {profile.username}
                          </a>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {profile.preferences?.showFollowers && profile.followers !== undefined && (
                    <div className="flex items-center gap-4 text-sm text-foreground/60 mt-1">
                      <span>{profile.followers || 0} followers</span>
                      <span>{profile.following || 0} following</span>
                    </div>
                  )}
                  
                  {profile.url && (
                    <a 
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FontAwesomeIcon icon={faLink} className="w-4 h-4" />
                      <span>View Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {profile.preferences?.showBio && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 p-6 bg-surface/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg"
                style={{ borderColor: `${profile.preferences?.colorScheme}20` }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"
                    style={{ color: profile.preferences?.colorScheme }}>
                  <FontAwesomeIcon icon={faPenFancy} className="w-5 h-5" />
                  About
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {profile.bio || "This user hasn't written a bio yet."}
                </p>
              </motion.div>
            )}

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
