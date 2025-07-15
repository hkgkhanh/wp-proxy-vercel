exports.default = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { token } = req.body;
        console.log(token);

        if (!token) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/me/sites`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'Get pages failed' });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy' });
    }
}
