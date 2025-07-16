import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { musicVolumeAtom, isMusicMutedAtom, musicPositionAtom } from '../atoms/gameAtoms';

export default function AudioManager() {
  const [musicVolume] = useAtom(musicVolumeAtom);
  const [isMusicMuted] = useAtom(isMusicMutedAtom);
  const [musicPosition, setMusicPosition] = useAtom(musicPositionAtom);
  const backgroundMusicRef = useRef(null);
  const savePositionIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize background music with better settings for autoplay
    backgroundMusicRef.current = new Howl({
      src: ['/src/assets/music/Polo G - Went Legit (Official Music Video) [REMIX].mp3'],
      loop: true,
      volume: isMusicMuted ? 0 : musicVolume,
      html5: true,
      preload: true, // Preload for faster playback
      autoplay: false, // Don't autoplay immediately to avoid browser blocking
      onload: () => {
        console.log('Background music loaded successfully');
        // Restore position after loading and immediately try to play
        if (musicPosition > 0) {
          backgroundMusicRef.current.seek(musicPosition);
          console.log(`Restored music position to ${musicPosition} seconds`);
        }
        // Only try to play if not muted
        if (!isMusicMuted) {
          tryPlayAudio();
        }
      },
      onloaderror: (id, error) => {
        console.error('Error loading background music:', error);
        // Try alternative path
        backgroundMusicRef.current = new Howl({
          src: ['/assets/music/Polo G - Went Legit (Official Music Video) [REMIX].mp3'],
          loop: true,
          volume: isMusicMuted ? 0 : musicVolume,
          html5: true,
          preload: true,
          autoplay: false,
          onload: () => {
            console.log('Background music loaded from assets folder');
            // Restore position after loading
            if (musicPosition > 0) {
              backgroundMusicRef.current.seek(musicPosition);
              console.log(`Restored music position to ${musicPosition} seconds`);
            }
            // Only try to play if not muted
            if (!isMusicMuted) {
              tryPlayAudio();
            }
          },
          onloaderror: () => console.error('Could not load background music from any source')
        });
      },
      onplay: () => {
        console.log('Background music started playing');
        // Start saving position periodically
        if (savePositionIntervalRef.current) {
          clearInterval(savePositionIntervalRef.current);
        }
        savePositionIntervalRef.current = setInterval(() => {
          if (backgroundMusicRef.current && backgroundMusicRef.current.playing()) {
            const currentPosition = backgroundMusicRef.current.seek();
            if (typeof currentPosition === 'number' && currentPosition > 0) {
              setMusicPosition(currentPosition);
            }
          }
        }, 1000); // Save position every second
      },
      onpause: () => {
        console.log('Background music paused');
        // Save current position when paused
        if (backgroundMusicRef.current) {
          const currentPosition = backgroundMusicRef.current.seek();
          if (typeof currentPosition === 'number' && currentPosition > 0) {
            setMusicPosition(currentPosition);
          }
        }
        // Clear interval when paused
        if (savePositionIntervalRef.current) {
          clearInterval(savePositionIntervalRef.current);
        }
      },
      onstop: () => {
        console.log('Background music stopped');
        // Clear interval when stopped
        if (savePositionIntervalRef.current) {
          clearInterval(savePositionIntervalRef.current);
        }
      }
    });

    // Function to start audio with better retry logic
    const tryPlayAudio = () => {
      if (backgroundMusicRef.current && !backgroundMusicRef.current.playing() && !isMusicMuted) {
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise) {
          console.log('Attempting to play background music');
        }
      }
    };

    // Only try to play if not muted
    if (!isMusicMuted) {
      setTimeout(tryPlayAudio, 100); // Small delay to ensure everything is ready
    }

    // Multiple user interaction listeners for better coverage
    const handleUserInteraction = () => {
      if (!isMusicMuted) {
        tryPlayAudio();
      }
      // Remove listeners after first successful interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
    };

    // Add multiple event listeners for better autoplay coverage
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('touchend', handleUserInteraction);

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
      if (isMusicMuted) {
        // When muted, set volume to 0 and pause
        backgroundMusicRef.current.volume(0);
        if (backgroundMusicRef.current.playing()) {
          backgroundMusicRef.current.pause();
        }
      } else {
        // When unmuted, set volume and resume if it was playing
        backgroundMusicRef.current.volume(musicVolume);
        if (!backgroundMusicRef.current.playing()) {
          backgroundMusicRef.current.play();
        }
      }
    }
  }, [musicVolume, isMusicMuted]);

  return null; // This component doesn't render anything
}
