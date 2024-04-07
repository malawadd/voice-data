"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from 'next/link';
import "../globals.css";
import { useEffect, useState } from 'react';
import { useSigner } from '@/hooks/useSigner'; // Adjust the import path based on your project structure
import {MicrophoneRecorder} from "../components/MicrophoneRecorder"
import ClaimableRewardsButton from "../components/ClaimableRewardsButton"

export default function Speak() {
  const [sentence, setSentence] = useState('');
  const [sentenceId, setSentenceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signer = useSigner(); // This hook is supposed to provide signer object
  const [address, setAddress] = useState('');
  useEffect(() => {
    async function fetchUniqueSentence() {
      const userId = await signer.getAddress(); // Assuming useSigner hook provides an object with getAddress method
      setAddress(userId)
      try {
        const response = await fetch('/api/getuniquesentence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch the unique sentence');
        }

        const data = await response.json();
        setSentence(data.sentence_text); 
        setSentenceId(data.sentence_id);
      } catch (error) {
        console.error('Error fetching unique sentence:', error);
      }
    }

    if (signer) {
      fetchUniqueSentence();
    }
  }, [signer]);

  // const handleAudioSubmit = (audioBlob) => {
  //   console.log('Submitting audio:', audioBlob);
  //   // Here you would handle uploading the audio blob to your server or processing it further
  // };

  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);
        console.log('Submitting audio:', audioBlob);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.ogg');

    try {
      // Make the POST request to your upload endpoint
      const response = await fetch('/api/uploadaudio', {
        method: 'POST',
        body: formData, // Pass the form data as the request body
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }

      const ipfshash = await response.json();
      console.log('Uploaded audio is available at:', ipfshash);

      const sentence_id = sentenceId ;
      const user_id = address;

      const addRecordingResponse = await fetch('/api/addrecording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence_id, user_id, ipfshash }),
      });

      if (!addRecordingResponse.ok) throw new Error('Failed to add recording');

      // Process successful
      console.log('Recording added successfully');

      setIsLoading(false);
      // Handle the public URL as needed, e.g., displaying it to the user or saving it in your state
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
    setIsLoading(false);
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
    <div className="flex  justify-center items-center h-[calc(50vh-64px)]">
      <div className="p-8 border-2 border-gray-300 shadow-lg rounded-md">
        <p className="text-xl text-center">{sentence || 'Loading sentence...'}</p>
      </div>
    </div>
    <div className="container mx-auto">
      <h1 className="text-center text-2xl font-bold mb-4">Record Your Sentence</h1>
      <MicrophoneRecorder onSubmit={handleAudioSubmit} disabled={isLoading}/>
    </div>
    </>
  );
}
