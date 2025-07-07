// /api/x/upload.js
const { TwitterApi } = require('twitter-api-v2');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { base64, filename, mimeType } = req.body;

        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
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
