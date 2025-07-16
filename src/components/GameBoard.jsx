import { useAtom } from 'jotai';
import { boardAtom, handAtom, scoreAtom, comboAtom, highScoreAtom, destructionAnimationAtom, PIECES, WEIGHTED_PIECES, BLOCK_COLORS } from '../atoms/gameAtoms';
import { useEffect, useState } from 'react';
import Hand from './Hand';
import GameOverScreen from './GameOverScreen';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useSoundEffects } from '../hooks/useSoundEffects';

const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 9;
const HAND_SIZE = 3;

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));

export default function GameBoard({ sharedDragState, onDragStart, onUpdateDropTarget, onUpdateDrag, onEndDrag }) {
  const [board, setBoard] = useAtom(boardAtom);
  const [hand, setHand] = useAtom(handAtom);
  const [score, setScore] = useAtom(scoreAtom);
  const [combo, setCombo] = useAtom(comboAtom);
  const [highScore, setHighScore] = useAtom(highScoreAtom);
  const [destructionAnimation, setDestructionAnimation] = useAtom(destructionAnimationAtom);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [ghostCells, setGhostCells] = useState([]);
  const [canPlacePreview, setCanPlacePreview] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [popupText, setPopupText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverDelay, setGameOverDelay] = useState(false);
  const [gameOverProgress, setGameOverProgress] = useState(0);
  const [gameOverTimer, setGameOverTimer] = useState(null);
  const [isDraggingOnMobile, setIsDraggingOnMobile] = useState(false);
  const [dragFeedback, setDragFeedback] = useState({ active: false, valid: false });
  
  // Use shared drag state if provided, otherwise use local drag state
  const localDragHook = useDragAndDrop();
  const dragState = sharedDragState || localDragHook.dragState;
  const startDrag = onDragStart || localDragHook.startDrag;
  const updateDropTarget = onUpdateDropTarget || localDragHook.updateDropTarget;
  const updateDrag = onUpdateDrag || localDragHook.updateDrag;
  const endDrag = onEndDrag || localDragHook.endDrag;
  
  const { sounds } = useSoundEffects();

  const generatePiece = () => {
    // Dynamic difficulty based on score - gets harder as score increases
    const difficultyLevel = Math.floor(score / 100); // Every 100 points increases difficulty
    
    // Create a fresh weighted array with better randomization
    const weightedArray = [];
    PIECES.forEach(piece => {
      let adjustedWeight = piece.weight || 1;
      
      // Make harder pieces more common at higher scores
      if (difficultyLevel > 0) {
        if (piece.id.includes('wide_') || piece.id.includes('large_') || piece.id.includes('big_')) {
          adjustedWeight += Math.floor(difficultyLevel * 0.5); // Increase complex piece frequency
        }
        if (piece.id === 'single' || piece.id.includes('line2')) {
          adjustedWeight = Math.max(1, adjustedWeight - Math.floor(difficultyLevel * 0.3)); // Decrease simple piece frequency
        }
      }
      
      // Add pieces to weighted array
      for (let i = 0; i < adjustedWeight; i++) {
        weightedArray.push(piece);
      }
    });
    
    // Use multiple random selections for better distribution
    const randomIndex1 = Math.floor(Math.random() * weightedArray.length);
    const randomIndex2 = Math.floor(Math.random() * weightedArray.length);
    const randomIndex3 = Math.floor(Math.random() * weightedArray.length);
    
    // Pick one of the three random selections for even more randomness
    const finalIndex = [randomIndex1, randomIndex2, randomIndex3][Math.floor(Math.random() * 3)];
    const selectedPiece = weightedArray[finalIndex];
    
    // Randomly select color with improved distribution
    const availableColors = Object.keys(BLOCK_COLORS);
    const randomColorIndex = Math.floor(Math.random() * availableColors.length);
    
    return { 
      ...selectedPiece,
      color: availableColors[randomColorIndex],
      id: crypto.randomUUID ? crypto.randomUUID() : `${selectedPiece.id}-${Date.now()}-${Math.random()}`
    };
  };

  const generateNewBatch = () => {
    const selectedPieces = [];
    const usedPieceIds = new Set();
    
    // Generate 3 unique pieces with better randomization
    for (let i = 0; i < 3; i++) {
      let attempts = 0;
      let newPiece;
      
      // Try to get a unique piece type (avoid duplicates)
      do {
        newPiece = generatePiece();
        attempts++;
      } while (usedPieceIds.has(newPiece.id) && attempts < 10);
      
      usedPieceIds.add(newPiece.id);
      selectedPieces.push(newPiece);
    }
    
    // Shuffle the array for additional randomness
    for (let i = selectedPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedPieces[i], selectedPieces[j]] = [selectedPieces[j], selectedPieces[i]];
    }
    
    return selectedPieces;
  };

  const fillHand = () => {
    if (hand.length === 0) {
      setHand(generateNewBatch());
    }
  };

  const checkGameOver = (handToCheck = hand, boardToCheck = board) => {
    // Only check if we have pieces in hand
    if (handToCheck.length === 0) return false;
    
    // Check if any piece in hand can be placed anywhere on the board
    const isGameOver = handToCheck.every(piece => {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (canPlacePieceOnBoard(piece, x, y, boardToCheck)) {
            return false; // Can place this piece
          }
        }
      }
      return true; // Cannot place this piece anywhere
    });

    if (isGameOver) {
      // Update high score before showing game over screen
      if (score > highScore) {
        setHighScore(score);
      }
      
      // Play game over sound
      sounds.gameOver();
      
      // Start 3-second game over delay with loading bar (reduced from 15 seconds)
      setGameOverDelay(true);
      setGameOverProgress(0);
      
      // Clear any existing timer
      if (gameOverTimer) {
        clearInterval(gameOverTimer);
      }
      
      // Start progress timer - 3 seconds instead of 15
      const timer = setInterval(() => {
        setGameOverProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setGameOverDelay(false);
            setGameOver(true);
            return 100;
          }
          return prev + (100 / 30); // 3 seconds * 10 updates per second
        });
      }, 100);
      
      setGameOverTimer(timer);
      
      return true;
    }
    
    return false;
  };

  const canPlacePieceOnBoard = (piece, boardX, boardY, boardToCheck = board) => {
    if (!piece) return false;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = boardX + col;
          const y = boardY + row;
          
          if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
            return false;
          }
          
          if (boardToCheck[y][x] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleRestart = () => {
    // Check if current score is higher than high score and save it
    if (score > highScore) {
      setHighScore(score);
    }
    
    setGameOver(false);
    setGameOverDelay(false);
    setGameOverProgress(0);
    
    // Clear game over timer
    if (gameOverTimer) {
      clearInterval(gameOverTimer);
      setGameOverTimer(null);
    }
    
    setBoard(createEmptyBoard());
    setScore(0);
    setCombo(0);
    setHand([]);
    setDestructionAnimation([]);
    setIsClearing(false);
    setShowPopup(false);
    setPopupText('');
    setHoveredCell(null);
    setHighlightedCells([]);
    setGhostCells([]);
    setCanPlacePreview(false);
  };

  const handleClearSaveData = () => {
    // Clear all localStorage data
    localStorage.removeItem('blxst-gameStarted');
    localStorage.removeItem('blxst-board');
    localStorage.removeItem('blxst-hand');
    localStorage.removeItem('blxst-score');
    localStorage.removeItem('blxst-combo');
    localStorage.removeItem('blxst-highScore');
    
    // Reset all atoms
    handleRestart();
    setHighScore(0);
    
    // Reload the page to ensure all state is reset
    window.location.reload();
  };

  const canPlacePiece = (piece, boardX, boardY) => {
    return canPlacePieceOnBoard(piece, boardX, boardY, board);
  };

  const placePiece = (piece, boardX, boardY) => {
    if (!canPlacePiece(piece, boardX, boardY)) return { success: false };

    const newBoard = board.map(row => [...row]);
    let blocksPlaced = 0;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          newBoard[boardY + row][boardX + col] = piece.color;
          blocksPlaced++;
        }
      }
    }

    setBoard(newBoard);
    
    // Award 1 point per block tile placed
    setScore(prev => prev + blocksPlaced);
    
    // Play piece placement sound
    sounds.placePiece();
    
    return { success: true, newBoard };
  };

  const clearLines = (depth = 0, inputBoard = null) => {
    // Prevent infinite recursion
    if (depth > 10) {
      console.warn('Maximum cascade depth reached');
      setIsClearing(false);
      return 0;
    }

    let currentBoard = inputBoard ? inputBoard.map(row => [...row]) : board.map(row => [...row]);
    const rowsToClear = [];
    const colsToClear = [];

    setIsClearing(true);

    // Find complete horizontal lines (rows) - must be filled edge to edge (all 9 cells)
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (currentBoard[y].every(cell => cell !== null)) {
        rowsToClear.push(y);
      }
    }

    // Find complete vertical lines (columns) - must be filled edge to edge (all 9 cells)
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (currentBoard.every(row => row[x] !== null)) {
        colsToClear.push(x);
      }
    }

    // If no lines to clear, reset combo and return
    if (rowsToClear.length === 0 && colsToClear.length === 0) {
      if (depth === 0) {
        setCombo(0);
      }
      setIsClearing(false);
      return 0;
    }

    const totalLinesCleared = rowsToClear.length + colsToClear.length;
    
    // Play line clear sound
    sounds.lineClear();
    
    // Create Block Blast style destruction animation
    const animationCells = [];
    
    // Process horizontal lines
    rowsToClear.forEach(y => {
      // Use a neutral destruction color instead of dominant color
      const destructionColor = 'gold'; // Subtle gold color for destruction
      
      // Add all cells in this row to animation
      for (let x = 0; x < BOARD_WIDTH; x++) {
        animationCells.push({
          x,
          y,
          originalColor: currentBoard[y][x],
          finalColor: destructionColor,
          type: 'horizontal'
        });
      }
    });

    // Process vertical lines
    colsToClear.forEach(x => {
      // Use a neutral destruction color instead of dominant color
      const destructionColor = 'gold'; // Subtle gold color for destruction
      
      // Add all cells in this column to animation
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        const existingCell = animationCells.find(cell => cell.x === x && cell.y === y);
        if (!existingCell) {
          animationCells.push({
            x,
            y,
            originalColor: currentBoard[y][x],
            finalColor: destructionColor,
            type: 'vertical'
          });
        }
      }
    });

    // Start Block Blast style destruction animation
    setDestructionAnimation(animationCells);

    // Phase 1: Convert all blocks to subtle destruction color (300ms)
    setTimeout(() => {
      animationCells.forEach(cell => {
        currentBoard[cell.y][cell.x] = cell.finalColor;
      });
      setBoard([...currentBoard]);
    }, 300);

    // Phase 2: Animate destruction (800ms later to match CSS animation)
    setTimeout(() => {
      // Clear the cells
      animationCells.forEach(cell => {
        currentBoard[cell.y][cell.x] = null;
      });
      
      setBoard([...currentBoard]);
      setDestructionAnimation([]);

      // Calculate score based on Block Blast rules
      let lineScore = 0;
      if (totalLinesCleared === 1) lineScore = 10;
      else if (totalLinesCleared === 2) lineScore = 25;
      else if (totalLinesCleared >= 3) lineScore = 50;

      // Update combo only if lines were cleared
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Play combo sound for multi-line clears or combos
      if (newCombo > 1 || totalLinesCleared > 1) {
        sounds.combo();
      }

      // Apply combo multiplier (starts at 1x, then 2x, 3x, etc.)
      const comboMultiplier = newCombo;
      const finalScore = lineScore * comboMultiplier;
      const newScore = score + finalScore;

      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      // Show popup text with combo info
      let popupMessage = '';
      if (newCombo > 1) {
        popupMessage = `${finalScore} pts (${comboMultiplier}x COMBO!)`;
      } else {
        popupMessage = `${finalScore} pts`;
      }
      
      setPopupText(popupMessage);
      setShowPopup(true);
      
      // Hide popup after 4 seconds
      setTimeout(() => setShowPopup(false), 4000);

      // Check for cascade (new lines formed after clearing)
      setTimeout(() => {
        const cascadeLinesCleared = clearLines(depth + 1, currentBoard);
        if (cascadeLinesCleared === 0) {
          setIsClearing(false);
          // Force a board update to ensure state consistency
          setBoard([...currentBoard]);
        }
      }, 100);
    }, 800); // Total animation time matches CSS animation duration

    return totalLinesCleared;
  };

  const handlePieceDragStart = (index, piece, event) => {
    startDrag({ piece, index }, event);
    setIsDraggingOnMobile(true);
    setDragFeedback({ active: true, valid: false });
  };

  const handleCellPointerMove = (e, x, y) => {
    if (!dragState.isDragging) return;
    
    // Prevent default touch behavior
    e.preventDefault();
    
    // Play hover sound only if this is a new cell
    if (!hoveredCell || hoveredCell.x !== x || hoveredCell.y !== y) {
      sounds.hover();
    }
    
    setHoveredCell({ x, y });
    
    // Update ghost preview
    const highlighted = [];
    const ghost = [];
    let canPlace = true;

    for (let row = 0; row < dragState.draggedItem.piece.shape.length; row++) {
      for (let col = 0; col < dragState.draggedItem.piece.shape[row].length; col++) {
        if (dragState.draggedItem.piece.shape[row][col]) {
          const cellX = x + col;
          const cellY = y + row;
          
          if (cellX < 0 || cellX >= BOARD_WIDTH || cellY < 0 || cellY >= BOARD_HEIGHT) {
            canPlace = false;
            break;
          }
          
          if (board[cellY][cellX] !== null) {
            canPlace = false;
            break;
          }
          
          if (canPlace) {
            highlighted.push({ x: cellX, y: cellY });
            ghost.push({ x: cellX, y: cellY, color: dragState.draggedItem.piece.color });
          }
        }
      }
      if (!canPlace) break;
    }

    setCanPlacePreview(canPlace);
    setDragFeedback({ active: true, valid: canPlace });
    
    if (canPlace) {
      setHighlightedCells(highlighted);
      setGhostCells(ghost);
    } else {
      // Show invalid placement with red highlighting
      const invalidCells = [];
      for (let row = 0; row < dragState.draggedItem.piece.shape.length; row++) {
        for (let col = 0; col < dragState.draggedItem.piece.shape[row].length; col++) {
          if (dragState.draggedItem.piece.shape[row][col]) {
            const cellX = x + col;
            const cellY = y + row;
            
            if (cellX >= 0 && cellX < BOARD_WIDTH && cellY >= 0 && cellY < BOARD_HEIGHT) {
              invalidCells.push({ x: cellX, y: cellY });
            }
          }
        }
      }
      setHighlightedCells(invalidCells);
      setGhostCells([]);
    }
    
    updateDropTarget({ x, y }, canPlace);
  };

  const handleCellPointerUp = (e, x, y) => {
    if (!dragState.isDragging) return;
    
    // Prevent default touch behavior
    e.preventDefault();
    
    const piece = dragState.draggedItem.piece;
    const index = dragState.draggedItem.index;
    
    if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
      const placeResult = placePiece(piece, x, y);
      if (placeResult.success) {
        // Remove piece from hand using the piece ID
        const newHand = hand.filter(p => p.id !== piece.id);
        setHand(newHand);
        
        // Clear lines immediately using the new board state
        const clearedLines = clearLines(0, placeResult.newBoard);
        
        // Schedule game over check after all animations complete
        const checkGameOverAfterMove = () => {
          if (newHand.length === 0) {
            // Generate new batch of 3 blocks
            const newBatch = generateNewBatch();
            setHand(newBatch);
            
            // Check for game over with the new batch and current board
            // Use a slight delay to ensure state has updated
            setTimeout(() => {
              checkGameOver(newBatch, board);
            }, 50);
          } else {
            // Check game over with remaining pieces immediately
            setTimeout(() => {
              checkGameOver(newHand, board);
            }, 50);
          }
        };
        
        // Wait for line clearing animation to complete before checking game over
        if (clearedLines > 0) {
          setTimeout(checkGameOverAfterMove, 1000);
        } else {
          setTimeout(checkGameOverAfterMove, 100);
        }
      }
    }

    // Reset drag state
    setHighlightedCells([]);
    setGhostCells([]);
    setCanPlacePreview(false);
    setHoveredCell(null);
    setIsDraggingOnMobile(false);
    setDragFeedback({ active: false, valid: false });
  };

  // Handle touch events for mobile drag and drop
  const handleTouchMove = (e) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    
    // Find the board element more reliably
    const boardElement = document.querySelector('[data-drop-target="board"]');
    if (!boardElement) {
      // Clear highlights when board not found
      setHighlightedCells([]);
      setGhostCells([]);
      setCanPlacePreview(false);
      return;
    }
    
    const rect = boardElement.getBoundingClientRect();
    
    // Adjust touch coordinates to account for drag offset
    // This makes the ghost appear under the dragged piece, not the finger
    // The dragged piece is offset by 60px above the touch point
    const adjustedX = touch.clientX;
    const adjustedY = touch.clientY - 60; // Match the offset from useDragAndDrop hook
    
    // Check if adjusted touch is within board bounds
    if (adjustedX >= rect.left && adjustedX <= rect.right && 
        adjustedY >= rect.top && adjustedY <= rect.bottom) {
      
      // Calculate cell coordinates with better precision
      const cellWidth = rect.width / BOARD_WIDTH;
      const cellHeight = rect.height / BOARD_HEIGHT;
      
      // Calculate relative position within the board using adjusted coordinates
      const relativeX = adjustedX - rect.left;
      const relativeY = adjustedY - rect.top;
      
      // Convert to grid coordinates
      const x = Math.floor(relativeX / cellWidth);
      const y = Math.floor(relativeY / cellHeight);
      
      // Ensure coordinates are within bounds
      if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
        handleCellPointerMove(e, x, y);
      } else {
        // Clear highlights when outside valid cells
        setHighlightedCells([]);
        setGhostCells([]);
        setCanPlacePreview(false);
      }
    } else {
      // Clear highlights when dragging outside board
      setHighlightedCells([]);
      setGhostCells([]);
      setCanPlacePreview(false);
    }
  };

  const handleTouchEnd = (e) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.changedTouches[0];
    
    // Find the board element more reliably
    const boardElement = document.querySelector('[data-drop-target="board"]');
    if (boardElement) {
      const rect = boardElement.getBoundingClientRect();
      
      // Adjust touch coordinates to account for drag offset
      const adjustedX = touch.clientX;
      const adjustedY = touch.clientY - 60; // Same offset as handleTouchMove
      
      // Check if adjusted touch end is within board bounds
      if (adjustedX >= rect.left && adjustedX <= rect.right && 
          adjustedY >= rect.top && adjustedY <= rect.bottom) {
        
        // Calculate cell coordinates with better precision
        const cellWidth = rect.width / BOARD_WIDTH;
        const cellHeight = rect.height / BOARD_HEIGHT;
        
        // Calculate relative position within the board using adjusted coordinates
        const relativeX = adjustedX - rect.left;
        const relativeY = adjustedY - rect.top;
        
        // Convert to grid coordinates
        const x = Math.floor(relativeX / cellWidth);
        const y = Math.floor(relativeY / cellHeight);
        
        // Ensure coordinates are within bounds
        if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
          handleCellPointerUp(e, x, y);
        }
      }
    }
    
    // Reset drag state regardless of where touch ended
    setHighlightedCells([]);
    setGhostCells([]);
    setCanPlacePreview(false);
    setHoveredCell(null);
  };

  useEffect(() => {
    // Generate new hand if hand is empty (atomWithStorage will handle loading saved state)
    if (hand.length === 0) {
      setHand(generateNewBatch());
    }
  }, [hand.length]);

  // Additional safety check for game over - runs whenever hand or board changes
  useEffect(() => {
    if (hand.length > 0 && !gameOver && !isClearing) {
      // Small delay to ensure state is fully updated
      const gameOverTimer = setTimeout(() => {
        checkGameOver(hand, board);
      }, 100);
      
      return () => clearTimeout(gameOverTimer);
    }
  }, [hand, board, gameOver, isClearing]);

  // Cleanup game over timer on unmount
  useEffect(() => {
    return () => {
      if (gameOverTimer) {
        clearInterval(gameOverTimer);
      }
    };
  }, [gameOverTimer]);

  // Add global touch event listeners for mobile drag and drop
  useEffect(() => {
    const handleGlobalTouchMove = (e) => {
      if (dragState.isDragging) {
        handleTouchMove(e);
      }
    };

    const handleGlobalTouchEnd = (e) => {
      if (dragState.isDragging) {
        handleTouchEnd(e);
      }
    };

    if (dragState.isDragging) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [dragState.isDragging]);

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3 relative w-full max-w-2xl no-select mobile-compact-board mobile-reduced-gap ultra-compact-board">
      {/* Game Over Screen */}
      {gameOver && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}
      
      {/* Game Over Delay Loading Bar */}
      {gameOverDelay && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 sm:p-8 rounded-2xl shadow-2xl text-center border border-gray-600/30 max-w-md mx-4">
            <h2 className="text-lg sm:text-2xl font-pressStart text-white mb-4 drop-shadow-lg">Game Over!</h2>
            <p className="text-gray-300 font-silkscreen mb-4 sm:mb-6 text-sm">
              Calculating final score...
            </p>
            
            {/* Loading Bar - Centered and Enhanced */}
            <div className="w-full max-w-xs mx-auto mb-4 sm:mb-6">
              <div className="h-3 sm:h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner border border-gray-600">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 transition-all duration-100 ease-out relative"
                  style={{ width: `${gameOverProgress}%` }}
                >
                  {/* Glowing effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-red-500 rounded-full blur-sm opacity-70"></div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 font-silkscreen mb-4 sm:mb-6">
              {Math.ceil(3 - (gameOverProgress / 100) * 3)} seconds remaining
            </p>
            
            <button
              onClick={() => {
                if (gameOverTimer) {
                  clearInterval(gameOverTimer);
                  setGameOverTimer(null);
                }
                setGameOverDelay(false);
                setGameOver(true);
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-silkscreen text-xs sm:text-sm rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Skip Wait
            </button>
          </div>
        </div>
      )}
      
      {/* Popup Text */}
      {showPopup && popupText && (
        <div className="absolute top-4 sm:top-8 md:top-16 left-1/2 transform -translate-x-1/2 text-lg sm:text-2xl md:text-4xl font-bold text-yellow-300 animate-bounce drop-shadow-xl z-50 font-silkscreen">
          {popupText}
        </div>
      )}
      
      {/* Game Board Container */}
      <div className="relative">
        {/* Board Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg sm:rounded-2xl md:rounded-3xl blur-lg sm:blur-xl md:blur-2xl scale-105"></div>
        
        <div
          className="relative grid grid-cols-9 gap-[1px] sm:gap-[2px] md:gap-[3px] bg-gradient-to-br from-[#1a1a2e]/90 to-[#2a2a4e]/90 backdrop-blur-sm p-1.5 sm:p-2 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border border-white/10"
          style={{ 
            width: 'min(95vw, 350px)', 
            height: 'min(95vw, 350px)',
            maxWidth: '500px',
            maxHeight: '500px',
            touchAction: 'none' 
          }}
          data-drop-target="board"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {board.flat().map((cell, index) => {
            const x = index % BOARD_WIDTH;
            const y = Math.floor(index / BOARD_WIDTH);
            const isHighlighted = highlightedCells.some(h => h.x === x && h.y === y);
            const ghostCell = ghostCells.find(g => g.x === x && g.y === y);
            const destructionCell = destructionAnimation.find(d => d.x === x && d.y === y);
            
            return (
              <div
                key={index}
                className={`game-cell aspect-square rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  isHighlighted 
                    ? (canPlacePreview 
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-300 shadow-lg shadow-emerald-500/50 scale-105 drag-valid-feedback' 
                        : 'bg-gradient-to-br from-red-400 to-red-500 border-red-300 shadow-lg shadow-red-500/50 scale-105 drag-invalid-feedback'
                      )
                    : 'bg-gradient-to-br from-[#3a3f5a] to-[#2a2f4a] border-[#4a4f6a] hover:border-[#5a5f7a] shadow-inner'
                } ${dragFeedback.active ? 'drag-active' : ''}`}
                onMouseMove={(e) => handleCellPointerMove(e, x, y)}
                onTouchMove={(e) => handleCellPointerMove(e, x, y)}
                onMouseUp={(e) => handleCellPointerUp(e, x, y)}
                onTouchEnd={(e) => handleCellPointerUp(e, x, y)}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {/* Cell Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-lg"></div>
                </div>
                
                {cell && cell !== null ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={BLOCK_COLORS[cell].image} 
                      alt="block" 
                      className={`w-full h-full object-cover rounded-lg transition-all duration-300 ${
                        destructionCell 
                          ? 'animate-block-blast-destroy' 
                          : 'scale-100 opacity-100 shadow-lg'
                      }`}
                      style={{ 
                        filter: `${BLOCK_COLORS[cell].filter} drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
                      }}
                    />
                    {/* Block Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-lg pointer-events-none"></div>
                  </div>
                ) : ghostCell && canPlacePreview ? (
                  <div className="w-full h-full relative overflow-hidden rounded-lg ghost-preview animate-ghost-appear">
                    <img 
                      src={BLOCK_COLORS[ghostCell.color].image} 
                      alt="ghost block" 
                      className="w-full h-full object-cover rounded-lg opacity-90 animate-pulse-mobile"
                      style={{ 
                        filter: `${BLOCK_COLORS[ghostCell.color].filter} brightness(2.2) saturate(2.2) drop-shadow(0 0 15px rgba(255,255,255,0.8))`,
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-lg animate-shimmer-mobile"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                        backgroundSize: '200% 100%'
                      }}
                    ></div>
                    {/* Enhanced mobile visibility indicator */}
                    <div className="absolute inset-0 border-2 border-white/70 rounded-lg animate-pulse-mobile"></div>
                    {/* Glow effect for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20 rounded-lg animate-pulse-mobile"></div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {hand.length === 0 && (
        <div className="text-center text-xs sm:text-sm text-gray-300 font-silkscreen animate-pulse bg-gradient-to-r from-[#1a1a2e]/60 to-[#2a2a4e]/60 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/10">
          Loading new blocks...
        </div>
      )}
    </div>
  );
}