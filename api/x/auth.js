const { TwitterApi } = require('twitter-api-v2');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { callback_url } = req.body;

    try {
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
        });

        const authLink = await client.generateAuthLink(callback_url);
        const authUrl = authLink.url;

        console.log(authUrl);
        res.status(200).json({ authLink });

    } catch (error) {
        console.error('❌ Log into X error:', error);
        res.status(500).json({ error: error.message });
    }
}