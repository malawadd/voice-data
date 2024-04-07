// src/app/api/getTotalRewards/route.js
import { Database } from "@tableland/sdk";
import { Wallet, ethers } from "ethers";

export default async function POST(req, res) {
    const { user_id, type } = req.body;

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
    const rewardTableName = "rewardtable_314159_843";

    // Query to sum up the rewards for the given user, converting to decimal format
    const rewardsSumStmt = db.prepare(
      `SELECT SUM(amount) as total_rewards FROM ${rewardTableName} WHERE user_id = ? AND claimed = 0;`
    );
    const rewardsSumResults = await rewardsSumStmt.bind(user_id).all();

    if (rewardsSumResults.results.length === 0 || rewardsSumResults.results[0].total_rewards === null) {
      return res.status(404).json({ totalRewards: 0 });
    }

    const totalRewardsInDecimal = rewardsSumResults.results[0].total_rewards / 100; // Convert from smallest unit to decimal

    // Respond with the total rewards in a readable format
    res.status(200).json({ totalRewards: totalRewardsInDecimal });
  } catch (error) {
    console.error('Error fetching total rewards:', error);
    res.status(500).json({ error: 'Failed to fetch total rewards.' });
  }
}
