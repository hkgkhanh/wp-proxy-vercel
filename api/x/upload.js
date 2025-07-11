// /api/x/upload.js
const { TwitterApi } = require('twitter-api-v2');
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { base64, filename, mimeType, accessToken } = req.body;
        const accessSecret = await redis.get(`twitter_access_secret:${accessToken}`);

        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessToken,
            accessSecret: accessSecret,
        });

        // Strip "data:image/jpeg;base64," etc. part
        const base64Data = base64.split(',')[1];

        const mediaId = await client.v1.uploadMedia(Buffer.from(base64Data, 'base64'), {
            mimeType
        });

        res.status(200).json({ mediaId });
    } catch (error) {
        console.error('❌ Upload X media error:', error);
        res.status(500).json({ error: error.message });
    }
}
