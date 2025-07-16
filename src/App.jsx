import { useAtom } from 'jotai';
import { gameStartedAtom, scoreAtom, highScoreAtom, comboAtom, boardAtom, handAtom, destructionAnimationAtom, musicPositionAtom } from './atoms/gameAtoms';
import SplashScreen from './components/SplashScreen';
import GameBoard from './components/GameBoard';
import AudioManager from './components/AudioManager';
import AudioSettings from './components/AudioSettings';
import Hand from './components/Hand';
import DragGhost from './components/DragGhost';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useEffect, useState } from 'react';

export default function App() {
  const [gameStarted, setGameStarted] = useAtom(gameStartedAtom);
  const [score, setScore] = useAtom(scoreAtom);
  const [highScore, setHighScore] = useAtom(highScoreAtom);
  const [combo, setCombo] = useAtom(comboAtom);
  const [board, setBoard] = useAtom(boardAtom);
  const [hand, setHand] = useAtom(handAtom);
  const [destructionAnimation, setDestructionAnimation] = useAtom(destructionAnimationAtom);
  const [musicPosition] = useAtom(musicPositionAtom);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [splashCompleted, setSplashCompleted] = useState(false); // This doesn't persist

  // Shared drag state for both GameBoard and footer Hand
  const { dragState, startDrag, updateDropTarget, updateDrag, endDrag } = useDragAndDrop();

  // Drag handler for footer hand
  const handleFooterPieceDragStart = (index, piece, event) => {
    startDrag({ piece, index }, event);
  };

  // Global mouse/touch move handler for drag
  useEffect(() => {
    const handleGlobalMove = (event) => {
      if (dragState.isDragging) {
        updateDrag(event);
      }
    };

    const handleGlobalEnd = (event) => {
      if (dragState.isDragging) {
        endDrag(event);
      }
    };

    if (dragState.isDragging) {
      // Add dragging class to body to prevent scrolling
      document.body.classList.add('dragging-active');
      
      document.addEventListener('mousemove', handleGlobalMove);
      document.addEventListener('touchmove', handleGlobalMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      // Remove dragging class from body
      document.body.classList.remove('dragging-active');
      
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [dragState.isDragging, updateDrag, endDrag]);

  // Show save indicator when data changes
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => setSaveStatus('saved'), 1000);
    return () => clearTimeout(timer);
  }, [score, gameStarted, musicPosition]);

  const createEmptyBoard = () => 
    Array(9).fill().map(() => Array(9).fill(null));

  const handleRestart = () => {
    // Check if current score is higher than high score and save it
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Reset game state but keep high score
    setBoard(createEmptyBoard());
    setScore(0);
    setCombo(0);
    setHand([]);
    setDestructionAnimation([]);
    // High score is automatically preserved since we don't reset it
  };

  // Always show splash screen first on page load
  if (!splashCompleted) {
    return <SplashScreen onComplete={() => setSplashCompleted(true)} />;
  }

  // Then show game based on gameStarted state
  if (!gameStarted) {
    return <SplashScreen onComplete={() => setGameStarted(true)} />;
  }

  return (
    <div className="h-screen relative overflow-hidden responsive-game-container">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] -z-10">
        {/* Floating Orbs - Responsive */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
      </div>

      {/* Audio Components */}
      <AudioManager />
      
      {/* Main Game Container */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden responsive-main-container">
        {/* Top Section - Header and Score */}
        <div className="w-full flex-shrink-0 responsive-header">
          {/* Top Bar with High Score and Restart */}
          <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-3 max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-gradient-to-r from-[#1a1a2e]/80 to-[#2a2a4e]/80 backdrop-blur-sm px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg md:rounded-xl border border-white/10 shadow-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs sm:text-sm md:text-lg">👑</span>
              </div>
              <div>
                <div className="text-xs sm:text-xs md:text-xs text-gray-400 font-silkscreen uppercase tracking-wider">High Score</div>
                <div className="text-xs sm:text-sm md:text-lg text-white font-silkscreen">{highScore.toLocaleString()}</div>
              </div>
            </div>
            
            <button
              onClick={handleRestart}
              className="px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-silkscreen text-xs sm:text-xs md:text-sm rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-red-400/50"
            >
              RESTART
            </button>
          </div>

          {/* Score Display */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#1a1a2e]/60 to-[#2a2a4e]/60 backdrop-blur-sm px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 shadow-xl inline-block mobile-compact-score ultra-compact-score">
              <div className="text-xs sm:text-xs md:text-xs text-gray-400 font-silkscreen mb-0.5 sm:mb-1 uppercase tracking-wider">Score</div>
              <div className="text-xl sm:text-2xl md:text-5xl font-silkscreen mb-0.5 sm:mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {score.toLocaleString()}
              </div>
              
              {combo > 1 && (
                <div className="text-sm sm:text-base md:text-xl text-yellow-400 font-silkscreen animate-pulse drop-shadow-lg">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    COMBO x{combo}
                  </span>
                </div>
              )}
              
              {/* Save Status */}
              <div className="text-xs sm:text-xs md:text-xs text-gray-500 font-silkscreen mt-0.5 sm:mt-1 md:mt-2 flex items-center justify-center gap-1">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400">Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Auto-saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Board - Positioned with proper spacing from footer */}
        <div className="flex-1 flex items-center justify-center w-full pt-0 pb-4 game-board-container">
          <GameBoard 
            sharedDragState={dragState}
            onDragStart={startDrag}
            onUpdateDropTarget={updateDropTarget}
            onUpdateDrag={updateDrag}
            onEndDrag={endDrag}
          />
        </div>
      </div>
      
      {/* Fixed Footer with Hand Component */}
      <div className="footer-hand">
        <div className="footer-hand-content footer-content">
          <div className="relative">
            {/* Hand Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl scale-110"></div>
            
            {/* Hand Component with shared drag support */}
            <div className="relative">
              <Hand 
                onPieceDragStart={handleFooterPieceDragStart}
                dragState={dragState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shared Drag Ghost */}
      {dragState.isDragging && (
        <DragGhost
          piece={dragState.draggedItem?.piece}
          position={dragState.dragPosition}
          isValidDrop={dragState.isValidDrop}
        />
      )}
      
      {/* Settings Button - Bottom Right Corner */}
      <AudioSettings />
    </div>
  );
}