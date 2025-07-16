import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { musicVolumeAtom, isMusicMutedAtom } from '../atoms/gameAtoms';

export default function AudioManager() {
  const [musicVolume] = useAtom(musicVolumeAtom);
  const [isMusicMuted] = useAtom(isMusicMutedAtom);
  const backgroundMusicRef = useRef(null);

  useEffect(() => {
    // Initialize background music
    backgroundMusicRef.current = new Howl({
      src: ['/018 CULTUR FM (2024 Live Afrobeats Mix by MS DSF).mp3'],
      loop: true,
      volume: isMusicMuted ? 0 : musicVolume,
      html5: true, // Use HTML5 Audio for better streaming
      onload: () => {
        console.log('Background music loaded successfully');
      },
      onloaderror: (id, error) => {
        console.error('Error loading background music:', error);
        // Try alternative path
        backgroundMusicRef.current = new Howl({
          src: ['/public/018 CULTUR FM (2024 Live Afrobeats Mix by MS DSF).mp3'],
          loop: true,
          volume: isMusicMuted ? 0 : musicVolume,
          html5: true,
          onload: () => console.log('Background music loaded from public folder'),
          onloaderror: () => console.error('Could not load background music from any source')
        });
      },
      onplay: () => {
        console.log('Background music started playing');
      },
      onpause: () => {
        console.log('Background music paused');
      }
    });

    // Function to start audio (needs user interaction)
    const startAudio = () => {
      if (backgroundMusicRef.current && !backgroundMusicRef.current.playing()) {
        backgroundMusicRef.current.play();
        console.log('Attempting to play background music');
      }
    };

    // Try to play immediately
    startAudio();

    // Also try to play on any user interaction
    const handleUserInteraction = () => {
      startAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop();
        backgroundMusicRef.current.unload();
      }
    };
  }, []);

  // Update volume when settings change
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume(isMusicMuted ? 0 : musicVolume);
    }
  }, [musicVolume, isMusicMuted]);

  return null; // This component doesn't render anything
}
