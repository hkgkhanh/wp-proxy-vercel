// /api/x/post.js
const { TwitterApi } = require('twitter-api-v2');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { text, mediaId } = req.body;

        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });

        const result = await client.v2.tweet({
            text,
            media: mediaId ? { media_ids: [mediaId] } : undefined,
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Post X tweet error:', error);
        res.status(500).json({ error: error.message });
    }
}
