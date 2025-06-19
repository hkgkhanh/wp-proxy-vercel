export default async function handler(req, res) {
    // Xử lý CORS cho mọi request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Nếu là preflight request (OPTIONS), trả về 200 luôn
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Chỉ xử lý POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { token, site, filename, mimeType } = req.headers;

        if (!token || !site || !filename || !mimeType) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc trong headers' });
        }

        const buffers = [];
        req.on('data', chunk => buffers.push(chunk));
        req.on('end', async () => {
            const fileBuffer = Buffer.concat(buffers);

            const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Type': mimeType
                },
                body: fileBuffer
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.message || 'Upload thất bại' });
            }

            return res.status(200).json(data);
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy khi upload' });
    }
}
