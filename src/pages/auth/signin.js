import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';

export default function SignIn() {
  const [isHovering, setIsHovering] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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
  };

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  // Updated floating animation configuration
  const floatingIconVariants = {
    initial: (i) => ({
      x: 0,
      y: 0,
      opacity: 0
    }),
    animate: (i) => ({
      opacity: 1,
      x: [0, Math.sin(i * 0.5) * 30],
      y: [0, Math.cos(i * 0.5) * 30],
      transition: {
        opacity: { duration: 0.3 },
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 5 + (i % 3) * 2,
          ease: "easeInOut"
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 6 + (i % 3) * 2,
          ease: "easeInOut"
        }
      }
    })
  };

  // Pre-calculate background elements to ensure they're stable
  const backgroundElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: `${(i * 17 + 7) % 100}%`,
    y: `${(i * 23 + 11) % 100}%`,
    size: 20 + (i % 3) * 15,
    type: i % 3
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-surface/30">
      <Head>
        <title>Join Messiahverse - Your Creative Universe</title>
      </Head>

      {/* Updated background elements container */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
              willChange: 'transform'
            }}
            initial="initial"
            animate="animate"
            variants={floatingIconVariants}
            custom={element.id}
          >
            <svg
              width={element.size}
              height={element.size}
              viewBox="0 0 24 24"
              className="text-primary/10"
            >
              {element.type === 0 ? (
                // Pixel art star
                <path fill="currentColor" d="M12 0l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z"/>
              ) : element.type === 1 ? (
                // Pixel art heart
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              ) : (
                // Pixel art diamond
                <path fill="currentColor" d="M12 2L2 12l10 10 10-10L12 2z"/>
              )}
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-surface/95 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl"
          >
            <motion.div 
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-primary mb-4">
                Messiahverse
              </h1>
              <p className="text-foreground/80">
                Your gateway to a creative universe of Nikosonas
              </p>
            </motion.div>

            <div className="space-y-4">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: "var(--primary)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn('github', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 px-6 py-4
                         bg-surface/80 border-2 border-primary/20 rounded-xl
                         text-foreground hover:text-white transition-all duration-300
                         group shadow-lg hover:shadow-primary/20"
              >
                <FontAwesomeIcon icon={faGithub} className="text-2xl" />
                <span className="font-medium">Continue with GitHub</span>
              </motion.button>

              {/* Disabled buttons with warning pattern */}
              <div className="grid grid-cols-2 gap-4">
                {['Discord', 'Google'].map((provider, i) => (
                  <motion.button
                    key={provider}
                    variants={itemVariants}
                    disabled
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                    className="relative flex items-center justify-center gap-2 px-4 py-3
                             bg-surface/50 border border-border rounded-xl
                             disabled:opacity-70 disabled:cursor-not-allowed
                             overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center gap-2">
                      <FontAwesomeIcon 
                        icon={i === 0 ? faDiscord : faGoogle} 
                        className="text-xl opacity-50"
                      />
                      <span className="opacity-50">{provider}</span>
                    </div>
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          var(--warning-transparent) 0px,
                          var(--warning-transparent) 10px,
                          transparent 10px,
                          transparent 20px
                        )`
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip.visible && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed z-50 px-4 py-2 text-sm text-white bg-black/90 rounded-md
                           shadow-lg pointer-events-none whitespace-nowrap"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  Not Available Right Now
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={itemVariants}
              className="mt-6 text-center text-sm text-foreground/60"
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
