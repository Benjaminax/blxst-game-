import { useAtom } from 'jotai';
import { useCallback, useRef } from 'react';
import { soundEffectsVolumeAtom, isSoundEffectsMutedAtom } from '../atoms/gameAtoms';

export function useSoundEffects() {
  const [soundEffectsVolume] = useAtom(soundEffectsVolumeAtom);
  const [isSoundEffectsMuted] = useAtom(isSoundEffectsMutedAtom);
  const audioContextRef = useRef(null);

  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Could not create audio context:', error);
        return null;
      }
    }
    
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(error => {
        console.warn('Could not resume audio context:', error);
      });
    }
    
    return audioContextRef.current;
  }, []);

  // Create a simple tone generator
  const createTone = useCallback((frequency, duration, type = 'sine') => {
    if (isSoundEffectsMuted || soundEffectsVolume === 0) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const volume = soundEffectsVolume * 0.3; // Keep sounds subtle
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Could not create sound effect:', error);
    }
  }, [soundEffectsVolume, isSoundEffectsMuted, getAudioContext]);

  // Create a chord (multiple tones at once)
  const createChord = useCallback((frequencies, duration) => {
    if (isSoundEffectsMuted || soundEffectsVolume === 0) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const volume = (soundEffectsVolume * 0.2) / frequencies.length; // Divide by number of tones
        const startTime = audioContext.currentTime + (index * 0.05);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.warn('Could not create chord effect:', error);
    }
  }, [soundEffectsVolume, isSoundEffectsMuted, getAudioContext]);

  // Predefined sound effects
  const sounds = {
    // Piece placement - simple click sound
    placePiece: () => createTone(800, 0.1, 'square'),

    // Line clear - rising tone
    lineClear: () => createTone(1000, 0.3, 'triangle'),

    // Combo - ascending chord
    combo: () => createChord([523, 659, 784, 1047], 0.4), // C5, E5, G5, C6

    // Game over - descending tones
    gameOver: () => {
      createTone(440, 0.3, 'sawtooth');
      setTimeout(() => createTone(369, 0.3, 'sawtooth'), 200);
      setTimeout(() => createTone(293, 0.3, 'sawtooth'), 400);
      setTimeout(() => createTone(246, 0.5, 'sawtooth'), 600);
    },

    // Piece hover - very subtle tone
    hover: () => createTone(600, 0.05, 'sine')
  };

  return { sounds };
}
