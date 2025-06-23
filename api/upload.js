export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site, X-Filename');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const token = req.headers['authorization'];
        const site = req.headers['site'];
        const contentType = req.headers['content-type'];
        const filename = req.headers['x-filename'] || 'upload.jpg';

        // Đọc raw binary từ stream
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        // Gửi file buffer lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': contentType
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
