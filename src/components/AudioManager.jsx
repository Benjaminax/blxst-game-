import { useAtom } from 'jotai';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Howl } from 'howler';
import { musicVolumeAtom, isMusicMutedAtom, musicPositionAtom } from '../atoms/gameAtoms';

export default function AudioManager() {
  const [musicVolume] = useAtom(musicVolumeAtom);
  const [isMusicMuted] = useAtom(isMusicMutedAtom);
  const [musicPosition, setMusicPosition] = useAtom(musicPositionAtom);
  const backgroundMusicRef = useRef(null);
  const savePositionIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Memoize the tryPlayAudio function to prevent recreating it on every render
  const tryPlayAudio = useCallback(() => {
    if (backgroundMusicRef.current && !backgroundMusicRef.current.playing() && !isMusicMuted) {
      console.log('Attempting to play background music...');
      try {
        backgroundMusicRef.current.play();
        console.log('Music play initiated successfully');
      } catch (error) {
        console.error('Error playing music:', error);
      }
    }
  }, [isMusicMuted]);

  // Optimize the position saving to use requestAnimationFrame instead of setInterval
  const saveCurrentPosition = useCallback(() => {
    if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
      const currentPosition = backgroundMusicRef.current.seek();
      if (typeof currentPosition === 'number' && currentPosition > 0) {
        setMusicPosition(currentPosition);
      }
    }
  }, [setMusicPosition]);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) return;
    
    console.log('AudioManager: Initializing with musicVolume:', musicVolume, 'isMusicMuted:', isMusicMuted);
    
    // Initialize background music with better settings for autoplay
    backgroundMusicRef.current = new Howl({
      src: ['/Polo G - Went Legit (Official Music Video) [REMIX].mp3'],
      loop: true,
      volume: isMusicMuted ? 0 : musicVolume,
      html5: true,
      preload: true,
      autoplay: true, // Enable autoplay for immediate music start
      onload: () => {
        console.log('Background music loaded successfully');
        isInitializedRef.current = true;
        if (musicPosition > 0) {
          backgroundMusicRef.current.seek(musicPosition);
          console.log(`Restored music position to ${musicPosition} seconds`);
        }
        // Force play even if muted (volume will be 0)
        if (!isMusicMuted) {
          console.log('Auto-starting music playback');
          tryPlayAudio();
        }
      },
      onloaderror: (id, error) => {
        console.error('Error loading background music:', error);
        // Single fallback attempt
        backgroundMusicRef.current = new Howl({
          src: ['/src/assets/music/Polo G - Went Legit (Official Music Video) [REMIX].mp3'],
          loop: true,
          volume: isMusicMuted ? 0 : musicVolume,
          html5: true,
          preload: true,
          autoplay: true, // Enable autoplay for fallback too
          onload: () => {
            console.log('Background music loaded from src folder');
            isInitializedRef.current = true;
            if (musicPosition > 0) {
              backgroundMusicRef.current.seek(musicPosition);
            }
            if (!isMusicMuted) {
              console.log('Auto-starting fallback music playback');
              tryPlayAudio();
            }
          },
          onloaderror: () => console.error('Could not load background music from any source')
        });
      },
      onplay: () => {
        console.log('Background music started playing');
        // Use requestAnimationFrame for better performance
        const savePositionLoop = () => {
          saveCurrentPosition();
          if (backgroundMusicRef.current?.playing()) {
            setTimeout(() => requestAnimationFrame(savePositionLoop), 2000); // Save every 2 seconds
          }
        };
        savePositionLoop();
      },
      onpause: () => {
        console.log('Background music paused');
        saveCurrentPosition();
      },
      onstop: () => {
        console.log('Background music stopped');
        saveCurrentPosition();
      }
    });

    // Function to start audio with better retry logic
    const tryPlayAudio = () => {
      if (backgroundMusicRef.current && !backgroundMusicRef.current.playing() && !isMusicMuted) {
        console.log('Attempting to play background music...');
        try {
          backgroundMusicRef.current.play();
          console.log('Music play initiated successfully');
        } catch (error) {
          console.error('Error playing music:', error);
        }
      }
    };

    // Immediate play attempt and better autoplay handling
    if (!isMusicMuted) {
      // Try to play immediately
      setTimeout(tryPlayAudio, 50);
      // Try again after a short delay for better autoplay success
      setTimeout(tryPlayAudio, 500);
      // Final attempt after longer delay
      setTimeout(tryPlayAudio, 2000);
    }

    // Multiple user interaction listeners for better coverage
    const handleUserInteraction = () => {
      console.log('User interaction detected, attempting to play music');
      if (!isMusicMuted) {
        tryPlayAudio();
      }
      // Remove listeners after first successful interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    // Add multiple event listeners for better autoplay coverage
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('touchend', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    // Also try to play on window focus
    const handleWindowFocus = () => {
      tryPlayAudio();
    };
    window.addEventListener('focus', handleWindowFocus);

    // Save position before page unload
    const handleBeforeUnload = () => {
      if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
        const currentPosition = backgroundMusicRef.current.seek();
        if (typeof currentPosition === 'number' && currentPosition > 0) {
          setMusicPosition(currentPosition);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save position before cleanup
      if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
        const currentPosition = backgroundMusicRef.current.seek();
        if (typeof currentPosition === 'number' && currentPosition > 0) {
          setMusicPosition(currentPosition);
        }
      }
      
      // Clear interval
      if (savePositionIntervalRef.current) {
        clearInterval(savePositionIntervalRef.current);
      }
      
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop();
        backgroundMusicRef.current.unload();
      }
    };
  }, [musicPosition, setMusicPosition, isMusicMuted]);

  // Update volume and playback state when settings change
  useEffect(() => {
    if (backgroundMusicRef.current) {
      console.log('Music settings changed - Volume:', musicVolume, 'Muted:', isMusicMuted);
      
      if (isMusicMuted) {
        // When muted, pause the music
        console.log('Pausing music due to mute');
        if (backgroundMusicRef.current.playing()) {
          backgroundMusicRef.current.pause();
        }
        backgroundMusicRef.current.volume(0);
      } else {
        // When unmuted, set volume and try to play
        console.log('Unmuting music, setting volume to:', musicVolume);
        backgroundMusicRef.current.volume(musicVolume);
        
        // Try to play if not currently playing
        if (!backgroundMusicRef.current.playing()) {
          console.log('Attempting to resume music after unmute');
          try {
            backgroundMusicRef.current.play();
          } catch (error) {
            console.error('Error resuming music:', error);
          }
        }
      }
    }
  }, [musicVolume, isMusicMuted]);

  return null; // This component doesn't render anything
}
