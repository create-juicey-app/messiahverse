import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DesktopNav({ navRef, navPosition }) {
  return (
    <motion.aside 
      className="w-64 shrink-0 hidden lg:block relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <nav ref={navRef} 
        className="bg-surface/95 backdrop-blur-sm p-4 rounded-lg border border-border"
        style={{ transform: `translateY(${navPosition}px)` }}
      >
        <h2 className="font-bold text-primary mb-4">Navigation</h2>
        <ul className="space-y-2">
          <li><Link href="/upload" className="text-foreground hover:text-primary">Share Your Nikosona</Link></li>
          <li><Link href="/explore" className="text-foreground hover:text-primary">Explore Nikosonas</Link></li>
          <li><Link href="/gallery" className="text-foreground hover:text-primary">Gallery</Link></li>
          <li><Link href="/about" className="text-foreground hover:text-primary">About Nikosonas</Link></li>
        </ul>
      </nav>
    </motion.aside>
  )
}
