import { BLOCK_COLORS } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function DragGhost({ piece, position, isValidDrop }) {
  if (!piece) return null;

  // Detect if we're on mobile/touch device
  const isMobile = 'ontouchstart' in window;
  
  // Calculate the shadow position accounting for mobile offset
  // On mobile, the dragged object is offset above the finger, so we need to position the shadow
  // relative to where the object would naturally be (at the touch position)
  const mobileOffset = isMobile ? Math.max(180, window.innerHeight * 0.25) : 0;
  const shadowPosition = {
    x: position.x,
    y: position.y + mobileOffset - 60 // Position shadow way up above the natural touch position
  };

  return (
    <>
      <motion.div
        className={`fixed pointer-events-none z-20 ${
          isValidDrop ? 'drop-shadow-2xl' : 'drop-shadow-lg'
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7)) drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))', // Enhanced multi-layered shadow
        }}
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ 
          scale: 1.05, // Slightly larger when dragging
          opacity: 0.95,
          rotate: [0, 0.5, -0.5, 0]
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          rotate: {
            duration: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
      >
      <div className={`p-2 bg-[#3a3f5a] rounded-lg border-2 ${
        isValidDrop 
          ? 'border-green-400 bg-green-900/20 glow-green shadow-green-500/50' 
          : 'border-red-400 bg-red-900/20 glow-red shadow-red-500/50'
      } shadow-2xl`} style={{
        boxShadow: isValidDrop 
          ? '0 35px 60px -12px rgba(34, 197, 94, 0.6), 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.3)' 
          : '0 35px 60px -12px rgba(239, 68, 68, 0.6), 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.3)'
      }}>
        <div className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
        }}>
          {piece.shape.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              cell ? (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-[28px] h-[28px] bg-[#4a537a] border border-[#2a2a3e] rounded-md overflow-hidden"
                >
                  <img 
                    src={`/${BLOCK_COLORS[piece.color].image}`} 
                    alt="block" 
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: BLOCK_COLORS[piece.color].filter,
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ) : (
                <div key={`${rowIndex}-${colIndex}`} className="w-[28px] h-[28px]" />
              )
            ))
          )}
        </div>
      </div>
    </motion.div>
    
    {/* Shadow directly under the dragged shape at its natural position */}
    <motion.div
      className="fixed pointer-events-none z-10"
      style={{
        left: shadowPosition.x,
        top: shadowPosition.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 0.9, // Slightly smaller than the dragged object
        opacity: 0.4,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30
      }}
    >
      <div className="grid gap-1 blur-[2px]" style={{
        gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
      }}>
        {piece.shape.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            cell ? (
              <div
                key={`shadow-${rowIndex}-${colIndex}`}
                className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] bg-black/50 rounded-md"
              />
            ) : (
              <div key={`shadow-${rowIndex}-${colIndex}`} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]" />
            )
          ))
        )}
      </div>
    </motion.div>
  </>
  );
}
