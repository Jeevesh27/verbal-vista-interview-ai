
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const TextToSpeech = forwardRef((props, ref) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef();

  useImperativeHandle(ref, () => ({
    speak,
    stop,
    isSpeaking
  }));

  const speak = (text) => {
    // Stop any current speech
    stop();

    if (!text || !('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported or no text provided');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Get available voices and set a preferred one
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || 
           voice.name.includes('Microsoft') ||
           voice.name.includes('Natural') ||
           voice.default)
        ) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        }
      }
    };

    setVoice();

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 100);
  };

  const stop = () => {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  // Load voices when component mounts and when voices change
  React.useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Voices loaded:', voices.length);
    };

    // Initial load
    loadVoices();
    
    // Listen for voice changes
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup on unmount
    return () => {
      stop();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return null; // This component doesn't render anything
});

TextToSpeech.displayName = 'TextToSpeech';

export default TextToSpeech;
