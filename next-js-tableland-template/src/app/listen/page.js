"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import "../globals.css";
import { useEffect, useState, useRef } from 'react';
import { useSigner } from '@/hooks/useSigner'; // Adjust the import path based on your project structure
import Link from 'next/link';
import ClaimableRewardsButton from "../components/ClaimableRewardsButton"

export default function Listen() {
  const [sentence, setSentence] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signer = useSigner();
  const [userId, setUserId] = useState('');
  const audioRef = useRef(null);
  const [recordingId, setRecordingId] = useState('');
  const [recordingRated, setRecordingRated] = useState(false);

  const fetchRecordingAndSentence = async () => {
    const userAddress = await signer.getAddress();
    setUserId(userAddress);
    setIsLoading(true);

    // Fetching unique audio recording
    try {
      const recordingResponse = await fetch('/api/getrecordingtoverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userAddress }),
      });

      if (!recordingResponse.ok) {
        throw new Error('Failed to fetch recording');
      }

      const recordingData = await recordingResponse.json();
      setAudioSrc(recordingData.ipfshash);
      setRecordingId(recordingData.recording_id);


      // Fetching corresponding sentence
      const sentenceResponse = await fetch('/api/getsentencebyid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence_id: recordingData.sentence_id }),
      });

      if (!sentenceResponse.ok) {
        throw new Error('Failed to fetch sentence');
      }

      const sentenceData = await sentenceResponse.json();
      setSentence(sentenceData);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
     
    if (signer) {
      fetchRecordingAndSentence();
    }
  }, [signer]);

  const togglePlay = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

  const approveRecording = async () => {
    await verifyRecording(1); // Passing 1 for approval
    setRecordingRated(true);
  };
  
  const rejectRecording = async () => {
    await verifyRecording(0); // Passing 0 for rejection
    setRecordingRated(true);
  };
  
  const verifyRecording = async (valid) => {
    setIsLoading(true); // Disables buttons while processing
  
    try {
      const response = await fetch('/api/verifyrecording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recording_id: recordingId,
          verifier_user_id: userId,
          valid: valid,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to verify recording');
      }
  
      console.log("Recording verification successful", await response.json());
  
    } catch (error) {
      console.error('Error verifying recording:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
    <nav className="sticky top-0 flex items-center justify-between bg-lightgreen opacity-100 shadow p-2 mb-8">
      {/* Flex container for logo and Dataset Page link */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">
          <Link href="/">
            
              <Image
                src="/logo.svg"
                alt="Tableland Logo"
                width={200} // Adjust the width as necessary
                height={100} // Adjust the height as necessary
                style={{ width: '200px', height: 'auto' }}
                priority
              />
           
          </Link>
        </h1>
        {/* Dataset Page link next to the logo */}
        <Link legacyBehavior href="/dataset">
          <a className="text-lg px-3 py-2px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">Dataset Page</a>
        </Link>
        <ClaimableRewardsButton/>
      </div>
        <div>
          <ConnectButton />
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex  justify-center items-center h-[calc(50vh-64px)]">
      <div className="p-8 border-2 border-gray-300 shadow-lg rounded-md">
        <p className="text-xl text-center">{sentence || 'Loading sentence...'}</p>
      </div>
    </div>
      {audioSrc && (
        <audio src={audioSrc} controls ref={audioRef} className="mb-4" />
      )}
     {
        !recordingRated ? (
          <>
            <div className="flex items-center justify-between border-4 border-black p-4 rounded-lg bg-white w-full max-w-md">
              <button onClick={rejectRecording} className="px-4 py-2 border-2 border-black bg-white text-black rounded text-sm flex-1 mr-2 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200" disabled={isLoading}>Reject</button>
              <button onClick={togglePlay} className="px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200" disabled={isLoading}>Play Recording</button>
              <button onClick={approveRecording} className="px-4 py-2 border-2 border-black bg-white text-black rounded text-sm flex-1 ml-2 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200" disabled={isLoading}>Approve</button>
            </div>
            <button onClick={fetchRecordingAndSentence} className="mt-4 px-4 py-2 border-2 border-black bg-white text-black rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200" disabled={isLoading}>
              Listen to a new recording?
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between border-4 border-black p-4 rounded-lg bg-white w-full max-w-md">
          <button onClick={fetchRecordingAndSentence} className="px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200" disabled={isLoading}>
            New Recording?
          </button>
          </div>
        )
      }

    </div>
    </>
  );
}
