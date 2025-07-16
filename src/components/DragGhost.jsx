import { BLOCK_COLORS } from '../atoms/gameAtoms';
import { motion } from 'framer-motion';

export default function DragGhost({ piece, position, isValidDrop }) {
  if (!piece) return null;

  return (
    <motion.div
      className={`fixed pointer-events-none z-50 ${
        isValidDrop ? 'drop-shadow-2xl' : 'drop-shadow-lg'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
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
      <div className={`p-2 bg-[#3a3f5a] rounded-lg shadow-2xl border-2 ${
        isValidDrop 
          ? 'border-green-400 bg-green-900/20 glow-green' 
          : 'border-red-400 bg-red-900/20 glow-red'
      }`}>
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
                    src={`/src/assets/images/${BLOCK_COLORS[piece.color].image}`} 
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
  );
}
