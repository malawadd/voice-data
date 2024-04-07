// src/app/api/getUniqueSentence/route.js
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
    const sentenceTableName = "sentencetable_314159_838";

    // Query for sentences already recorded by the user
    const recordedSentencesStmt = db.prepare(`SELECT sentence_id FROM ${recordingTableName} WHERE user_id = ?;`);
    const recordedSentencesResults = await recordedSentencesStmt.bind(user_id).all();
    const recordedSentenceIds = recordedSentencesResults.results.map(row => row.sentence_id);

    // Query for all sentences
    const allSentencesStmt = db.prepare(`SELECT * FROM ${sentenceTableName};`);
    const allSentencesResults = await allSentencesStmt.all();

    // Filter out sentences that have already been recorded by the user
    const availableSentences = allSentencesResults.results.filter(sentence => !recordedSentenceIds.includes(sentence.sentence_id));

    if (availableSentences.length === 0) {
      return res.status(404).json({ error: "No more sentences to record." });
    }

    // Select a random sentence from the available ones
    const randomIndex = Math.floor(Math.random() * availableSentences.length);
    const selectedSentence = availableSentences[randomIndex];

    // Respond with the selected sentence
    res.status(200).json(selectedSentence);
  } catch (error) {
    console.error('Error fetching unique sentence:', error);
    res.status(500).json({ error: 'Failed to fetch a unique sentence.' });
  }
}
