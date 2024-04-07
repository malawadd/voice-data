// pages/api/countVerifiedRecordings.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const recordingTableName = "recordingtable_314159_839";

    // Query to count the verified recordings
    const query = `SELECT COUNT(*) AS verified_count FROM ${recordingTableName} WHERE verified = 1;`;
    const { results } = await db.prepare(query).all();

    if (results.length === 0) {
      return res.status(404).json({ error: "No data found." });
    }

    // Respond with the total count of verified recordings
    const totalVerified = results[0].verified_count;
    res.status(200).json({ totalVerified });
  } catch (error) {
    console.error('Error fetching count of verified recordings:', error);
    res.status(500).json({ error: 'Failed to fetch total count of verified recordings.' });
  }
}
