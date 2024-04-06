

// sentencetable_314159_838

// create table sentencetable_314159 (sentence_id integer primary key unique, sentence_text text, language text);
// a8f3938de8e9a54b6d7f008c0c00165235feb4d8858aca80c50053af491d98be

import { Database } from "@tableland/sdk";
import { Wallet, getDefaultProvider,ethers  } from "ethers";
import {NextRequest, NextResponse} from "next/server";




export default async function POST(req, res) {
    
      // Extract sentence and language from the request body
      const { sentence, language } = req.body;
      if (!sentence || !language) {
        return res.status(400).send({ error: 'Sentence and language are required' });
      }

      console.log("hi")
  
      try {
        const privateKey = process.env.TABLELAND_PRIVATE_KEY; // Ensure this is securely set in your environment variables
        const wallet = new Wallet(privateKey);
  
        const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
        const signer = wallet.connect(provider);
  
        // Connect to the database
        const db = new Database({ signer });
        const tableName = "sentencetable_314159_838";
  
        // Insert the sentence into the table. Assuming auto-increment is handled by the table itself or another mechanism.
        const insertQuery = `INSERT INTO ${tableName} (sentence_text, language) VALUES (?, ?);`;
        const { meta: insertMeta } = await db.prepare(insertQuery).bind(sentence, language).run();
  
        // Wait for transaction finality
        await insertMeta.txn?.wait();

        console.log("iserted something ")

        
        const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all();
        console.log(results);
  
        // Respond with success
        res.status(200).json({ success: true, message: "Sentence added successfully" });
      } catch (error) {
        console.error('Error inserting sentence:', error);
        res.status(500).json({ error: 'Failed to add sentence to the database' });
      }
  
  }
