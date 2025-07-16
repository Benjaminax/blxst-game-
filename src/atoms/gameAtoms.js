import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Import block images properly for Vite
import goldBlock from '../assets/images/gold_block.png';
import redBlock from '../assets/images/red_block.png';
import blueBlock from '../assets/images/blue_block.png';
import greenBlock from '../assets/images/green_block.png';
import purpleBlock from '../assets/images/purple_block.png';
import orangeBlock from '../assets/images/orange_block.png';
import lightblueBlock from '../assets/images/lightblue_block.png';

// Game configuration
const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 9;
const HAND_SIZE = 3;

// Initial empty board
const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));

// Block colors and their corresponding images and filters
export const BLOCK_COLORS = {
  gold: { 
    image: goldBlock, 
    filter: 'none' 
  },
  red: { 
    image: redBlock, 
    filter: 'none' 
  },
  blue: { 
    image: blueBlock, 
    filter: 'none' 
  },
  green: { 
    image: greenBlock, 
    filter: 'none' 
  },
  purple: { 
    image: purpleBlock, 
    filter: 'none' 
  },
  orange: { 
    image: orangeBlock, 
    filter: 'none' 
  },
  lightblue: { 
    image: lightblueBlock, 
    filter: 'none' 
  }
};

// Game pieces
export const PIECES = [
  // 1. Single Block
  { shape: [[1]], color: 'blue', id: 'single' },
  
  // 2. Line Blocks - Horizontal
  { shape: [[1, 1]], color: 'red', id: 'line2h' },
  { shape: [[1, 1, 1]], color: 'green', id: 'line3h' },
  { shape: [[1, 1, 1, 1]], color: 'blue', id: 'line4h' },
  { shape: [[1, 1, 1, 1, 1]], color: 'purple', id: 'line5h' },
  
  // 2. Line Blocks - Vertical
  { shape: [[1], [1]], color: 'orange', id: 'line2v' },
  { shape: [[1], [1], [1]], color: 'lightblue', id: 'line3v' },
  { shape: [[1], [1], [1], [1]], color: 'orange', id: 'line4v' },
  { shape: [[1], [1], [1], [1], [1]], color: 'lightblue', id: 'line5v' },
  
  // 3. Square Blocks
  { shape: [[1, 1], [1, 1]], color: 'red', id: 'square' },
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'gold', id: 'square_3x3' },
  
  // 4. L-Shaped Blocks
  { shape: [[1, 0], [1, 1]], color: 'blue', id: 'l_small' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'green', id: 'l_medium' },
  { shape: [[1, 0, 0, 0], [1, 1, 1, 1]], color: 'purple', id: 'l_large' },
  { shape: [[0, 1], [1, 1]], color: 'orange', id: 'l_small_flipped' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'lightblue', id: 'l_medium_flipped' },
  { shape: [[0, 0, 0, 1], [1, 1, 1, 1]], color: 'red', id: 'l_large_flipped' },
  
  // 5. T-Shaped Blocks
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'blue', id: 't_small' },
  { shape: [[1, 1, 1, 1], [0, 1, 0, 0]], color: 'green', id: 't_medium' },
  { shape: [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0]], color: 'purple', id: 't_large' },
  
  // 6. Z-Shaped Blocks
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'orange', id: 'z_small' },
  { shape: [[1, 1, 0, 0], [0, 1, 1, 1]], color: 'lightblue', id: 'z_medium' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'red', id: 'z_small_flipped' },
  { shape: [[0, 0, 1, 1], [1, 1, 1, 0]], color: 'blue', id: 'z_medium_flipped' },
  
  // 7. Plus-Shaped Blocks
  { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: 'green', id: 'plus_small' },
  { shape: [[0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0]], color: 'purple', id: 'plus_large' },
  
  // 8. Miscellaneous Blocks
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'orange', id: 'misc_corner' },
  { shape: [[1, 1, 1], [0, 0, 1]], color: 'lightblue', id: 'misc_corner_flipped' },
  { shape: [[1, 1], [1, 0], [1, 0]], color: 'red', id: 'misc_step' },
  { shape: [[1, 1], [0, 1], [0, 1]], color: 'blue', id: 'misc_step_flipped' },
];

