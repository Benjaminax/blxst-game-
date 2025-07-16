import { useAtom } from 'jotai';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  musicVolumeAtom, 
  soundEffectsVolumeAtom, 
  isMusicMutedAtom, 
  isSoundEffectsMutedAtom 
} from '../atoms/gameAtoms';

export default function AudioSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [soundEffectsVolume, setSoundEffectsVolume] = useAtom(soundEffectsVolumeAtom);
  const [isMusicMuted, setIsMusicMuted] = useAtom(isMusicMutedAtom);
  const [isSoundEffectsMuted, setIsSoundEffectsMuted] = useAtom(isSoundEffectsMutedAtom);

  const handleClearSaveData = () => {
    if (confirm('Are you sure you want to clear all saved data? This will reset your high score and game progress.')) {
      // Clear all localStorage data
      localStorage.clear();
      
      // Reload the page to ensure all state is reset
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 settings-container">
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#1a1a2e]/80 to-[#2a2a4e]/80 backdrop-blur-sm text-white p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20 settings-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-gradient-to-br from-[#1a1a2e]/90 to-[#2a2a4e]/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/10 min-w-[300px] settings-panel"
          >
            <h3 className="font-silkscreen text-base mb-4 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AUDIO SETTINGS
            </h3>
            
            {/* Music Controls */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-silkscreen text-xs uppercase tracking-wider">Music</span>
                <button
                  onClick={() => setIsMusicMuted(!isMusicMuted)}
                  className={`p-2 rounded-xl transition-all duration-200 shadow-lg touch-manipulation ${
                    isMusicMuted ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}
                >
                  {isMusicMuted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.782a1 1 0 011.617.782zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.782a1 1 0 011.617.782zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative py-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-4 bg-gradient-to-r from-[#2a2a4e] to-[#3a3a5e] rounded-full appearance-none cursor-pointer slider shadow-inner touch-manipulation"
                  disabled={isMusicMuted}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm pointer-events-none"></div>
              </div>
              <div className="text-xs text-gray-400 mt-1 font-silkscreen text-center">
                {isMusicMuted ? 'MUTED' : `${Math.round(musicVolume * 100)}%`}
              </div>
            </div>

            {/* Sound Effects Controls */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-silkscreen text-xs uppercase tracking-wider">Sound FX</span>
                <button
                  onClick={() => setIsSoundEffectsMuted(!isSoundEffectsMuted)}
                  className={`p-2 rounded-xl transition-all duration-200 shadow-lg touch-manipulation ${
                    isSoundEffectsMuted ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  }`}
                >
                  {isSoundEffectsMuted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.782a1 1 0 011.617.782zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.782a1 1 0 011.617.782zM11.828 7.172a4 4 0 010 5.656 1 1 0 01-1.414-1.414 2 2 0 000-2.828 1 1 0 011.414-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative py-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={soundEffectsVolume}
                  onChange={(e) => setSoundEffectsVolume(parseFloat(e.target.value))}
                  className="w-full h-4 bg-gradient-to-r from-[#2a2a4e] to-[#3a3a5e] rounded-full appearance-none cursor-pointer slider shadow-inner touch-manipulation"
                  disabled={isSoundEffectsMuted}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-sm pointer-events-none"></div>
              </div>
              <div className="text-xs text-gray-400 mt-1 font-silkscreen text-center">
                {isSoundEffectsMuted ? 'MUTED' : `${Math.round(soundEffectsVolume * 100)}%`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-[#3a3a5e] to-[#4a4a6e] hover:from-[#4a4a6e] hover:to-[#5a5a7e] text-white py-2.5 px-4 rounded-xl font-silkscreen text-xs transition-all duration-200 shadow-lg border border-white/10 touch-manipulation"
              >
                CLOSE
              </button>

              <button
                onClick={handleClearSaveData}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl font-silkscreen text-xs transition-all duration-200 shadow-lg border border-red-400/50 touch-manipulation"
              >
                CLEAR SAVE DATA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(to right, #2a2a4e, #3a3a5e);
          border-radius: 12px;
          outline: none;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          touch-action: manipulation;
          min-height: 44px; /* Minimum touch target size */
          display: flex;
          align-items: center;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          position: relative;
          z-index: 10;
        }
        
        .slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: linear-gradient(135deg, #6B7280, #4B5563);
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: linear-gradient(135deg, #6B7280, #4B5563);
          cursor: not-allowed;
        }
        
        .slider:hover::-webkit-slider-thumb,
        .slider:active::-webkit-slider-thumb {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.2);
        }
        
        .slider:hover::-moz-range-thumb,
        .slider:active::-moz-range-thumb {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.2);
        }
        
        /* Mobile specific styles */
        @media (max-width: 640px) {
          .slider {
            min-height: 44px;
            padding: 4px 0;
          }
          
          .slider::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
          }
          
          .slider::-moz-range-thumb {
            width: 32px;
            height: 32px;
          }
        }
        
        /* Ultra-small screens */
        @media (max-width: 320px) {
          .slider {
            min-height: 40px;
          }
          
          .slider::-webkit-slider-thumb {
            width: 28px;
            height: 28px;
          }
          
          .slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
