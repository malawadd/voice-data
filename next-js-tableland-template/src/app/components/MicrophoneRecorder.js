import React, { useState, useEffect } from 'react';

export  function MicrophoneRecorder({ onSubmit, disabled }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);

  useEffect(() => {
    // Request permission and set up the media recorder
    async function setupMediaRecorder() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          const url = URL.createObjectURL(e.data);
          setAudioURL(url);
          setAudioBlob(e.data);
        };
        setMediaRecorder(recorder);
      }
    }

    setupMediaRecorder();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      setRecording(true);
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      setRecording(false);
      mediaRecorder.stop();
    }
  };

  const handleReRecord = () => {
    setAudioURL('');
    setAudioBlob(null);
    startRecording();
  };

  const handlePlayback = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const handleSubmit = () => {
    if (audioBlob && onSubmit) {
      onSubmit(audioBlob);
    }
  };

  

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
  {audioURL ? (
    <>
      <div className="w-full flex justify-center items-center">
        <audio src={audioURL} controls className="mb-4" />
      </div>
      <div className="flex items-center justify-between border-4 border-black p-4 rounded-lg bg-white w-full max-w-md">
        <button onClick={handleReRecord} disabled={disabled} className="px-4 py-2 border-2 border-black bg-white text-black rounded text-sm flex-1 mr-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">Re-record</button>
        <button onClick={handlePlayback} disabled={disabled} className="px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">Play Recording</button>
        <button onClick={handleSubmit} disabled={disabled} className="px-4 py-2 border-2 border-black bg-white text-black rounded text-sm flex-1 ml-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">Submit</button>
      </div>
    </>
  ) : (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
      className={`px-4 py-2 border-2 border-black ${recording ? 'bg-red-500' : 'bg-blue-500'} text-white rounded hover:bg-white hover:text-black disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200`}
    >
      {recording ? 'Stop Recording' : 'Start Recording'}
    </button>
  )}
</div>

  );
  
}
