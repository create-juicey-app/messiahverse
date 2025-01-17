import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faCog, 
  faSignOutAlt, 
  faCircleUser, 
  faChevronRight,
  faHome,
  faCompass,
  faUsers
} from '@fortawesome/free-solid-svg-icons'
import { useImageCache } from '@/contexts/ImageCache'

export default function UserMenu({ currentPost }) {
  const { data: session, status } = useSession()
  const { cachedImages, cacheImage } = useImageCache()
  const [isOpen, setIsOpen] = useState(false)
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    const path = pathname.split('/')[1] || 'home'
    setActivePage(path.toLowerCase())
  }, [pathname])

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore')
    if (hasVisited) {
      setIsFirstVisit(false)
    } else {
      localStorage.setItem('hasVisitedBefore', 'true')
    }
  }, [])

  // Cache the profile image when session changes
  useEffect(() => {
    if (session?.user?.image) {
      cacheImage('profilePic', session.user.image);
    }
  }, [session?.user?.image, cacheImage]);

  const profileImage = cachedImages['profilePic'] || session?.user?.image || '/default-avatar.png';

  const buttonVariants = {
    hover: { 
      boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.3)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  }

  const menuVariants = {
    initial: { opacity: 0, y: -20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    },
    hover: { 
      x: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  }

  const navExpandVariants = {
    initial: { 
      width: 0,
      x: -50,
      opacity: 0,
    },
    animate: { 
      width: 'auto',
      x: 0,
      opacity: 1,
      transition: {
        width: { 
          type: "easeInOut",
          duration: 0.4,
          ease: [0.87, 0, 0.13, 1] // Custom quad easing
        },
        x: { 
          type: "easeOut",
          duration: 0.3,
          delay: 0.1
        },
        opacity: { 
          duration: 0.3,
          delay: 0.1
        }
      }
    },
    exit: { 
      width: 0,
      x: -50,
      opacity: 0,
      transition: {
        width: { 
          type: "easeInOut",
          duration: 0.3,
          ease: [0.87, 0, 0.13, 1]
        },
        x: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }
    }
  }

  const navItemVariants = {
    initial: { 
      opacity: 0,
      scale: 0.9,
    },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  }

  const isOwner = currentPost && session?.user?.id === currentPost.authorId

  const navigationItems = [
    { name: 'Home', icon: faHome, path: '/' },
    { name: 'Explore', icon: faCompass, path: '/explore' },
    { name: 'Community', icon: faUsers, path: '/community' },
    { name: 'Profile', icon: faCircleUser, path: session ? `/profile/${session.user.id}` : '/auth/signin' }
  ]

  // Mobile Bottom Navigation
  const BottomNav = () => (
    <motion.div
      initial={isFirstVisit ? { y: 100 } : false}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 border-t 
                 border-primary/20 bottom-nav mobile-only z-50"
    >
      <nav className="flex h-full max-w-lg mx-auto">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`bottom-nav-item ${
              activePage === item.name.toLowerCase() ? 'active' : ''
            }`}
          >
            <FontAwesomeIcon 
              icon={item.icon} 
              className={`text-xl mb-1 transition-transform duration-200 ${
                activePage === item.name.toLowerCase() ? 'scale-110' : ''
              }`}
            />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </motion.div>
  )

  if (status === 'loading') {
    return (
      <div className="fixed top-6 left-6 z-50 h-14 px-4 rounded-full bg-surface/95 backdrop-blur-sm 
        border-2 border-primary/20 shadow-lg flex items-center gap-3 min-w-[200px]"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-primary/10 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="fixed top-6 left-6 z-50 h-14 px-4 rounded-full bg-surface/95 backdrop-blur-sm 
          border-2 border-primary/20 shadow-lg min-w-[120px]"
        onClick={() => window.location.href = '/auth/signin'}
      >
        <div className="text-primary flex items-center gap-3">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-base font-medium">Login</span>
        </div>
      </motion.button>
    )
  }

  return (
    <>
      <div className="fixed top-6 left-6 z-50 flex items-start mobile-hidden">
        <div className="flex items-center relative">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex items-center h-14 rounded-full bg-surface/95 backdrop-blur-sm 
              border-2 border-primary shadow-lg transition-all duration-300
              relative z-10"
          >
            <button
              className="flex items-center gap-3 px-4"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="w-10 h-10 rounded-full relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
                )}
                <img 
                  src={profileImage}
                  alt={session.user.name}
                  className={`w-full h-full rounded-full object-cover flex-shrink-0 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  } transition-opacity duration-200`}
                  loading="eager"
                  decoding="sync"
                  onLoad={() => setImageLoading(false)}
                />
              </div>
              <div className="max-w-[150px] overflow-x-auto scrollbar-hide">
                <span className="text-base font-medium whitespace-nowrap">
                  {session.user.name}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className="px-3 border-l-2 border-primary h-full flex items-center
                       relative after:content-[''] after:absolute after:right-0 after:top-0 
                       after:w-[2px] after:h-full "
            >
              <motion.div
                animate={{ 
                  rotate: isNavExpanded ? 180 : 0,
                  scale: isNavExpanded ? 1.1 : 1
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
              </motion.div>
            </button>
          </motion.div>

          <AnimatePresence>
            {isNavExpanded && (
              <motion.div
                variants={navExpandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-14 bg-surface-dark/95 backdrop-blur-sm rounded-full border-2 border-primary
                  shadow-lg overflow-hidden flex items-center justify-end px-12 absolute left-full ml-[-48px]"
                style={{ originX: 0 }}
              >
                <nav className="flex items-center gap-6 px-2 whitespace-nowrap ml-auto">
                  {['Home', 'Explore', 'Community'].map((item, index) => (
                    <motion.div
                      key={item}
                      variants={{
                        ...navItemVariants,
                        animate: {
                          ...navItemVariants.animate,
                          transition: {
                            delay: 0.3 + (index * 0.05),
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                          }
                        }
                      }}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      className="transform-gpu" // Add GPU acceleration
                    >
                      <Link 
                        href={`/${item.toLowerCase()}`} 
                        className="flex items-center gap-2 text-foreground/80 hover:text-foreground
                                 transition-all duration-200"
                      >
                        <FontAwesomeIcon 
                          icon={
                            item === 'Home' ? faHome :
                            item === 'Explore' ? faCompass : faUsers
                          }
                          className="transition-transform duration-200 group-hover:scale-110" 
                        />
                        <span>{item}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-16 left-0 bg-surface/95 backdrop-blur-sm rounded-lg 
                       border border-border shadow-lg p-2 min-w-[220px]"
            >
              <motion.div 
                variants={menuItemVariants}
                className="overflow-hidden"
              >
                <Link 
                  href={`/profile/${session.user.id}`}
                  className="block p-4 border-b border-border hover:bg-primary/10 rounded-t-lg
                           transition-all duration-200 group"
                >
                  <motion.div 
                    className="flex items-center gap-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FontAwesomeIcon 
                      icon={faCircleUser} 
                      className="text-2xl" 
                    />
                    <div>
                      <p className="font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-sm text-foreground/60">Emails probably??</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>

              <ul className="py-2">
                <motion.li 
                  variants={menuItemVariants}
                  className="overflow-hidden"
                >
                  <Link href="/settings/profile" 
                        className="flex items-center gap-4 px-4 py-3 hover:bg-primary/10 rounded
                                 transition-all duration-200 group"
                  >
                    <FontAwesomeIcon icon={faCog} 
                      className="text-lg transform group-hover:rotate-90 transition-transform duration-300" 
                    />
                    <motion.span 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      Settings
                    </motion.span>
                  </Link>
                </motion.li>
                <motion.li 
                  variants={menuItemVariants}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 px-4 py-3 w-full text-left hover:bg-primary/10 rounded
                             transition-all duration-200 group"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} 
                      className="text-lg transform group-hover:-translate-x-1 transition-transform duration-300" 
                    />
                    <motion.span 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      Sign out
                    </motion.span>
                  </button>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {session && <BottomNav />}
      </AnimatePresence>
    </>
  )
}
