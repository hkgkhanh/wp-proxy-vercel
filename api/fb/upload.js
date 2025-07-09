export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

    try {
        const { base64, pageId, pageAccessToken } = req.body;
        const formData = new URLSearchParams();
        formData.append('published', 'false');
        formData.append('access_token', pageAccessToken);
        formData.append('source', base64);

        const response = await fetch(`https://graph.facebook.com/v23.0/${pageId}/photos`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
        return res.status(200).json({ mediaId: data.id });
    } catch (err) {
        console.error('❌ Upload error:', err);
        return res.status(500).json({ error: err.message });
    }
}