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
        if (!boundary) return res.status(400).json({ error: 'Missing boundary' });

        // Đọc stream
        const chunks = [];
        for await (const chunk of req) {
        chunks.push(chunk);
        }
        const bodyBuffer = Buffer.concat(chunks);

        // Tìm boundary trong buffer
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const startBoundaryIndex = bodyBuffer.indexOf(boundaryBuffer);
        const endBoundaryIndex = bodyBuffer.lastIndexOf(boundaryBuffer);

        // Tìm phần đầu và cuối của file binary
        const doubleCRLF = Buffer.from('\r\n\r\n');
        const fileStartIndex = bodyBuffer.indexOf(doubleCRLF, startBoundaryIndex) + doubleCRLF.length;
        const fileEndIndex = bodyBuffer.indexOf('\r\n--' + boundary, fileStartIndex); // kết thúc file

        if (fileStartIndex === -1 || fileEndIndex === -1) {
            return res.status(400).json({ error: 'Không xác định được vị trí binary' });
        }

        const fileBuffer = bodyBuffer.slice(fileStartIndex, fileEndIndex);

        // Upload lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Disposition': 'attachment; filename="upload.png"',
                'Content-Type': 'image/png',
            },
            body: fileBuffer,
            duplex: 'half',
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
