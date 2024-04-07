"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import "../globals.css";
import { useEffect, useState, useRef } from 'react';
import { useSendTransaction , useWaitForTransactionReceipt , useAccount } from 'wagmi';
import { parseEther } from 'viem'
import Link from 'next/link';
import ClaimableRewardsButton from "../components/ClaimableRewardsButton"

export default function Listen() {
  const { isConnected } = useAccount();

  const {data: hash, sendTransaction , isPending } = useSendTransaction();
  const [totalVerified, setTotalVerified] = useState();

  useEffect(() => {
    const fetchTotalVerified = async () => {
      try {
        const response = await fetch('/api/countverifiedrecording');
        if (!response.ok) {
          throw new Error('Failed to fetch total verified recordings');
        }
        const data = await response.json();
        setTotalVerified(data.totalVerified);
      } catch (error) {
        console.error('Error fetching total verified recordings:', error);
      }
    };
  
    fetchTotalVerified();
  }, []);

  
  const handleRequestData = async () => {
    await sendTransaction({
        to: '0xd5eee4FB7F65175F3F6Fa2Da3Ca775ac43C196c1',
        value: parseEther('10'), // Ensure this is the correct amount and token
    });
    
  };
  console.log(hash)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 


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
      <div className="flex flex-col items-center justify-center space-y-4">
  <table className="table-fixed border-collapse border-2 border-black">
    <thead>
      <tr>
        <th className="border border-slate-300 text-center">Dataset Description</th>
        <th className="border border-slate-300 text-center">Number of Files</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border border-slate-300 text-center">Voice Dataset</td>
        <td className="border border-slate-300 text-center">{totalVerified}</td>
      </tr>
    </tbody>
  </table>
  <p>Requesting the dataset will cost 10 TFIL</p>

  {isConfirmed ? (
        <button onClick={() => window.location.href = '/api/downloadall'} className="px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">Download</button>
      ) : (
        <button disabled={!isConnected || isPending  || isConfirming} onClick={handleRequestData} className="px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">
          {isConfirming  ? 'Processing...' : 'Request Dataset'}
        </button>
      )}
     
    </div>
  
    </div>
    </>
  );
}
