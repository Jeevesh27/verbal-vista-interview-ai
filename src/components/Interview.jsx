
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, MessageSquare, Send, Users, Settings, Phone, PhoneOff } from 'lucide-react';
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-medium text-gray-900">AI Interview</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <Users size={16} />
            <span>Interview Session</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center">
            <div className="max-w-4xl w-full">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <CameraVideo isActive={isCameraOn} />
              </div>
            </div>
          </div>

          {/* Current Question Bar */}
          {isInterviewActive && (
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span>Processing your response...</span>
                      </div>
                    ) : (
                      <p className="text-gray-800">{currentQuestion}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`p-3 rounded-full transition-colors ${
                  isCameraOn 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>

              {!isInterviewActive ? (
                <button
                  onClick={startInterview}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors"
                >
                  Join Interview
                </button>
              ) : (
                <button
                  onClick={endInterview}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <PhoneOff size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`${showChat ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Interview Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Interview conversation will appear here</p>
              </div>
            ) : (
              conversationHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg ${
                      item.type === 'ai'
                        ? 'bg-gray-100 text-gray-800'
                        : item.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {item.type === 'ai' ? 'AI Interviewer' : item.type === 'user' ? 'You' : 'Chat'}
                      </span>
                      <span className="text-xs opacity-70">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm">{item.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          />
        </div>
      )}

      {/* Text to Speech Component */}
      <TextToSpeech ref={textToSpeechRef} />
    </div>
  );
};

export default Interview;
