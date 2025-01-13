import Head from 'next/head'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import ParallaxHeader from '../components/ParallaxHeader.js'
import Footer from "../components/Footer"
import DesktopNav from '../components/Navigation/DesktopNav'
import UserMenu from '../components/Navigation/UserMenu'
import Link from 'next/link'

export default function Home() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    viewport: { once: true, margin: "-100px" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,  
    restDelta: 0.001
  });

  const navRef = useRef(null);
  const footerRef = useRef(null);
  const [navPosition, setNavPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      // Client-side only calculation
      if (window.innerWidth >= 1024) {  // lg breakpoint
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const footerTop = footerRef.current?.offsetTop ?? Infinity;
        const navHeight = navRef.current?.offsetHeight ?? 0;
        
        const targetY = scrollY < windowHeight * 0.4 
          ? 0 
          : Math.min(
              scrollY - windowHeight * 0.4,
              footerTop - navHeight - scrollY - 40
            );

        setNavPosition(targetY);
      } else {
        setNavPosition(0); // Reset position for mobile
      }
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();
    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return (
    <>
      <motion.div style={{ scaleX }} className="progress-bar" />
      <div className="grid-background" />
      <div className="relative min-h-screen">
        <Head>
          <title>Messiahverse - Nikosona Wiki</title>
          <meta name="description" content="Explore the multiverse of Niko variants" />
        </Head>

        <UserMenu />
        <ParallaxHeader />

        <div className="container mx-auto px-4 -mt-[45vh] xs:-mt-[40vh] sm:-mt-[35vh] md:-mt-[30vh] lg:-mt-48 relative z-10">
          {/* Mobile Navigation - Adjusted position */}
          <motion.nav 
            className="lg:hidden fixed top-[5.5rem] left-0 right-0 z-50 mx-4 bg-surface/95 
                     backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg 
                     safe-top safe-left safe-right"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-primary">Menu</h2>
              <button 
                className="text-primary hover:text-primary/80 p-2" 
                onClick={() => document.querySelector('#mobile-nav').classList.toggle('hidden')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
            <ul id="mobile-nav" className="hidden mt-4 space-y-2 max-h-[70vh] overflow-y-auto">
              <li><a href="/upload" className="block p-2 rounded hover:bg-primary/10">Share Your Nikosona</a></li>
              <li><a href="/explore" className="block p-2 rounded hover:bg-primary/10">Explore Nikosonas</a></li>
              <li><a href="/gallery" className="block p-2 rounded hover:bg-primary/10">Gallery</a></li>
              <li><a href="/about" className="block p-2 rounded hover:bg-primary/10">About Nikosonas</a></li>
              <li><a href="/auth/signin" className="block p-2 rounded hover:bg-primary/10">Login</a></li>
            </ul>
          </motion.nav>

          {/* Adjust spacing for mobile navigation */}
          <div className="h-28 lg:hidden"></div>

          <motion.div 
            className="flex flex-col lg:flex-row gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <DesktopNav navRef={navRef} navPosition={navPosition} />
            
            {/* Main Content */}
            <main className="flex-1 space-y-8">
              {/* Welcome Section */}
              <motion.section 
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                className="relative bg-surface/95 backdrop-blur-sm p-8 rounded-lg border border-border overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 15,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 relative">
                  Welcome to the Messiahverse
                </h2>
                <p className="text-foreground mb-4 text-lg leading-relaxed relative">
                  Meow
                </p>
              </motion.section>

              {/* Variants Grid */}
              <motion.section 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.1 }}
                className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {/* Example Enhanced Nikosona Card */}
                <motion.article 
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 30px -10px rgba(var(--primary-rgb), 0.3)"
                  }}
                  className="group bg-surface p-6 rounded-lg border border-border transition-all duration-300"
                >
                  <motion.div 
                    className="flex items-center gap-4 mb-4"
                    whileHover={{ x: 5 }}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl">🌟</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">Classic Niko</h3>
                  </motion.div>
                  <div className="bg-muted rounded-md p-4 mb-4 transform transition-transform group-hover:scale-[1.02]">
                    <p className="text-sm font-medium">Origin: OneShot</p>
                    <p className="text-sm text-foreground/80">The original messiah</p>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    Known for their love of pancakes
                  </p>
                </motion.article>
              </motion.section>

              {/* Add Explore Section */}
              <motion.section 
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-surface p-8 rounded-lg border border-border"
              >
                <h2 className="text-3xl font-bold text-primary mb-6">Explore Nikosonas</h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Random Nikosona Cards will be populated here */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-muted p-4 rounded-lg"
                  >
                    <h3 className="text-xl font-bold mb-2">Featured Nikosona</h3>
                    <p>Click to discover more amazing Nikosonas!</p>
                    <Link href="/explore" className="text-primary hover:text-primary/80 mt-4 inline-block">
                      Explore More →
                    </Link>
                  </motion.div>
                </div>
              </motion.section>

              {/* Timeline Section */}
              <motion.section 
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-surface p-8 rounded-lg border border-border"
              >
                <h2 className="text-3xl font-bold text-primary mb-6">Messiahverse Timeline</h2>
                <div className="space-y-6">
                  {/* Timeline items */}
                </div>
              </motion.section>
            </main>
          </motion.div>
        </div>
        <div ref={footerRef}>
          <Footer />
        </div>
      </div>
    </>
  )
}
