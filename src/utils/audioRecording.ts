export const startRecording = async (): Promise<{ stream: MediaStream, recorder: MediaRecorder }> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  recorder.start();
  return { stream, recorder };
};

export const stopRecording = (recorder: MediaRecorder): Promise<Blob> => {
  return new Promise((resolve) => {
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/mp4' });
      resolve(blob);
    };
    recorder.stop();
  });
};