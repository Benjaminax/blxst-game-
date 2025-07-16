import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function GameOverScreen({ score, highScore, onRestart }) {
  const [showScore, setShowScore] = useState(false);
  const [showHighScore, setShowHighScore] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Stagger the animations
    setTimeout(() => setShowScore(true), 500);
    setTimeout(() => setShowHighScore(true), 1000);
    setTimeout(() => setShowButton(true), 1500);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-br from-[#2a2a4e]/90 to-[#1a1a2e]/90 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-600/50 text-center max-w-sm sm:max-w-md mx-4 w-full"
      >
        {/* Game Over Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-pressStart text-red-400 mb-6 sm:mb-8 drop-shadow-lg"
          animate={{
            textShadow: [
              '0 0 20px #ff6b6b',
              '0 0 30px #ff6b6b, 0 0 40px #ff6b6b',
              '0 0 20px #ff6b6b',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          GAME OVER
        </motion.h1>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showScore ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4 sm:mb-6"
        >
          <p className="text-gray-300 font-silkscreen text-xs sm:text-sm mb-2">FINAL SCORE</p>
          <p className="text-3xl sm:text-4xl font-pressStart text-yellow-400 drop-shadow-lg">{score}</p>
        </motion.div>

        {/* High Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showHighScore ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <p className="text-gray-300 font-silkscreen text-xs sm:text-sm mb-2">HIGH SCORE</p>
          <p className={`text-2xl sm:text-3xl font-pressStart drop-shadow-lg ${
            score >= highScore ? 'text-green-400' : 'text-orange-400'
          }`}>
            {Math.max(score, highScore)}
          </p>
          {score >= highScore && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 font-silkscreen text-xs mt-2"
            >
              NEW HIGH SCORE! 🎉
            </motion.p>
          )}
        </motion.div>

        {/* Restart Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showButton ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            onClick={onRestart}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-pressStart text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.5)',
                '0 0 30px rgba(34, 197, 94, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)',
                '0 0 20px rgba(34, 197, 94, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PLAY AGAIN
          </motion.button>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
