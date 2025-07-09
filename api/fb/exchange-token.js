export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;
    const redirectUri = 'http://localhost:3000/facebook/callback';
    const clientId = process.env.FB_APP_ID;
    const clientSecret = process.env.FB_APP_SECRET;

    try {
        const fbRes = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&client_secret=${clientSecret}` +
            `&code=${code}`
        );

        const data = await fbRes.json();
        if (data.error) throw new Error(data.error.message);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}