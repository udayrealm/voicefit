import { useState, useRef } from 'react';

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

  const sendToWebhook = async (webhookUrl: string) => {
    if (!audioBlob) return false;

    const formData = new FormData();
    formData.append('data', audioBlob, 'test.m4a');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setAudioBlob(null);
        return true;
      }
    } catch (error) {
      console.error('Error sending audio:', error);
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