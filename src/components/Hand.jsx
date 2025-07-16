import { useAtom } from 'jotai';
import { handAtom } from '../atoms/gameAtoms';
import { useEffect, useState } from 'react';
import Piece from './Piece';

export default function Hand({ onPieceDragStart, dragState }) {
  const [hand] = useAtom(handAtom);
  const [isNewBatch, setIsNewBatch] = useState(false);

  useEffect(() => {
    // Trigger animation when hand is refilled
    if (hand.length === 3) {
      setIsNewBatch(true);
      const timer = setTimeout(() => setIsNewBatch(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hand.length]);

  return (
    <div className="relative">
      {/* Hand Background */}
      <div className="bg-gradient-to-r from-[#1a1a2e]/90 to-[#2a2a4e]/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl border border-white/20 p-1.5 sm:p-2 md:p-2">
        {/* Hand Label - Better visibility on mobile */}
        <div className="text-center mb-1 sm:mb-1 md:mb-2">
          <div className="text-xs sm:text-xs md:text-xs text-gray-300 font-silkscreen uppercase tracking-wider">Next</div>
        </div>
        
        {/* Pieces Container - Better spacing on mobile */}
        <div className="flex justify-center items-center gap-1 sm:gap-1 md:gap-2 min-h-[40px] sm:min-h-[40px] md:min-h-[50px]">
          {hand.map((piece, index) => (
            <div 
              key={piece.id || index} 
              className={`relative transition-all duration-200 mobile-touch-zone ${
                isNewBatch ? 'animate-pulse scale-110' : 'hover:scale-105'
              } ${dragState.isDragging && dragState.draggedItem?.index === index ? 'piece-dragging touch-feedback' : ''}`}
            >
              {/* Piece Glow Effect - Reduced on mobile */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-md sm:rounded-lg blur-sm scale-105 sm:scale-110"></div>
              
              {/* Piece Container - Better visibility on mobile */}
              <div className="relative bg-gradient-to-br from-[#2a2f4a]/90 to-[#1a1f3a]/90 rounded-md sm:rounded-lg border border-white/20 shadow-lg p-1 sm:p-1 md:p-1.5">
                <Piece
                  piece={piece}
                  index={index}
                  onDragStart={onPieceDragStart}
                  isDragging={dragState.isDragging && dragState.draggedItem?.index === index}
                />
              </div>
              
              {/* Piece Number Indicator */}
              <div className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-silkscreen shadow-lg">
                {index + 1}
              </div>
            </div>
          ))}
          
          {hand.length === 0 && (
            <div className="flex justify-center items-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-[#1a1a2e]/50 to-[#2a2a4e]/50 rounded-lg border border-white/10">
              <div className="text-center">
                <div className="text-gray-300 font-silkscreen text-xs sm:text-sm animate-pulse mb-2">
                  New batch incoming...
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}