// pages/api/zeroReward.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required.' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY; 
    const wallet = new Wallet(privateKey);
    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const tableName = "rewardtable_314159_843";

    // Prepare and execute the delete operation
    const deleteStmt = `DELETE FROM ${tableName} WHERE user_id = ?;`;
    await db.prepare(deleteStmt).bind(address).run();

    res.status(200).json({ success: true, message: 'Rewards successfully zeroed out.' });
  } catch (error) {
    console.error('Error zeroing out rewards:', error);
    res.status(500).json({ error: 'Failed to zero out rewards.' });
  }
}
