
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
  const { sentence_id, user_id, ipfshash } = req.body;

  // Basic validation
  if (!sentence_id || !user_id || !ipfshash) {
    return res.status(400).send({ error: 'Sentence ID, User ID, and IPFS hash are required.' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY; 
    const wallet = new Wallet(privateKey);

    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const tableName = "recordingtable_314159_839";

    // Use the current timestamp
    const timestamp = new Date().toISOString();

    // Insert the recording into the table
    const insertQuery = `INSERT INTO ${tableName} (sentence_id, user_id, ipfshash, timestamp, verified) VALUES (?, ?, ?, ?, ?);`;
    const { meta: insertMeta } = await db.prepare(insertQuery).bind(sentence_id, user_id, ipfshash, timestamp, 0).run();

    // Wait for transaction finality
    await insertMeta.txn?.wait();

    const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all();
        console.log(results);

    // Respond with success
    res.status(200).json({ success: true, message: "Recording added successfully." });
  } catch (error) {
    console.error('Error inserting recording:', error);
    res.status(500).json({ error: 'Failed to add recording to the database.' });
  }
}
