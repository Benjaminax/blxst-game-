import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BLOCK_COLORS } from '../atoms/gameAtoms';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [animatingBlocks, setAnimatingBlocks] = useState([]);

  useEffect(() => {
    // Generate random falling blocks
    const generateBlocks = () => {
      const blocks = [];
      const colors = Object.keys(BLOCK_COLORS);
      
      for (let i = 0; i < 15; i++) {
        blocks.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 3 + Math.random() * 2,
          size: 20 + Math.random() * 30,
          rotation: Math.random() * 360,
        });
      }
      
      setAnimatingBlocks(blocks);
    };

    generateBlocks();
    
    // Show title after 500ms
    setTimeout(() => setShowTitle(true), 500);
    
    // Show subtitle after 1500ms
    setTimeout(() => setShowSubtitle(true), 1500);

    // Progress animation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + (100 / 12);
      });
    }, 500);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#3a3a6e] z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background Blocks */}
      <div className="absolute inset-0">
        {animatingBlocks.map((block) => (
          <motion.div
            key={block.id}
            className="absolute rounded-lg shadow-lg"
            style={{
              left: `${block.x}%`,
              width: `${block.size}px`,
              height: `${block.size}px`,
              backgroundImage: `url(/${BLOCK_COLORS[block.color].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ 
              y: -100, 
              opacity: 0,
              rotate: block.rotation,
              scale: 0.5,
            }}
            animate={{ 
              y: window.innerHeight + 100, 
              opacity: [0, 0.8, 0.8, 0],
              rotate: block.rotation + 360,
              scale: [0.5, 1, 1, 0.3],
            }}
            transition={{
              duration: block.duration,
              delay: block.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Glowing Orb Background */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <div className="w-96 h-96 bg-gradient-radial from-yellow-400/30 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center w-full max-w-sm sm:max-w-2xl mx-auto px-4 sm:px-8">
        {/* Title Animation */}
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.5 }}
          animate={showTitle ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl mb-2 sm:mb-4 md:mb-8 text-white font-pressStart drop-shadow-2xl relative"
            animate={{ 
              textShadow: [
                '0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ffd700',
                '0 0 10px #ff6b6b, 0 0 20px #ff6b6b, 0 0 30px #ff6b6b',
                '0 0 20px #4ecdc4, 0 0 30px #4ecdc4, 0 0 40px #4ecdc4',
                '0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ffd700',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            BLXST
          </motion.h1>
          
          {/* Sparkle Effects */}
          <motion.div
            className="absolute -top-1 sm:-top-2 md:-top-4 -right-1 sm:-right-2 md:-right-4 text-yellow-400 text-sm sm:text-lg md:text-2xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 -left-1 sm:-left-2 md:-left-4 text-orange-400 text-xs sm:text-base md:text-xl"
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </motion.div>

        {/* Subtitle Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showSubtitle ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center"
        >
          <p className="text-xs sm:text-sm md:text-lg text-gray-400 font-silkscreen">made by benjy</p>
        </motion.div>

        {/* Enhanced Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-4 sm:mt-8 md:mt-16 relative flex flex-col items-center justify-center w-full max-w-xs sm:max-w-sm"
        >
          <div className="w-full h-1.5 sm:h-2 md:h-3 bg-[#2a2a3e] rounded-full overflow-hidden shadow-inner border border-gray-600">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-sm opacity-70"></div>
            </motion.div>
          </div>
          
          {/* Progress percentage */}
          <motion.p 
            className="mt-1 sm:mt-2 md:mt-4 text-gray-300 font-silkscreen text-xs sm:text-sm text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading... {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Pulsing Gaming Elements */}
        <motion.div
          className="absolute bottom-4 sm:bottom-8 md:bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-4 md:space-x-8 items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
        >
          {Object.entries(BLOCK_COLORS).slice(0, 5).map(([color, data], index) => (
            <motion.div
              key={color}
              className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md shadow-lg"
              style={{
                backgroundImage: `url(/${data.image})`,
                backgroundSize: 'cover',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}