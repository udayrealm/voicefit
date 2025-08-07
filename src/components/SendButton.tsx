import React, { useState } from 'react';
import { SendButtonProps } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SendButton: React.FC<SendButtonProps> = ({ audioBlob, webhookURL }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    // Check if webhook URL is configured
    if (!webhookURL || webhookURL.trim() === '') {
      alert('n8n webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your environment variables.');
      return;
    }

    // Check if user is logged in
    if (!user) {
      alert('Please log in to record your workout.');
      return;
    }

    // Debug: Log user object to see what we have
    console.log('🔍 SendButton: Current user object:', user);
    console.log('🔍 SendButton: User ID:', user.id);
    console.log('🔍 SendButton: Username:', user.username);
    console.log('🔍 SendButton: Email:', user.email);

    setIsLoading(true);

    try {
      // Convert audio blob to base64 for JSON transmission
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Create JSON payload with all data - send directly as the body
      const payload = {
        user_id: user.id || 'unknown',
        username: user.username || 'unknown',
        email: user.email || 'unknown@example.com',
        timestamp: new Date().toISOString(),
        recording_type: 'workout',
        app_version: '1.0.0',
        audio_data: base64Audio,
        audio_filename: 'workout_recording.m4a'
      };

      console.log('🔗 Sending to n8n with user data:', payload);

      const response = await fetch(webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Successfully sent to n8n');
        alert(`Recording sent successfully for ${user.username}!`);
      } else {
        console.error('❌ n8n webhook error:', response.status, response.statusText);
        alert('Failed to send recording');
      }
    } catch (error) {
      console.error('❌ Error sending audio to n8n:', error);
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