export default async function handler(req, res) {
    // Xử lý CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { token, site } = req.query;
        const buffers = [];
        req.on('data', chunk => buffers.push(chunk));
        req.on('end', async () => {
            const fileBuffer = Buffer.concat(buffers);

            const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': req.headers['content-type']
                },
                body: fileBuffer
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.message || 'Upload thất bại' });
            }

            res.status(200).json(data);
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi proxy' });
    }
}
