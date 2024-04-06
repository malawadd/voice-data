// src/app/api/rewards/route.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
  const { user_id, type } = req.body;

  
  if (!user_id || !type || (type !== 'recording' && type !== 'verifying')) {
    return res.status(400).send({ error: 'User ID and valid type (recording or verifying) are required.' });
  }

  // Set the amount based on the type those are 0.5 and 0.2
  const amount = type === 'recording' ? 50 : (type === 'verifying' ? 25 : 0);
  
  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY; 
    const wallet = new Wallet(privateKey);

    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const rewardTableName = "rewardtable_314159_843";

    // Use the current timestamp
    const timestamp = new Date().toISOString();

    // Insert the reward into the table
    const insertQuery = `INSERT INTO ${rewardTableName} (user_id, type, amount, claimed, timestamp) VALUES (?, ?, ?, ?, ?);`;
    const { meta: insertMeta } = await db.prepare(insertQuery).bind(user_id, type, amount, 0, timestamp).run();

    await insertMeta.txn?.wait();

    const { results } = await db.prepare(`SELECT * FROM ${rewardTableName};`).all();
        console.log(results);

    // Respond with success
    res.status(200).json({ success: true, message: "Reward added successfully." });
  } catch (error) {
    console.error('Error inserting reward:', error);
    res.status(500).json({ error: 'Failed to add reward to the database.' });
  }
}
