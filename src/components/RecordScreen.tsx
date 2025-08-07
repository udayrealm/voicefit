import React, { useState } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useAuth } from '../contexts/AuthContext';

const RecordScreen: React.FC = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, sendToWebhook } = useVoiceRecording();
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  
  const webhookURL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://yousefakil1996.app.n8n.cloud/webhook-test/92fa5709-4d87-414a-93c3-77cbbbd07f57';

  const handleSendRecording = async () => {
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

    setIsSending(true);
    const success = await sendToWebhook(webhookURL, {
      id: user.id,
      username: user.username,
      email: user.email
    });
    setIsSending(false);

    if (success) {
      alert(`Workout recorded successfully for ${user.username}!`);
    } else {
      alert('Failed to send recording. Please try again.');
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Voice Recording Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">Voice Recording</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording your workout'}
            </p>
            {audioBlob && (
              <p className="text-xs text-green-600 mt-2">Audio recorded! Ready to send.</p>
            )}
          </div>
        </div>
      </div>

      {/* Webhook Status */}
      {(!webhookURL || webhookURL.trim() === '') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <p className="text-sm text-yellow-800">
              n8n webhook URL not configured. Set VITE_N8N_WEBHOOK_URL in your .env file.
            </p>
          </div>
        </div>
      )}

      {/* Send Recording Button */}
      <button
        onClick={handleSendRecording}
        disabled={!audioBlob || isSending || !webhookURL || webhookURL.trim() === ''}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {isSending ? 'Sending...' : 'Send Recording to n8n Webhook'}
      </button>

      {/* Instructions Card */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-800 mb-4">How to Record Your Workout</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">1.</span>
            <p>Click the microphone button to start recording your voice</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">2.</span>
            <p>Describe your workout exercises, sets, reps, and weights</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">3.</span>
            <p>Click the stop button when you're done recording</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">4.</span>
            <p>Click "Send Recording" to process and save your workout</p>
          </div>
        </div>
      </div>

      {/* Example Recording */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">Example Recording</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 italic">
            "I did bench press, 3 sets of 10 reps at 135 pounds, I felt strong today."
          </p>
          <p className="text-sm text-gray-700 italic mt-2">
            OR
          </p>
          <p className="text-sm text-gray-700 italic">
            "I ran 3 miles in 28 minutes at a steady pace, felt great"
          </p>
          <p className="text-sm text-gray-700 italic mt-2">
            OR
          </p>
          <p className="text-sm text-gray-700 italic">
            "Did 45 minutes of yoga, focused on balancing feeling relaxed"
          </p>
        </div>
      </div>

      {/* Recording Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">Recording Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Microphone Status:</span>
            <span className={`text-sm font-medium ${isRecording ? 'text-red-600' : 'text-green-600'}`}>
              {isRecording ? 'Recording' : 'Ready'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Audio File:</span>
            <span className={`text-sm font-medium ${audioBlob ? 'text-green-600' : 'text-gray-400'}`}>
              {audioBlob ? 'Recorded' : 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ready to Send:</span>
            <span className={`text-sm font-medium ${audioBlob ? 'text-green-600' : 'text-gray-400'}`}>
              {audioBlob ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordScreen; 