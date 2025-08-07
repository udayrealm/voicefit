import { useState, useRef } from 'react';

interface UserData {
  id: string;
  username: string;
  email: string;
}

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp4' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendToWebhook = async (webhookUrl: string, userData?: UserData) => {
    if (!audioBlob) return false;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'workout_recording.m4a');
    
    // Add user information
    if (userData) {
      formData.append('user_id', userData.id);
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('timestamp', new Date().toISOString());
      formData.append('recording_type', 'workout');
    }

    // Also add metadata as JSON for easier processing
    const metadata = {
      user_id: userData?.id || '',
      username: userData?.username || '',
      email: userData?.email || '',
      timestamp: new Date().toISOString(),
      recording_type: 'workout',
      app_version: '1.0.0'
    };
    
    formData.append('metadata', JSON.stringify(metadata));

    try {
      console.log('🔗 Sending to n8n with user data:', metadata);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        console.log('✅ Successfully sent to n8n');
        setAudioBlob(null);
        return true;
      } else {
        console.error('❌ n8n webhook error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error sending audio to n8n:', error);
    }
    return false;
  };

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    sendToWebhook,
  };
};