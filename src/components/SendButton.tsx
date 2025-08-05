import React, { useState } from 'react';
import { SendButtonProps } from '../types';

const SendButton: React.FC<SendButtonProps> = ({ audioBlob, webhookURL }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    // Check if webhook URL is configured
    if (!webhookURL || webhookURL.trim() === '') {
      alert('n8n webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('data', audioBlob, 'test.m4a');

      const response = await fetch(webhookURL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Recording sent successfully!');
      } else {
        alert('Failed to send recording');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Failed to send recording');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendAudio}
      disabled={!audioBlob || isLoading}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 cursor-pointer transition-colors"
    >
      {isLoading ? 'Sending...' : 'Send Recording'}
    </button>
  );
};

export default SendButton;