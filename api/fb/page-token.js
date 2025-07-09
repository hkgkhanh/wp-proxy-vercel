export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

    try {
        const { fbAccessToken } = req.body;
        const response = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${fbAccessToken}`);
        const data = await response.json();

        if (!response.ok || !data.data || data.data.length === 0) {
            throw new Error('Failed to retrieve Facebook Pages');
        }

        const page = data.data[0];
        return res.status(200).json({ pageId: page.id, pageAccessToken: page.access_token });
    } catch (err) {
        console.error('❌ Error fetching Facebook Page token:', err);
        return res.status(500).json({ error: err.message });
    }
}