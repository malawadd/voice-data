// src/app/api/getRecordingToVerify/route.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).send({ error: 'User ID is required.' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const recordingTableName = "recordingtable_314159_839";
    const verificationTableName = "verificationtable_314159_845";

    // Query for recordings not made by the user
    const availableRecordingsStmt = db.prepare(
      `SELECT * FROM ${recordingTableName} WHERE user_id != ? AND recording_id NOT IN (
        SELECT recording_id FROM ${verificationTableName} WHERE verifier_user_id = ?
      );`
    );
    const availableRecordingsResults = await availableRecordingsStmt.bind(user_id, user_id).all();

    if (availableRecordingsResults.results.length === 0) {
      return res.status(404).json({ error: "No recordings available for verification." });
    }

    // Select a random recording from the available ones
    const randomIndex = Math.floor(Math.random() * availableRecordingsResults.results.length);
    const selectedRecording = availableRecordingsResults.results[randomIndex];

    // Respond with the selected recording
    res.status(200).json(selectedRecording.ipfshash);
  } catch (error) {
    console.error('Error fetching recording for verification:', error);
    res.status(500).json({ error: 'Failed to fetch a recording for verification.' });
  }
}
