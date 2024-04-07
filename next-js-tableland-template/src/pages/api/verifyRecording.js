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
    const rewardTableName = "rewardtable_314159_843";

    // Use ISO string for the timestamp in the reward table
    const isoTimestamp = new Date().toISOString();

    let operations = [
      db.prepare(`INSERT INTO ${verificationTableName} (recording_id, verifier_user_id, timestamp, valid) VALUES (?, ?, ?, ?);`).bind(recording_id, verifier_user_id, new Date().getTime(), valid)
    ];

    if (valid === 1) {
      operations.push(
        db.prepare(`UPDATE ${recordingTableName} SET verified = 1 WHERE recording_id = ?;`).bind(recording_id)
      );

      // Fetch the recorder's user ID from the recording table
      const { results: recorderResults } = await db.prepare(`SELECT user_id FROM ${recordingTableName} WHERE recording_id = ?;`).bind(recording_id).all();
      if (recorderResults.length > 0) {
        const recorderUserId = recorderResults[0].user_id;

        // Reward the recorder
        operations.push(
          db.prepare(`INSERT INTO ${rewardTableName} (user_id, type, amount, claimed, timestamp) VALUES (?, ?, ?, ?, ?);`)
            .bind(recorderUserId, 'recording', 50, 0, isoTimestamp)
        );
      }

    }

    // Reward the verifier
    operations.push(
      db.prepare(`INSERT INTO ${rewardTableName} (user_id, type, amount, claimed, timestamp) VALUES (?, ?, ?, ?, ?);`)
        .bind(verifier_user_id, 'verifying', 25, 0, isoTimestamp)
    );

    // Run batch operations
    await db.batch(operations);

    res.status(200).json({ success: true, message: "Verification and reward processing completed successfully." });
  } catch (error) {
    console.error('Error processing verification and rewards:', error);
    res.status(500).json({ error: 'Failed to process verification and rewards.' });
  }
}
