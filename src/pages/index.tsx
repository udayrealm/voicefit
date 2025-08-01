import React, { useState } from 'react';
import MicrophoneRecorder from '../components/MicrophoneRecorder';
import SendButton from '../components/SendButton';

const LandingPage: React.FC = () => {
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const webhookURL = 'https://yousefakil1996.app.n8n.cloud/webhook-test/92fa5709-4d87-414a-93c3-77cbbbd07f57';

  const handleRecordingComplete = (audioBlob: Blob) => {
    setRecordedAudioBlob(audioBlob);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Voice Fit</h1>
        <p className="text-gray-600 text-center mb-8">Record your workout by speaking</p>
        
        <div className="flex flex-col items-center space-y-6">
          <MicrophoneRecorder onRecordingComplete={handleRecordingComplete} />
          {recordedAudioBlob && (
            <SendButton audioBlob={recordedAudioBlob} webhookURL={webhookURL} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;