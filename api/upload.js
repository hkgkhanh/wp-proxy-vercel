export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, site, filename, mimeType'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const site = req.headers['site'];
        const filename = req.headers['filename'];
        const mimeType = req.headers['mimetype'];

        if (!token || !site || !filename || !mimeType) {
            return res.status(400).json({ error: 'Thiếu thông tin trong headers' });
        }

        const buffers = [];
        req.on('data', (chunk) => buffers.push(chunk));
        req.on('end', async () => {
            const fileBuffer = Buffer.concat(buffers);

            const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Type': mimeType
                },
                body: fileBuffer
            });

            const wpData = await wpRes.json();

            if (!wpRes.ok) {
                return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
            }

            return res.status(200).json(wpData);
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy khi upload' });
    }
}
