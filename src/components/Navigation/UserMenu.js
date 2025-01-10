import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCog, faSignOutAlt, faSpinner, faCircleUser } from '@fortawesome/free-solid-svg-icons'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.3)",
    },
    tap: { scale: 0.95 }
  }

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    hover: { x: 5 }
  }

  if (status === 'loading') {
    return (
      <motion.div
        className="fixed top-6 left-6 z-50 p-4 rounded-full bg-surface/95 backdrop-blur-sm"
      >
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-xl" />
      </motion.div>
    )
  }

  if (!session) {
    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="fixed top-6 left-6 z-50 p-4 rounded-full bg-surface/95 backdrop-blur-sm 
                 border-2 border-primary/20 shadow-lg"
      >
        <Link href="/auth/signin" className="text-primary">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
        </Link>
      </motion.button>
    )
  }

  return (
    <div className="fixed top-6 left-6 z-50">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 
                 shadow-lg transition-shadow duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={session.user.image || '/default-avatar.png'} 
          alt={session.user.name}
          className="w-full h-full object-cover"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 bg-surface/95 backdrop-blur-sm rounded-lg 
                     border border-border shadow-lg p-2 min-w-[220px]"
          >
            <Link 
              href={`/profile/${session.user.id}`}
              className="block p-4 border-b border-border hover:bg-primary/10 rounded-t-lg
                       transition-all duration-200 group"
            >
              <motion.div 
                className="flex items-center gap-4"
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
              >
                <FontAwesomeIcon 
                  icon={faCircleUser} 
                  className="text-2xl text-primary/60 group-hover:text-primary transition-colors duration-200" 
                />
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors duration-200">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-foreground/60">{session.user.email}</p>
                </div>
              </motion.div>
            </Link>
            <ul className="py-2">
              <motion.li variants={menuItemVariants}>
                <Link href="/settings/profile" 
                      className="flex items-center gap-4 px-4 py-3 hover:bg-primary/10 rounded
                               transition-all duration-200 group"
                >
                  <FontAwesomeIcon icon={faCog} className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Settings</span>
                </Link>
              </motion.li>
              <motion.li variants={menuItemVariants}>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-4 px-4 py-3 w-full text-left hover:bg-primary/10 rounded
                           transition-all duration-200 group"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Sign out</span>
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
