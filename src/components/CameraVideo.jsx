
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

const CameraVideo = ({ isActive }) => {
  const videoRef = useRef();
  const streamRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (error) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <Camera size={48} className="mb-4" />
        <p className="text-center px-4">{error}</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <Camera size={48} className="mb-4" />
        <p>Camera is off</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default CameraVideo;
