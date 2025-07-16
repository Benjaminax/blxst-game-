import { BLOCK_COLORS } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function DragGhost({ piece, position, isValidDrop }) {
  if (!piece) return null;

  // Detect if we're on mobile/touch device
  const isMobile = 'ontouchstart' in window;

  return (
    <>
      <motion.div
        className={`fixed pointer-events-none z-50 ${
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
          scale: 1, 
          opacity: 0.9,
          rotate: [0, 1, -1, 0]
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          rotate: {
            duration: 0.3,
            repeat: Infinity,
            repeatType: "reverse"
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
    
    {/* Touch indicator for mobile - shows directly under the dragged object */}
    {isMobile && (
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          left: position.x,
          top: position.y + 60, // Position directly under the dragged shape
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 0.4,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40
        }}
      >
        <div className="w-12 h-12 bg-black/30 rounded-full border-2 border-black/40 backdrop-blur-sm" 
             style={{
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
             }} />
      </motion.div>
    )}
  </>
  );
}
