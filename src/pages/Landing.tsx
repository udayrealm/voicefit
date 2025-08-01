import React from 'react';
import { VoiceRecorder } from '../components/VoiceRecorder';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Voice Fit
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Record your workout by speaking
        </p>
        
        <VoiceRecorder webhookUrl={WEBHOOK_URL} />
      </div>
    </div>
  );
};