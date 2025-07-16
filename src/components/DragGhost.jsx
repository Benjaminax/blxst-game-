import { BLOCK_COLORS } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function DragGhost({ piece, position, isValidDrop }) {
  if (!piece) return null;

  return (
    <motion.div
      className={`fixed pointer-events-none z-50 drag-ghost ${
        isValidDrop ? 'drop-shadow-2xl' : 'drop-shadow-lg'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.7))', // Enhanced shadow for better visibility at increased distance
      }}
      initial={{ scale: 0.8, opacity: 0.7 }}
      animate={{ 
        scale: 1.1, // Slightly larger for better visibility
        opacity: 0.98, // More opaque for better visibility
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, // Slightly less stiff for smoother movement
        damping: 25, // Reduced damping for more responsive feel
        rotate: {
          duration: 0.4,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }}
    >
      <div className={`p-3 bg-[#3a3f5a] rounded-lg shadow-2xl border-2 ${
        isValidDrop 
          ? 'border-green-400 bg-green-900/30 glow-green' 
          : 'border-red-400 bg-red-900/30 glow-red'
      }`}
      style={{
        boxShadow: isValidDrop 
          ? '0 0 25px rgba(34, 197, 94, 0.6), 0 0 50px rgba(34, 197, 94, 0.4)' 
          : '0 0 25px rgba(239, 68, 68, 0.6), 0 0 50px rgba(239, 68, 68, 0.4)'
      }}
      >
        <div className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
        }}>
          {piece.shape.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              cell ? (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-[32px] h-[32px] bg-[#4a537a] border border-[#2a2a3e] rounded-md overflow-hidden"
                >
                  <img 
                    src={BLOCK_COLORS[piece.color].image} 
                    alt="block" 
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: BLOCK_COLORS[piece.color].filter,
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ) : (
                <div key={`${rowIndex}-${colIndex}`} className="w-[32px] h-[32px]" />
              )
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
