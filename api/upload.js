export const config = {
    api: {
        bodyParser: false, // tắt để xử lý FormData thủ công
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(400).json({ error: 'Thiếu token' });
    }

    // Thu thập body raw (form-data)
    const buffers = [];
    req.on('data', (chunk) => buffers.push(chunk));
    req.on('end', async () => {
        const formDataBody = Buffer.concat(buffers);

        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${req.headers['site']}/media/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': req.headers['content-type'], // giữ nguyên content-type form-data
            },
            body: formDataBody
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
            return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
        }

        return res.status(200).json(wpData);
    });
}
