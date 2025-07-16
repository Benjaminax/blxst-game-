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
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(error => {
            console.error('Error playing music:', error);
          });
        }
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
    
    // Initialize background music with optimized settings for smooth playback
    backgroundMusicRef.current = new Howl({
      src: ['/Polo G - Went Legit (Official Music Video) [REMIX].mp3'],
      loop: true,
      volume: isMusicMuted ? 0 : musicVolume,
      html5: true,
      preload: true,
      autoplay: false, // Disable autoplay to prevent interruptions
      buffer: true, // Enable buffering for smoother playback
      onload: () => {
        console.log('Background music loaded successfully');
        isInitializedRef.current = true;
        if (musicPosition > 0) {
          backgroundMusicRef.current.seek(musicPosition);
          console.log(`Restored music position to ${musicPosition} seconds`);
        }
        // Start playing after load is complete
        if (!isMusicMuted) {
          console.log('Starting music playback after load');
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
          autoplay: false, // Disable autoplay for fallback too
          buffer: true,
          onload: () => {
            console.log('Background music loaded from src folder');
            isInitializedRef.current = true;
            if (musicPosition > 0) {
              backgroundMusicRef.current.seek(musicPosition);
            }
            if (!isMusicMuted) {
              console.log('Starting fallback music playback');
              tryPlayAudio();
            }
          },
          onloaderror: () => console.error('Could not load background music from any source')
        });
      },
      onplay: () => {
        console.log('Background music started playing');
        // Use more efficient position saving
        const savePositionLoop = () => {
          saveCurrentPosition();
          if (backgroundMusicRef.current?.playing()) {
            setTimeout(() => requestAnimationFrame(savePositionLoop), 5000); // Save every 5 seconds to reduce overhead
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

    // Simplified play attempts - reduce aggressive retries
    if (!isMusicMuted) {
      // Single immediate attempt
      setTimeout(() => tryPlayAudio(), 100);
    }

    // Simplified user interaction listeners with better audio context handling
    const handleUserInteraction = () => {
      console.log('User interaction detected, attempting to play music');
      
      // Resume audio context if needed
      if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('Audio context resumed');
            if (!isMusicMuted) {
              tryPlayAudio();
            }
          });
        } else if (!isMusicMuted) {
          tryPlayAudio();
        }
      } else if (!isMusicMuted) {
        tryPlayAudio();
      }
    };

    // Add minimal event listeners to reduce overhead - use capture to ensure we get the events
    document.addEventListener('click', handleUserInteraction, { once: true, capture: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, capture: true });

    // Remove window focus listener to prevent interruptions
    // Also try to play on window focus
    // const handleWindowFocus = () => {
    //   tryPlayAudio();
    // };
    // window.addEventListener('focus', handleWindowFocus);

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
      // Note: event listeners with { once: true } are automatically removed
      // but we should clean up the beforeunload listener
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
        // When muted, just set volume to 0 but keep playing to avoid interruptions
        console.log('Muting music (keeping playback)');
        backgroundMusicRef.current.volume(0);
      } else {
        // When unmuted, set volume and ensure playing
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
