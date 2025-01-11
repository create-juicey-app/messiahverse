import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function DraggableImage({ 
  src, 
  alt, 
  initialPosition = { x: 0, y: 0 },
  onPositionChange
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        // Notify parent of position change
        onPositionChange?.(position);
      }}
      onDrag={(event, info) => {
        const newPos = { x: info.point.x, y: info.point.y };
        setPosition(newPos);
      }}
      className={`absolute cursor-move ${isDragging ? 'z-50' : 'z-10'}`}
      style={{ 
        touchAction: 'none',
        x: position.x,
        y: position.y
      }}
    >
      <img
        id={src}
        src={src}
        alt={alt}
        className="max-w-[300px] rounded-lg shadow-lg"
      />
    </motion.div>
  );
}
