
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, MessageSquare, Send, Users, Settings, Phone, PhoneOff, Volume2 } from 'lucide-react';
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
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const audioRecorderRef = useRef();
  const textToSpeechRef = useRef();
  const chatEndRef = useRef();

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const startInterview = async () => {
    setIsInterviewActive(true);
    setIsCameraOn(true);
    setIsMicOn(true);
    
    const welcomeMessage = "Welcome to your AI interview. Please introduce yourself and tell me your name.";
    setCurrentQuestion(welcomeMessage);
    
    setIsAISpeaking(true);
    if (textToSpeechRef.current) {
      textToSpeechRef.current.speak(welcomeMessage);
    }
    
    setConversationHistory([{ type: 'ai', message: welcomeMessage, timestamp: new Date() }]);
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsAISpeaking(false);
    setIsUserSpeaking(false);
    if (textToSpeechRef.current) {
      textToSpeechRef.current.stop();
    }
  };

  const handleUserResponse = async (userText) => {
    if (!userText.trim()) return;

    setIsLoading(true);
    setIsUserSpeaking(false);
    
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
        
        setConversationHistory(prev => [...prev, { 
          type: 'ai', 
          message: aiQuestion, 
          timestamp: new Date() 
        }]);

        setIsAISpeaking(true);
        if (textToSpeechRef.current) {
          textToSpeechRef.current.speak(aiQuestion);
        }
      }
    } catch (error) {
      console.error('Error sending response:', error);
      const errorMessage = "I'm sorry, there was an error processing your response. Please try again.";
      setCurrentQuestion(errorMessage);
      
      setIsAISpeaking(true);
      if (textToSpeechRef.current) {
        textToSpeechRef.current.speak(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    setConversationHistory(prev => [...prev, {
      type: 'chat',
      message: chatMessage,
      timestamp: new Date()
    }]);
    
    setChatMessage('');
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Handle TTS events
  useEffect(() => {
    const handleSpeechStart = () => setIsAISpeaking(true);
    const handleSpeechEnd = () => setIsAISpeaking(false);

    if (textToSpeechRef.current) {
      textToSpeechRef.current.onSpeechStart = handleSpeechStart;
      textToSpeechRef.current.onSpeechEnd = handleSpeechEnd;
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">AI Interview Session</h1>
              <p className="text-sm text-slate-500">Professional Assessment</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <MessageSquare size={20} />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Section */}
        <div className="flex-1 lg:flex-none lg:w-2/3 flex flex-col">
          {/* Video Container */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/50">
                <CameraVideo isActive={isCameraOn} />
                
                {/* Speaking Indicator Overlay */}
                {(isUserSpeaking || isAISpeaking) && (
                  <div className="absolute top-4 left-4">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                      isUserSpeaking 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-blue-500/90 text-white'
                    } backdrop-blur-sm animate-pulse`}>
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm font-medium">
                        {isUserSpeaking ? 'You are speaking' : 'AI is speaking'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Participant Label */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                    You
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question Section */}
          {isInterviewActive && (
            <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 p-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isAISpeaking 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    {isAISpeaking ? (
                      <Volume2 className="text-white" size={20} />
                    ) : (
                      <span className="text-white text-sm font-semibold">AI</span>
                    )}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-slate-200/50">
                    {isLoading ? (
                      <div className="flex items-center space-x-3 text-slate-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                        <span>Processing your response...</span>
                      </div>
                    ) : (
                      <p className="text-slate-800 leading-relaxed">{currentQuestion}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200/50 p-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isMicOn 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-md' 
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                }`}
              >
                {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
              </button>
              
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isCameraOn 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-md' 
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                }`}
              >
                {isCameraOn ? <Camera size={22} /> : <CameraOff size={22} />}
              </button>

              {!isInterviewActive ? (
                <button
                  onClick={startInterview}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Join Interview
                </button>
              ) : (
                <button
                  onClick={endInterview}
                  className="p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <PhoneOff size={22} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Chat Section */}
        <div className={`${showChat ? 'block' : 'hidden'} lg:block w-full lg:w-1/3 bg-white/90 backdrop-blur-sm border-l border-slate-200/50 flex flex-col`}>
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-200/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Interview Chat</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} className="text-slate-400" />
                </div>
                <p className="text-lg font-medium mb-2">Ready to start</p>
                <p className="text-sm">Your conversation will appear here</p>
              </div>
            ) : (
              conversationHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                      item.type === 'ai'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border border-blue-100'
                        : item.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold opacity-90">
                        {item.type === 'ai' ? 'AI Interviewer' : item.type === 'user' ? 'You' : 'Chat'}
                      </span>
                      <span className="text-xs opacity-70">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-slate-200/50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Recorder - Hidden but Active */}
      {isInterviewActive && (
        <div className="hidden">
          <AudioRecorder
            ref={audioRecorderRef}
            isActive={isMicOn && isInterviewActive}
            onTranscription={handleUserResponse}
            onSpeakingChange={setIsUserSpeaking}
          />
        </div>
      )}

      {/* Text to Speech Component */}
      <TextToSpeech ref={textToSpeechRef} />
    </div>
  );
};

export default Interview;
