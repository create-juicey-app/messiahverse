import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'  // Add signOut to imports
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSave, 
  faUser, 
  faPalette,
  faPenFancy,
  faEye,
  faDroplet,
  faTriangleExclamation, // Add this instead of faSkull
} from '@fortawesome/free-solid-svg-icons'
import UserMenu from '../../components/Navigation/UserMenu'
import { useTheme } from '../../contexts/ThemeContext'

export default function ProfileSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    preferences: {
      notifications: true,
      darkMode: true, // Default to dark mode initially
      showFollowers: true,
      showLocation: true,
      showJoinDate: true,
      showBio: true,
      colorScheme: '#7C3AED' // Default purple
    }
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStep, setDeleteStep] = useState(0)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [buttonProgress, setButtonProgress] = useState(0)
  const [canProceed, setCanProceed] = useState(false)
  const [showGoodbye, setShowGoodbye] = useState(false) // Add this line
  
  // Add theme initialized ref
  const themeInitialized = useRef(false)

  // Update timing configuration
  const WAIT_TIMES = {
    0: 3000, // 3 seconds for first step
    1: 8000  // 8 seconds for final step
  }

  // Update modal confirmation steps
  const deleteConfirmationSteps = [
    {
      title: "Delete Account",
      subtitle: "Initial Confirmation",
      message: "Are you sure you want to begin the account deletion process?",
      details: [
        {
          icon: faUser,
          text: "Your profile information and preferences will be erased",
          color: "text-blue-500"
        },
        {
          icon: faPenFancy,
          text: "All your saved settings and customizations will be removed",
          color: "text-purple-500"
        },
        {
          icon: faDroplet,
          text: "Your authentication data and login access will be deleted",
          color: "text-emerald-500"
        },
        {
          icon: faPalette,
          text: "Any linked services or connections will be disconnected",
          color: "text-amber-500"
        }
      ],
      buttonText: "Begin Deletion Process"
    },
    {
      title: "Final Warning",
      subtitle: "Point of No Return",
      message: "This action is permanent and irreversible",
      details: [
        {
          icon: faTriangleExclamation,
          text: "All your data will be permanently and immediately erased",
          color: "text-red-500"
        },
        {
          icon: faTriangleExclamation,
          text: "You'll lose access to all your saved content and settings",
          color: "text-red-500"
        },
        {
          icon: faTriangleExclamation,
          text: "Recovery will not be possible after this step",
          color: "text-red-500"
        },
        {
          icon: faTriangleExclamation,
          text: "You'll need to create a new account to use our services again",
          color: "text-red-500"
        }
      ],
      buttonText: "Delete Account Forever"
    }
  ]

  // Replace the three theme-related effects with a single optimized one
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !themeInitialized.current) {
      const initializeTheme = async () => {
        try {
          const res = await fetch(`/api/user/profile`, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          })

          const data = await res.json()
          
          if (res.ok) {
            // Set theme only once during initialization
            const isDark = data.preferences?.darkMode ?? true
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
            setDarkMode(isDark)
            
            // Update profile with all data
            setProfile(prev => ({
              name: data.name || session.user.name || '',
              bio: data.bio || '',
              preferences: {
                ...data.preferences,
                darkMode: isDark,
                colorScheme: data.preferences?.colorScheme ?? '#7C3AED'
              }
            }))
          }
        } catch (err) {
          console.error('Error fetching theme preference:', err)
          // Fallback to dark theme
          document.documentElement.setAttribute('data-theme', 'dark')
          setDarkMode(true)
        } finally {
          themeInitialized.current = true
          setLoading(false)
        }
      }

      initializeTheme()
    }
  }, [session, status, setDarkMode])

  useEffect(() => {
    if (showDeleteModal && !canProceed) {
      const waitTime = WAIT_TIMES[deleteStep]
      let startTime = Date.now()
      
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / waitTime) * 100, 100)
        setButtonProgress(progress)
        
        if (progress >= 100) {
          setCanProceed(true)
          clearInterval(timer)
        }
      }, 10)

      return () => clearInterval(timer)
    }
  }, [showDeleteModal, deleteStep])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session?.user?.id) {
      console.error('No user session')
      alert('Please sign in to save your profile')
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...profile,
          userId: session.user.id // explicitly include user ID
        })
      })
      
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/profile/${session.user.id}`)
        }, 1500)
      } else {
        const error = await res.json()
        console.error('Failed to update profile:', error)
        alert(error.error || 'Failed to save profile. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  // Modify theme change handler to be more direct
  const handleThemeChange = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    setDarkMode(isDark)
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, darkMode: isDark }
    }))
  }

  const resetModal = () => {
    setShowDeleteModal(false)
    setDeleteStep(0)
    setButtonProgress(0)
    setCanProceed(false)
  }

  const handleDeleteAccount = async () => {
    if (!canProceed) return

    if (deleteStep < 1) {
      setDeleteStep(prev => prev + 1)
      setCanProceed(false)
      setButtonProgress(0)
      return
    }

    setDeleteLoading(true)
    setShowGoodbye(true) // Add this line

    // Add a delay to show the goodbye animation
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: session.user.id }), // Add user ID in body
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok && data.success) {
        await signOut({ 
          redirect: false,
          callbackUrl: '/auth/signin?deleted=true'
        })
        router.push('/auth/signin?deleted=true')
      } else {
        throw new Error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setShowGoodbye(false) // Add this line
      setShowDeleteModal(false)
      setDeleteStep(0)
      alert('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalClose = (e) => {
    // Only close if clicking the backdrop
    if (e.target === e.currentTarget && !deleteLoading) {
      resetModal();
    }
  }

  const handleDeleteNext = () => {
    if (!canProceed) return;
    
    if (deleteStep < 1) {
      setDeleteStep(prev => prev + 1);
      setCanProceed(false);
      setButtonProgress(0);
    } else {
      handleDeleteAccount();
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30">
        <UserMenu />
        <div className="flex justify-center items-center h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-xl font-medium text-center p-4"
          >
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {showGoodbye && (
          <>
            <motion.div
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.33, 1, 0.68, 1], // Custom easing for garage door effect
                  bounce: 0.2
                }
              }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.6,
                  ease: "easeOut"
                }
              }}
              className="fixed inset-0 z-[61] flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotate: -8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: 8,
                  transition: {
                    delay: 0.5,
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.4
                  }
                }}
                className="relative"
              >
                <span 
                  className="text-white/90 text-6xl md:text-8xl select-none"
                  style={{
                    fontFamily: "'Playfair Display', serif", // More elegant font
                    textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
                  }}
                >
                  Goodbye!
                </span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.8, duration: 0.5 }
                  }}
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  See you next time 👋
                </motion.span>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleModalClose}
          >
            <motion.div 
              className="relative w-full max-w-2xl mx-auto bg-background/95 backdrop-blur-xl border-2 rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-primary/5" />
              <div className="relative p-8 space-y-6">
                <div className="space-y-2">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-8 w-1 bg-destructive rounded-full" />
                    <h3 className="text-sm font-medium text-destructive">
                      {deleteConfirmationSteps[deleteStep].subtitle}
                    </h3>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-destructive flex items-center gap-3">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-8 h-8" />
                    {deleteConfirmationSteps[deleteStep].title}
                  </h2>
                  <p className="text-lg text-foreground/80">
                    {deleteConfirmationSteps[deleteStep].message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                  {deleteConfirmationSteps[deleteStep].details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-lg bg-background/50 border border-border/50 backdrop-blur-sm"
                    >
                      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center ${detail.color} bg-background border-2 border-current`}>
                        <FontAwesomeIcon icon={detail.icon} className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-foreground/80 mt-2">
                        {detail.text}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  {!deleteLoading && (
                    <motion.button
                      type="button"
                      onClick={resetModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 h-12 rounded-md bg-background text-foreground border-2 border-input hover:bg-accent hover:text-accent-foreground transition-colors text-base font-medium"
                    >
                      Cancel
                    </motion.button>
                  )}
                  <div className="relative">
                    <AnimatePresence>
                      {!canProceed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-destructive rounded-md z-10 border-2 border-destructive"
                        >
                          <svg className="w-7 h-7" viewBox="0 0 44 44">
                            <circle
                              className="text-white/30"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="transparent"
                              r="16"
                              cx="22"
                              cy="22"
                            />
                            <motion.circle
                              className="text-white"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="transparent"
                              r="16"
                              cx="22"
                              cy="22"
                              strokeDasharray="100.53"
                              strokeDashoffset={100.53 - (buttonProgress * 100.53) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button
                      type="button"
                      disabled={deleteLoading || !canProceed}
                      onClick={handleDeleteNext}
                      whileHover={canProceed ? { scale: 1.02 } : {}}
                      whileTap={canProceed ? { scale: 0.98 } : {}}
                      className={`relative px-6 h-12 rounded-md text-base font-medium transition-all min-w-[160px] border-2
                        ${canProceed 
                          ? 'bg-destructive text-white border-destructive hover:bg-destructive/90' 
                          : 'bg-destructive text-white/90 border-destructive'
                        }`}
                    >
                      {deleteLoading ? (
                        <span className="flex items-center justify-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full"
                          />
                          Deleting...
                        </span>
                      ) : (
                        <motion.span
                          animate={canProceed ? { scale: [1.05, 1] } : {}}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center gap-2"
                        >
                          {canProceed && <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />}
                          {canProceed ? deleteConfirmationSteps[deleteStep].buttonText : ""}
                        </motion.span>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30 pb-20">
        <UserMenu />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="container mx-auto px-4 py-8 max-w-4xl"
        >
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              Profile saved successfully!
            </motion.div>
          )}
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
                <FontAwesomeIcon icon={faEye} className="text-primary" />
                <h2 className="text-xl font-semibold">Profile Visibility</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'showFollowers', label: 'Show Followers Count' },
                  { key: 'showLocation', label: 'Show Location' },
                  { key: 'showJoinDate', label: 'Show Join Date' },
                  { key: 'showBio', label: 'Show Bio' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-foreground/80">{label}</span>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          [key]: !prev.preferences[key]
                        }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profile.preferences[key] ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profile.preferences[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-6">
                <FontAwesomeIcon icon={faDroplet} className="text-primary" />
                <h2 className="text-xl font-semibold">Profile Color Scheme</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground/80">
                  Choose your profile accent color
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    '#7C3AED', // Purple
                    '#2563EB', // Blue
                    '#DC2626', // Red
                    '#059669', // Green
                    '#D97706', // Orange
                    '#DB2777', // Pink
                    '#4F46E5', // Indigo
                    '#0891B2', // Cyan
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, colorScheme: color }
                      }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        profile.preferences.colorScheme === color 
                          ? 'scale-125 ring-2 ring-offset-2 ring-offset-background ring-white'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div 
                  className="mt-4 p-4 rounded-lg border border-border/50"
                  style={{ 
                    backgroundColor: profile.preferences.colorScheme + '10',
                    borderColor: profile.preferences.colorScheme + '30'
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{ color: profile.preferences.colorScheme }}
                  >
                    Preview of your accent color
                  </span>
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
                    <span>Light Mode (experimental)</span>
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

            <motion.div
              variants={itemVariants}
              className="bg-card text-card-foreground rounded-lg border shadow-sm"
            >
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-lg font-semibold leading-none tracking-tight text-destructive flex items-center gap-2">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <div className="p-6 pt-0">
                <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:border-destructive/90 h-10 px-4 py-2 w-full"
                  >
                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
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
    </>
  )
}
