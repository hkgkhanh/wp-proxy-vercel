export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site');
        return res.status(200).end();
    }

    try {
        const site = req.headers['site'];
        const token = req.headers['authorization'];
        const contentType = req.headers['content-type'];

        // Đọc toàn bộ stream vào buffer
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const bodyBuffer = Buffer.concat(chunks);

        // Trích file nhúng trong multipart/form-data
        const boundary = contentType.split('boundary=')[1];
        const parts = bodyBuffer.toString().split(`--${boundary}`);

        // Tìm phần có binary
        const filePart = parts.find(p => p.includes('Content-Disposition') && p.includes('filename='));
        if (!filePart) return res.status(400).json({ error: 'Không tìm thấy file' });

        const binaryStart = filePart.indexOf('\r\n\r\n') + 4;
        const binaryEnd = filePart.lastIndexOf('\r\n');
        const fileBuffer = Buffer.from(filePart.slice(binaryStart, binaryEnd), 'binary');

        // Upload lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
        method: 'POST',
        headers: {
            Authorization: token,
            'Content-Disposition': 'attachment; filename="upload.png"',
            'Content-Type': 'image/png', // Bạn có thể cải tiến đoạn này để tự detect type
        },
        body: fileBuffer,
        duplex: 'half',
        });

        const wpData = await wpRes.json();
        console.log(wpData);
        if (!wpRes.ok) {
            return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
        }

        return res.status(200).json(wpData);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Lỗi server' });
    }
}
