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

    // Adjusted parallax effects for responsive design
    const getMobileOffset = (index) => {
        const offsets = {
            0: 300,
            1: 250,
            2: 200,
            3: 150,
            4: 100,
            5: 50,
            6: 25,
            7: 0
        };
        return offsets[index] || 0;
    };

    const getParallaxY = (index) => {
        const offset = isMobile ? getMobileOffset(index) : index * 100;
        return useTransform(scrollY, [0, windowHeight], [0, offset]);
    };

    // Scale transforms adjusted for mobile
    const getScale = (index) => {
        const baseScale = Math.min(1, window.innerWidth / 1920);
        return (1 + (7 - index) * (isMobile ? 0.03 : 0.05)) * baseScale;
    };

    const getLayerStyle = (layer, index) => {
        return {
            position: 'absolute',
            y: layer.y,
            scale: getScale(index),
            top: 0,
            left: 0,
            right: 0,
            margin: '0 auto',
            width: '100%',
            height: '100%',
        };
    };

    // Layers array (removed title layer)
    const layers = [
        { src: '/layer6.png', y: getParallaxY(6) },
        { src: '/layer5.png', y: getParallaxY(5) },
        { src: '/layer4.png', y: getParallaxY(4) },
        { src: '/layer3.png', y: getParallaxY(3) },
        { src: '/layer2.png', y: getParallaxY(2) },
        { src: '/layer1.png', y: getParallaxY(1) },
        { src: '/layer0.png', y: getParallaxY(0) },
    ];

    return (
        <div className="relative w-full h-[60vh] sm:h-[80vh] md:h-screen overflow-hidden">
            <div className="absolute inset-0 max-w-[1920px] mx-auto">
                {layers.map((layer, index) => (
                    <motion.div
                        key={index}
                        style={getLayerStyle(layer, index)}
                        className="will-change-transform"
                    >
                        <img
                            src={layer.src}
                            alt={`Parallax Layer ${index}`}
                            className="w-full h-full object-contain mx-auto"
                            style={{
                                imageRendering: 'pixelated',
                                objectPosition: 'center top',
                                backfaceVisibility: 'hidden',
                                WebkitFontSmoothing: 'none',
                                mozOsxFontSmoothing: 'none',
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