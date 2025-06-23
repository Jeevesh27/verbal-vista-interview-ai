import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff } from 'lucide-react';

const AudioRecorder = forwardRef(({ isActive, onTranscription, onSpeakingChange }, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef();
  const timeoutRef = useRef();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useImperativeHandle(ref, () => ({
    startListening,
    stopListening
  }));

  useEffect(() => {
    if (isActive) {
      initializeSpeechRecognition();
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [isActive]);

  // Notify parent about speaking state
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingChange]);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let hasSpeech = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
          hasSpeech = true;
        }
      }

      // Update speaking state based on interim results
      setIsSpeaking(hasSpeech || interimTranscript.length > 0);
      setTranscript(finalTranscript + interimTranscript);

      // If we have a final result, send it and reset
      if (finalTranscript) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (finalTranscript.trim()) {
            onTranscription(finalTranscript.trim());
            setTranscript('');
            setIsSpeaking(false);
          }
        }, 1000); // Wait 1 second after final result before sending
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsSpeaking(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      // Restart if still active
      if (isActive) {
        setTimeout(() => {
          if (recognitionRef.current && isActive) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    };
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearTimeout(timeoutRef.current);
    setIsListening(false);
    setTranscript('');
    setIsSpeaking(false);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600 mb-2">
          <MicOff size={20} />
          <span className="font-medium">Audio Error</span>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-3">
        <div className={`p-3 rounded-full ${
          isListening 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        </div>
        <div className="text-center">
          <p className={`font-medium ${
            isListening ? 'text-green-600' : 'text-gray-500'
          }`}>
            {isListening ? 'Listening...' : 'Not listening'}
          </p>
          {isListening && (
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Speaking...</h3>
          <p className="text-blue-700">{transcript}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        {isActive 
          ? "Speak naturally - your response will be automatically detected"
          : "Microphone is disabled"
        }
      </div>
    </div>
  );
});

AudioRecorder.displayName = 'AudioRecorder';

export default AudioRecorder;
