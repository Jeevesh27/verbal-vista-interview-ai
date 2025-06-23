
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, Square, Play } from 'lucide-react';
import CameraVideo from './CameraVideo';
import AudioRecorder from './AudioRecorder';
import TextToSpeech from './TextToSpeech';
import axios from 'axios';

const Interview = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [sessionId] = useState('6851086aed4d8125b0785e87');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const audioRecorderRef = useRef();
  const textToSpeechRef = useRef();

  const startInterview = async () => {
    setIsInterviewActive(true);
    setIsCameraOn(true);
    setIsMicOn(true);
    
    // Initial greeting
    const welcomeMessage = "Welcome to your AI interview. Please introduce yourself and tell me your name.";
    setCurrentQuestion(welcomeMessage);
    
    if (textToSpeechRef.current) {
      textToSpeechRef.current.speak(welcomeMessage);
    }
    
    setConversationHistory([{ type: 'ai', message: welcomeMessage, timestamp: new Date() }]);
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    if (textToSpeechRef.current) {
      textToSpeechRef.current.stop();
    }
  };

  const handleUserResponse = async (userText) => {
    if (!userText.trim()) return;

    setIsLoading(true);
    
    // Add user response to history
    setConversationHistory(prev => [...prev, { 
      type: 'user', 
      message: userText, 
      timestamp: new Date() 
    }]);

    try {
      const response = await axios.post(
        'https://774f-160-22-60-12.ngrok-free.app/generateInterview',
        {
          sessionId: sessionId,
          userResponse: userText
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.question) {
        const aiQuestion = response.data.question;
        setCurrentQuestion(aiQuestion);
        
        // Add AI response to history
        setConversationHistory(prev => [...prev, { 
          type: 'ai', 
          message: aiQuestion, 
          timestamp: new Date() 
        }]);

        // Speak the response
        if (textToSpeechRef.current) {
          textToSpeechRef.current.speak(aiQuestion);
        }
      }
    } catch (error) {
      console.error('Error sending response:', error);
      const errorMessage = "I'm sorry, there was an error processing your response. Please try again.";
      setCurrentQuestion(errorMessage);
      
      if (textToSpeechRef.current) {
        textToSpeechRef.current.speak(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            AI Interview Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a professional AI-powered interview with real-time conversation and feedback
          </p>
        </div>

        {/* Main Interview Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Video and Controls Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Camera Feed */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Video Feed</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`p-3 rounded-lg transition-colors ${
                      isCameraOn 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                  </button>
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3 rounded-lg transition-colors ${
                      isMicOn 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                </div>
              </div>
              
              <CameraVideo isActive={isCameraOn} />
            </div>

            {/* Interview Controls */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Controls</h2>
              <div className="flex flex-wrap gap-4">
                {!isInterviewActive ? (
                  <button
                    onClick={startInterview}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <Play size={20} />
                    <span>Start Interview</span>
                  </button>
                ) : (
                  <button
                    onClick={endInterview}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <Square size={20} />
                    <span>End Interview</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="space-y-6">
            {/* Current Question */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Question</h2>
              <div className="bg-blue-50 rounded-lg p-4 min-h-[120px] flex items-center">
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {currentQuestion || "Click 'Start Interview' to begin your AI interview session."}
                  </p>
                )}
              </div>
            </div>

            {/* Audio Recorder */}
            {isInterviewActive && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Voice Input</h2>
                <AudioRecorder
                  ref={audioRecorderRef}
                  isActive={isMicOn && isInterviewActive}
                  onTranscription={handleUserResponse}
                />
              </div>
            )}

            {/* Conversation History */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation History</h2>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {conversationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Conversation will appear here once the interview starts
                  </p>
                ) : (
                  conversationHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        item.type === 'ai' 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'bg-green-50 border-l-4 border-green-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${
                          item.type === 'ai' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {item.type === 'ai' ? 'AI Interviewer' : 'You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Components */}
        <TextToSpeech ref={textToSpeechRef} />
      </div>
    </div>
  );
};

export default Interview;
