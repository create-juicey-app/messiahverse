import React from 'react';

export default function Footer() {
  return (
    <footer className="relative mt-20">
      <div 
        className="relative w-full h-48 bg-bottom bg-repeat-x"
        style={{
          backgroundImage: 'url(/bg.png)',
          imageRendering: 'pixelated',
          backgroundSize: 'auto 200%'
        }}
      >
        <div className="absolute bottom-2 w-full text-center">
          <p className="text-foreground"> Made By JuiceyDev - 2024</p>
        </div>
      </div>
    </footer>
  );
}
