import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlurImage({ src, alt, className, ...props }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 blur-xl scale-95"
          >
            <Image
              src={src || '/default-avatar.png'}
              alt={alt}
              className={className}
              width={400}
              height={400}
              quality={1}
              {...props}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Image
        src={src || '/default-avatar.png'}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        width={400}
        height={400}
        quality={100}
        onLoadingComplete={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}
