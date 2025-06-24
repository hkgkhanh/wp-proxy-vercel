const { Buffer } = require('buffer');

export const config = {
    api: {
        bodyParser: true
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site, X-Filename');

    // Nếu là preflight request (OPTIONS), trả về 200 luôn
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Chỉ xử lý POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { base64 } = req.body;
        const token = req.headers['authorization'];
        const site = req.headers['site'];
        const filename = req.headers['x-filename'] || 'upload.jpg';

        console.log(base64);
        console.log(filename);

         // Parse base64
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return res.status(400).json({ error: 'Base64 không hợp lệ' });

        const mimeType = matches[1];
        const base64Data = matches[2];
        const fileBuffer = Buffer.from(base64Data, 'base64');

        console.log(fileBuffer);
        console.log('Buffer length:', fileBuffer.length);

        // Gửi file buffer lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': mimeType
            },
            body: fileBuffer,
            duplex: 'half'
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
            return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
        }

        res.status(200).json(wpData);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi server' });
    }
}
