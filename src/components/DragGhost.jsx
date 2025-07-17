import { BLOCK_COLORS } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function DragGhost({ piece, position, isValidDrop }) {
  if (!piece) return null;

  // Detect if we're on mobile/touch device
  const isMobile = 'ontouchstart' in window;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-20 opacity-0"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1.05, // Slightly larger when dragging
          opacity: 0, // Keep it invisible
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
      <div className="p-2 bg-[#3a3f5a] rounded-lg border-2 border-[#4a537a]">
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
  </>
  );
}
