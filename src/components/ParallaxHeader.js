import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxHeader() {
    const [windowHeight, setWindowHeight] = useState(0);
    const { scrollY } = useScroll();

    // Update window height on mount and resize
    useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Create parallax effects with increasing intensity for deeper layers
    const layer7Y = useTransform(scrollY, [0, windowHeight], [0, 0]); // Background (stationary)
    const layer6Y = useTransform(scrollY, [0, windowHeight], [0, 50]);
    const layer5Y = useTransform(scrollY, [0, windowHeight], [0, 100]);
    const layer4Y = useTransform(scrollY, [0, windowHeight], [0, 150]);
    const layer3Y = useTransform(scrollY, [0, windowHeight], [0, 200]);
    const layer2Y = useTransform(scrollY, [0, windowHeight], [0, 250]);
    const layer1Y = useTransform(scrollY, [0, windowHeight], [0, 300]);
    const layer0Y = useTransform(scrollY, [0, windowHeight], [0, 350]); // Foreground (most movement)

    // Layers array in correct z-index order (back to front)
    const layers = [
        { src: '/layer7.png', y: layer7Y },
        { src: '/layer6.png', y: layer6Y },
        { src: '/layer5.png', y: layer5Y },
        { src: '/layer4.png', y: layer4Y },
        { src: '/layer3.png', y: layer3Y },
        { src: '/layer2.png', y: layer2Y },
        { src: '/layer1.png', y: layer1Y },
        { src: '/layer0.png', y: layer0Y },
    ];

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {layers.map((layer, index) => (
                <motion.div
                    key={index}
                    style={{ 
                        y: layer.y,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    className="will-change-transform"
                >
                    <img
                        src={layer.src}
                        alt={`Parallax Layer ${index}`}
                        className="w-full h-full object-cover object-center-top"
                        style={{
                            imageRendering: 'pixelated',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center top'
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
}