// Weighted pieces for better randomization - reduced 3x3 square weight
export const WEIGHTED_PIECES = [
  // 1. Single Block - Highest weight
  { shape: [[1]], color: 'blue', id: 'single', weight: 4 },
  
  // 2. Line Blocks - Horizontal - Medium weight
  { shape: [[1, 1]], color: 'red', id: 'line2h', weight: 3 },
  { shape: [[1, 1, 1]], color: 'green', id: 'line3h', weight: 2 },
  { shape: [[1, 1, 1, 1]], color: 'blue', id: 'line4h', weight: 1 },
  { shape: [[1, 1, 1, 1, 1]], color: 'purple', id: 'line5h', weight: 1 },
  
  // 2. Line Blocks - Vertical - Medium weight
  { shape: [[1], [1]], color: 'orange', id: 'line2v', weight: 3 },
  { shape: [[1], [1], [1]], color: 'lightblue', id: 'line3v', weight: 2 },
  { shape: [[1], [1], [1], [1]], color: 'orange', id: 'line4v', weight: 1 },
  { shape: [[1], [1], [1], [1], [1]], color: 'lightblue', id: 'line5v', weight: 1 },
  
  // 3. Square Block - Higher weight
  { shape: [[1, 1], [1, 1]], color: 'red', id: 'square', weight: 3 },
  // 3x3 square - REDUCED weight from 4 to 1
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'gold', id: 'square_3x3', weight: 1 },
  
  // 4. L-Shaped Blocks - Lower weight
  { shape: [[1, 0], [1, 1]], color: 'blue', id: 'l_small', weight: 2 },
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'green', id: 'l_medium', weight: 1 },
  { shape: [[0, 1], [1, 1]], color: 'orange', id: 'l_small_flipped', weight: 2 },
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'lightblue', id: 'l_medium_flipped', weight: 1 },
  
  // 5. T-Shaped Blocks - Lower weight
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'blue', id: 't_small', weight: 2 },
  { shape: [[1, 1, 1, 1], [0, 1, 0, 0]], color: 'green', id: 't_medium', weight: 1 },
  
  // 6. Z-Shaped Blocks - Lower weight
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'orange', id: 'z_small', weight: 2 },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'red', id: 'z_small_flipped', weight: 2 },
  
  // 7. Plus-Shaped Blocks - Lower weight
  { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: 'green', id: 'plus_small', weight: 1 },
  
  // 8. Miscellaneous Blocks - Lower weight
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'orange', id: 'misc_corner', weight: 1 },
  { shape: [[1, 1, 1], [0, 0, 1]], color: 'lightblue', id: 'misc_corner_flipped', weight: 1 },
  { shape: [[1, 1], [1, 0], [1, 0]], color: 'red', id: 'misc_step', weight: 1 },
  { shape: [[1, 1], [0, 1], [0, 1]], color: 'blue', id: 'misc_step_flipped', weight: 1 },
];

// Game state atoms with localStorage persistence
export const gameStartedAtom = atomWithStorage('blxst-gameStarted', false);
export const boardAtom = atomWithStorage('blxst-board', createEmptyBoard());
export const handAtom = atomWithStorage('blxst-hand', []);
export const scoreAtom = atomWithStorage('blxst-score', 0);
export const comboAtom = atomWithStorage('blxst-combo', 0);
export const highScoreAtom = atomWithStorage('blxst-highScore', 0);
export const destructionAnimationAtom = atom([]); // Don't persist animations

// Audio settings atoms with localStorage persistence
export const musicVolumeAtom = atomWithStorage('blxst-musicVolume', 0.3);
export const soundEffectsVolumeAtom = atomWithStorage('blxst-soundEffectsVolume', 0.5);
export const isMusicMutedAtom = atomWithStorage('blxst-isMusicMuted', false);
export const isSoundEffectsMutedAtom = atomWithStorage('blxst-isSoundEffectsMuted', false);
export const musicPositionAtom = atomWithStorage('blxst-musicPosition', 0);