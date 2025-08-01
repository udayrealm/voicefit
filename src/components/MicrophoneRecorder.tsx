import React, { useState, useCallback } from 'react';
import { MicrophoneRecorderProps } from '../types';
import { startRecording, stopRecording } from '../utils/audioRecording';

const MicrophoneRecorder: React.FC<MicrophoneRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleStartRecording = useCallback(async () => {
    try {
      const { stream, recorder } = await startRecording();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    if (mediaRecorder) {
      try {
        const audioBlob = await stopRecording(mediaRecorder);
        onRecordingComplete(audioBlob);
        setIsRecording(false);
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  }, [mediaRecorder, onRecordingComplete]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md cursor-pointer transition-colors ${
          isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'
        }`}
      >
        {isRecording ? '⏹️' : '🎤'}
      </button>
      <p className="text-gray-600">
        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
      </p>
    </div>
  );
};

export default MicrophoneRecorder;