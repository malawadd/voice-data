"use client"
import React, { useState, useEffect } from 'react';
import { useSigner } from '@/hooks/useSigner'; 

const ClaimableRewardsButton = () => {
  const [rewards, setRewards] = useState(0);
  const signer = useSigner();
  const [isClaiming, setIsClaiming] = useState(false); 


  useEffect(() => {
    const fetchRewards = async () => {
      if (!signer) return;

      const signerAddress =  await signer.getAddress();
      try {
        const response = await fetch('/api/gettotalrewards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: signerAddress
            }),
          });
        if (!response.ok) {
          throw new Error('Failed to fetch rewards');
        }
        const data = await response.json();
        setRewards(data.totalRewards); 
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };

    fetchRewards();
  }, [signer]);

  const handleClaimRewards = async () => {
    if (!signer || isClaiming) return;

    setIsClaiming(true); 
    const signerAddress = await signer.getAddress();
    try {
      const response = await fetch('/api/claimreward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalReward: rewards,
          address: signerAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim rewards');
      }
      // Handle successful claim here, perhaps reset rewards or provide feedback
      console.log('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaiming(false); 
    }
  };

  return (
    <button onClick={handleClaimRewards} disabled={rewards <= 0 || isClaiming} className="text-lg px-3 py-2px-4 py-2 border-2 border-black bg-white text-black rounded flex-grow mx-2 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200">
      {isClaiming ? 'Claiming...' : `Claimable Reward: ${rewards} tFIL`}
    </button>
  );
};

export default ClaimableRewardsButton;
