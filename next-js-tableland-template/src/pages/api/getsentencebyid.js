// src/app/api/getSentenceById/route.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
    const { sentence_id } = req.body;

  if (!sentence_id) {
    return res.status(400).send({ error: 'Sentence ID is required.' });
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
    const signer = wallet.connect(provider);

    // Connect to the database
    const db = new Database({ signer });
    const sentenceTableName = "sentencetable_314159_838";

    // Query to fetch the sentence for the given sentence_id
    const sentenceStmt = db.prepare(
      `SELECT * FROM ${sentenceTableName} WHERE sentence_id = ?;`
    );
    const sentenceResult = await sentenceStmt.bind(sentence_id).all();

    if (sentenceResult.results.length === 0) {
      return res.status(404).json({ error: "Sentence not found." });
    }

    // Respond with the fetched sentence
    res.status(200).json(sentenceResult.results[0].sentence_text);
  } catch (error) {
    console.error('Error fetching sentence:', error);
    res.status(500).json({ error: 'Failed to fetch sentence.' });
  }
}
