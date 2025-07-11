const { TwitterApi } = require('twitter-api-v2');
import { getSecret, deleteSecret } from '../../lib/tokenStore';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { oauth_token, oauth_verifier } = req.body;
    const oauth_token_secret = getSecret(oauth_token);

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        return res.status(400).json({ error: 'Missing or invalid oauth_token or secret' });
    }

    try {
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: oauth_token,
            accessSecret: oauth_token_secret,
        });

        const { accessToken, accessSecret, screenName, userId } = await client.login(oauth_verifier);

        // Optional cleanup
        deleteSecret(oauth_token);

        res.status(200).json({ accessToken, accessSecret, screenName, userId });

    } catch (error) {
        console.error('❌ Log into X error:', error);
        res.status(500).json({ error: error.message });
    }
}