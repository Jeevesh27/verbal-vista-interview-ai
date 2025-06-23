
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

    // Try to use a more natural voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  // Load voices when component mounts
  React.useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return null; // This component doesn't render anything
});

TextToSpeech.displayName = 'TextToSpeech';

export default TextToSpeech;
