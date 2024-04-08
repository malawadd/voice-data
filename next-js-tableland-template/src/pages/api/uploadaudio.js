// pages/api/uploadAudio.js
const formidable = require('formidable');
import fleek from '@fleekhq/fleek-storage-js';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable the default bodyParser to use formidable
  },
};

// const uploadFileToFleek = async (file) => {
//   const apiKey = process.env.FLEEK_API_KEY;
//   const apiSecret = process.env.FLEEK_API_SECRET;
//   console.log("this is the file",file)
//   const randomFilename = `${randomBytes(16).toString('hex')}-${file.name}`;


//   const input = {
//     apiKey,
//     apiSecret,
//     key: `audio-uploads/${randomFilename}.ogg`, // You might want to customize the file naming
//     data: file.newFilename,
//   };

//   const result = await fleek.upload(input);
//   return result;
// };

const form = new formidable.IncomingForm();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({ error: 'Error parsing the file upload' });
          return;
        }
        
        try {
          // Read the file from the temporary path
          console.log("this is file",fs.readFile(files.audio[0].filepath))
          const fileData = await fs.readFile(files.audio[0].filepath);
          console.log("this is ittttttttttttttttt",fileData)
          
          // Set up Fleek Storage input
          const input = {
            apiKey: process.env.FLEEK_API_KEY,
            apiSecret: process.env.FLEEK_API_SECRET,
            key: `audio-uploads/${files.audio[0].originalFilename}`, // Customize your file path/key as needed
            data: fileData,
          };
    
          // Upload to Fleek
          const result = await fleek.upload(input);
    
          // Respond with the result from Fleek (contains IPFS hash, public URL, etc.)
          res.status(200).json(result.publicUrl);
        } catch (uploadError) {
          console.error('Upload to Fleek failed:', uploadError);
          res.status(500).json({ error: 'Failed to upload file to Fleek' });
        }
      });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
