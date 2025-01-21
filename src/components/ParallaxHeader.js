import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxHeader() {
    const [windowHeight, setWindowHeight] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const { scrollY } = useScroll();

    // Update window dimensions and mobile status on mount and resize
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function computeParallax(index, isMobile, scrollY, windowHeight) {
        const mobileOffsets = { 6: 150, 5: 125, 4: 100, 3: 75, 2: 50, 1: 25, 0: 10 };
        const offset = isMobile
            ? mobileOffsets[index] || 0
            : (6 - index) * 50;
        const y = useTransform(scrollY, [0, windowHeight], [0, offset]);
        const baseScale = isMobile ? 0.8 : 1;
        const scale = baseScale + (index * 0.01);
        return { y, scale };
    }

    // Remove getLayerWidth function as it's no longer needed

    function getLayerStyle() {
        return {
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: 10000,
            WebkitPerspective: 10000,
            // Note: remove direct transform here
        };
    }

    // Cache layer calculations
    const layers = [
        { src: '/layer6.png', ...computeParallax(6, isMobile, scrollY, windowHeight) },
        { src: '/layer5.png', ...computeParallax(5, isMobile, scrollY, windowHeight) },
        { src: '/layer4.png', ...computeParallax(4, isMobile, scrollY, windowHeight) },
        { src: '/layer3.png', ...computeParallax(3, isMobile, scrollY, windowHeight) },
        { src: '/layer2.png', ...computeParallax(2, isMobile, scrollY, windowHeight) },
        { src: '/layer1.png', ...computeParallax(1, isMobile, scrollY, windowHeight) },
        { src: '/layer0.png', ...computeParallax(0, isMobile, scrollY, windowHeight) },
    ];

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div className="absolute inset-0 grid place-items-center">
                {layers.map((layer, index) => (
                    <motion.div
                        key={index}
                        style={{
                            y: layer.y,
                            scale: layer.scale * 1.05, // slightly enlarged
                            ...getLayerStyle()
                        }}
                        initial={false}
                        loading="eager"
                    >
                        <img
                            src={layer.src}
                            alt={`Parallax Layer ${index}`}
                            className="w-auto h-auto max-h-full"
                            loading={index < 3 ? "eager" : "lazy"}
                            style={{
                                imageRendering: 'pixelated',
                                width: 'clamp(0px, 100%, 100%)',
                                objectFit: 'contain',
                                margin: 'auto',
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                            }}
                        />
                    </motion.div>
                ))}
            </div>
            {/* Gradient overlay with responsive height */}
            <div 
                className="absolute bottom-0 left-0 w-full h-24 sm:h-32 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0), var(--background-color, rgba(0,0,0,0)))'
                }}
            />
        </div>
    );
}