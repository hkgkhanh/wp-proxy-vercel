export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

    try {
        const { message, link, pageId, pageAccessToken, mediaId } = req.body;

        let params = new URLSearchParams();
        params.append('message', message);
        params.append('access_token', pageAccessToken);

        if (mediaId) {
            params.append('attached_media[0]', JSON.stringify({ media_fbid: mediaId }));
        }
        if (link) {
            params.append('link', link);
        }

        const response = await fetch(`https://graph.facebook.com/v23.0/${pageId}/feed`, {
            method: 'POST',
            body: params
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Post failed');
        return res.status(200).json(data);
    } catch (err) {
        console.error('❌ Facebook post error:', err);
        return res.status(500).json({ error: err.message });
    }
}