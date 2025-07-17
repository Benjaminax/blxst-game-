import { motion } from 'framer-motion';
import { useState } from 'react';
import { BLOCK_COLORS } from '../atoms/gameAtoms';

export default function Piece({ piece, index, onDragStart, isDragging }) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e) => {
    // Prevent multiple touches on mobile
    if (e.touches && e.touches.length > 1) return;
    
    setIsPressed(true);
    onDragStart(index, piece, e);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  return (
    <motion.div
      className={`cursor-grab select-none touch-manipulation relative no-select mobile-piece ${
        isDragging ? 'cursor-grabbing opacity-60 piece-dragging' : ''
      } ${isPressed ? 'scale-95 touch-feedback' : ''}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.1 }}
      animate={{ scale: isDragging ? 0.9 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ 
        // Improve touch target size on mobile
        padding: '6px',
        margin: '-6px',
        touchAction: 'none', // Prevent default touch behaviors
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Enhanced mobile drag feedback */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-lg sm:rounded-xl animate-pulse border-2 border-blue-400/60 -m-1"></div>
      )}
      
      {/* Piece container */}
      
      {/* Piece Container */}
      <div className="relative bg-gradient-to-br from-[#3a3f5a]/90 to-[#2a2f4a]/90 rounded-lg sm:rounded-xl shadow-xl border border-white/10 p-1 sm:p-1.5">
        {/* Piece Grid */}
        <div className="grid gap-[1px] sm:gap-[1px]" style={{
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
        }}>
          {piece.shape.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              cell ? (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] rounded-md sm:rounded-lg overflow-hidden relative shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${BLOCK_COLORS[piece.color].gradient || '#4a537a'}, ${BLOCK_COLORS[piece.color].gradientEnd || '#3a3f5a'})`
                  }}
                >
                  {/* Block Image */}
                  <img 
                    src={`/${BLOCK_COLORS[piece.color].image}`} 
                    alt="block" 
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: `${BLOCK_COLORS[piece.color].filter} drop-shadow(0 1px 2px rgba(0,0,0,0.4))`,
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* Block Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-md sm:rounded-lg pointer-events-none"></div>
                  
                  {/* Block Border */}
                  <div className="absolute inset-0 border border-white/20 rounded-md sm:rounded-lg pointer-events-none"></div>
                </div>
              ) : (
                <div key={`${rowIndex}-${colIndex}`} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]" />
              )
            ))
          )}
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 hover:from-blue-400/10 hover:to-purple-400/10 transition-all duration-300 pointer-events-none"></div>
    </motion.div>
  );
}