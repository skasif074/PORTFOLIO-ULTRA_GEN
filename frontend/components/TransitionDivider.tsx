'use client';

import { motion } from 'framer-motion';

interface TransitionDividerProps {
  direction: 'yellow-to-black' | 'black-to-yellow';
  style?: 'fade' | 'stripes';
}

export default function TransitionDivider({ direction, style = 'stripes' }: TransitionDividerProps) {
  
  // Option 1: A smooth color gradient fade
  if (style === 'fade') {
    return (
      <div 
        className={`w-full h-32 md:h-48 border-x-0 z-20 relative ${
          direction === 'yellow-to-black' 
            ? 'bg-gradient-to-b from-[#BFFF00] to-black' 
            : 'bg-gradient-to-b from-black to-[#BFFF00]'
        }`} 
      />
    );
  }

  // Option 2: Brutalist Hazard Stripes (Highly Recommended for this theme)
  const stripeColor = direction === 'yellow-to-black' ? 'bg-[#BFFF00]' : 'bg-black';
  const borderTop = direction === 'yellow-to-black' ? 'border-t-[#BFFF00]' : 'border-t-black';
  const borderBottom = direction === 'yellow-to-black' ? 'border-b-black' : 'border-b-[#BFFF00]';

  return (
    <div className="w-full overflow-hidden relative z-20 border-y-4 border-black">
      {/* Background layer */}
      <div className={`absolute inset-0 ${stripeColor}`} />
      
      {/* Moving Stripes */}
      <motion.div 
        animate={{ x: [0, -100] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="w-[200%] h-12 md:h-16 flex items-center opacity-40 relative z-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, black 20px, black 40px)'
        }}
      />
    </div>
  );
}