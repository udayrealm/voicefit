import React, { useState } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface VoiceRecorderProps {
  webhookUrl: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ webhookUrl }) => {
  const { isRecording, audioBlob, startRecording, stopRecording, sendToWebhook } = useVoiceRecording();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    const success = await sendToWebhook(webhookUrl);
    setIsSending(false);
    if (success) {
      alert('Workout recorded successfully!');
    } else {
      alert('Failed to send recording. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isRecording ? '⏹️' : '🎤'}
      </button>
      
      <p className="text-gray-600">
        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
      </p>

      {audioBlob && (
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send Recording'}
        </button>
      )}
    </div>
  );
};