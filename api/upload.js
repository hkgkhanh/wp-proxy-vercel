export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const token = req.headers['authorization'];
        const site = req.headers['site'];
        const contentType = req.headers['content-type'];

        const boundary = contentType.split('boundary=')[1];
        if (!boundary) return res.status(400).json({ error: 'Không tìm thấy boundary' });

        // Bước 1: Đọc toàn bộ stream
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const bodyBuffer = Buffer.concat(chunks);
        console.log(bodyBuffer.toString());

        // Bước 2: Tách phần chứa file
        const parts = bodyBuffer
        .toString('latin1') // giữ nguyên byte, không bị UTF-8 hóa
        .split(`--${boundary}`)
        .filter(part => part.includes('Content-Disposition') && part.includes('filename='));

        if (parts.length === 0) {
        return res.status(400).json({ error: 'No file part found' });
        }

        const filePart = parts[0];

        const binaryStart = filePart.indexOf('\r\n\r\n') + 4;
        const binaryEnd = filePart.lastIndexOf('\r\n');
        const binaryContent = filePart.slice(binaryStart, binaryEnd);

        // Bước 3: Convert lại thành Buffer đúng
        const binaryBuffer = Buffer.from(binaryContent, 'latin1');

        // Bước 4: Gửi lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Disposition': 'attachment; filename="upload.png"',
                'Content-Type': 'image/png',
            },
            body: binaryBuffer,
            duplex: 'half',
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
        return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
        }

        res.status(200).json(wpData);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi proxy server' });
    }
}
