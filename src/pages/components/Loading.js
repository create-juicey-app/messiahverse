import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Loading() {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLightTheme, setIsLightTheme] = useState(false);

    useEffect(() => {
        setIsLightTheme(document.documentElement.getAttribute('data-theme') === 'light');
    }, []);

    const containerVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { 
            opacity: 0,
            transition: { duration: 0.5 }
        }
    };

    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
            <div className="relative">
                {!imageLoaded && (
                    <motion.div
                        variants={spinnerVariants}
                        animate="animate"
                        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                    />
                )}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: imageLoaded ? 1 : 0,
                        scale: imageLoaded ? 1 : 0.8 
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Image
                        src="/loading.webp"
                        width={200}
                        height={200}
                        alt="Loading"
                        className={`image-rendering-pixelated ${isLightTheme ? 'invert' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        priority
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
