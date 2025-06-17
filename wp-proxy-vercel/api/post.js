export default async function handler(req, res) {
    // Xử lý CORS cho mọi request
    res.setHeader('Access-Control-Allow-Origin', 'https://legendary-train-j7qv6jp45j6fj5w7-3000.app.github.dev');
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
        const { token, title, content, site } = req.body;

        if (!token || !title || !content || !site) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/posts/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                status: 'publish'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'Đăng bài thất bại' });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy' });
    }
}
