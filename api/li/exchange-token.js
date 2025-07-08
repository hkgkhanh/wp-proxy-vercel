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

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.LI_REDIRECT_URI,
        client_id: process.env.LI_CLIENT_ID,
        client_secret: process.env.LI_CLIENT_SECRET,
    });

    try {
        const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (data.access_token) {
            res.status(200).json({ access_token: data.access_token });
        } else {
            res.status(400).json({ error: data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Token exchange failed', details: error.message });
    }
}