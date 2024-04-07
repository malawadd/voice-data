// pages/api/downloadAll.js
import axios from 'axios';
import archiver from 'archiver';
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const privateKey = process.env.TABLELAND_PRIVATE_KEY; // Ensure this is securely set in your environment variables
        const wallet = new Wallet(privateKey);
  
        const provider = new ethers.providers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
        const signer = wallet.connect(provider);
  
        // Connect to the database
        const db = new Database({ signer });
    const tableName = "recordingtable_314159_839";

    // Query verified recordings
    const { results: recordings } = await db.prepare(`SELECT * FROM ${tableName} WHERE verified = 1;`).all();

    // Set headers for zip download
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=recordings.zip',
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const recording of recordings) {
      const { data: fileStream } = await axios({
        method: 'get',
        url: recording.ipfshash,
        responseType: 'stream',
      });
      archive.append(fileStream, { name: `${recording.recording_id}.ogg` }); // Assuming .ogg format; adjust as needed
    }

    archive.finalize();
  } catch (error) {
    console.error('Failed to download and zip recordings:', error);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
}
