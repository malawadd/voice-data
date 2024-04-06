// src/app/api/verifyRecording/route.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
  const { recording_id, verifier_user_id, valid } = req.body;

  // Basic validation
  if (!recording_id || !verifier_user_id || valid === undefined) {
    return res.status(400).send({ error: 'Recording ID, Verifier User ID, and Valid status are required.' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY; 
    const wallet = new Wallet(privateKey);
    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const verificationTableName = "verificationtable_314159_845";
    const recordingTableName = "recordingtable_314159_839";

    // Use the current timestamp
    const timestamp = new Date().getTime();
    let operations = [
      db.prepare(`INSERT INTO ${verificationTableName} (recording_id, verifier_user_id, timestamp, valid) VALUES (?, ?, ?, ?);`).bind(recording_id, verifier_user_id, timestamp, valid)
    ];

    // If the validation is positive, update the recording's verified status as well
    if (valid === 1) {
      operations.push(
        db.prepare(`UPDATE ${recordingTableName} SET verified = 1 WHERE recording_id = ?;`).bind(recording_id)
      );
    }

    // Run batch operations
    await db.batch(operations);
    const { results } = await db.prepare(`SELECT * FROM ${verificationTableName};`).all();
        console.log(results);
        const { results2 } = await db.prepare(`SELECT * FROM ${recordingTableName};`).all();
        console.log(results2);


    // Respond with success
    res.status(200).json({ success: true, message: "Verification recorded successfully." });
  } catch (error) {
    console.error('Error processing verification:', error);
    res.status(500).json({ error: 'Failed to process verification.' });
  }
}
