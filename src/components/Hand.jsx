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
      <div className="bg-gradient-to-r from-[#1a1a2e]/80 to-[#2a2a4e]/80 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 p-1 sm:p-1 md:p-1.5">
        {/* Hand Label */}
        <div className="text-center mb-0.5 sm:mb-1 md:mb-1">
          <div className="text-xs sm:text-xs md:text-xs text-gray-400 font-silkscreen uppercase tracking-wider">Next Pieces</div>
        </div>
        
        {/* Pieces Container */}
        <div className="flex justify-center items-center gap-1 sm:gap-1 md:gap-1.5 min-h-[30px] sm:min-h-[35px] md:min-h-[40px]">
          {hand.map((piece, index) => (
            <div 
              key={piece.id || index} 
              className={`relative transition-all duration-500 mobile-touch-zone ${
                isNewBatch ? 'animate-pulse scale-110' : 'hover:scale-105'
              } ${dragState.isDragging && dragState.draggedItem?.index === index ? 'piece-dragging touch-feedback' : ''}`}
            >
              {/* Piece Container */}
              <div className="relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1a1f3a]/80 rounded-md sm:rounded-lg border border-white/10 shadow-lg p-0.5 sm:p-0.5 md:p-1">
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
            <div className="flex justify-center items-center p-2 sm:p-3 md:p-4">
              <div className="text-center">
                <div className="text-gray-400 font-silkscreen text-xs sm:text-sm animate-pulse mb-2">
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