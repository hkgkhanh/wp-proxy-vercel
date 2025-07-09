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

    const { liAccessToken } = req.body;
    console.log(liAccessToken);

    try {
        const response = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${liAccessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            return res.status(response.status).json({ error: data });
        }

        const urn = `urn:li:person:${data.id}`;
        res.status(200).json({ urn });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch LinkedIn profile', details: err.message });
    }
}
