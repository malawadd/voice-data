// pages/api/claimReward.js
import { ethers, Wallet } from 'ethers';
import { Database } from "@tableland/sdk";

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0xd5eee4FB7F65175F3F6Fa2Da3Ca775ac43C196c1';

async function zeroRewards(address, signer) {
    const db = new Database({ signer });
    const tableName = "rewardtable_314159_843";
    // Prepare and execute the delete operation
    await db.prepare(`DELETE FROM ${tableName} WHERE user_id = ?;`).bind(address).run();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { totalReward, address } = req.body;
  
  if (!totalReward || !address) {
    return res.status(400).json({ error: 'Total reward and address are required.' });
  }

  try {
    // Ensure these values are securely managed and not hard-coded
    const privateKey = process.env.TABLELAND_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Zero out rewards first
    await zeroRewards(address, signer);

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Convert totalReward to Wei
    const totalRewardInWei = ethers.utils.parseEther(totalReward.toString());

    // Execute the contract's `claimReward` function
    const tx = await contract.claimReward(address, totalRewardInWei);
    const receipt = await tx.wait();

    console.log('Transaction receipt:', receipt);
    res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Failed to claim reward.' });
  }
}
