import wpcomFactory from 'wpcom';

export default async function handler(req, res) {
    // Cấu hình CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // hoặc chỉ định domain cụ thể thay vì '*'
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Xử lý preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, title, content, site } = req.body;

    if (!token || !title || !content || !site) {
        return res.status(400).json({ error: 'Thiếu dữ liệu gửi lên' });
    }

    try {
        const wpcom = wpcomFactory(token);

        const post = await wpcom
            .site(site)
            .request({
                method: 'POST',
                path: `/posts/new`,
                body: {
                    title,
                    content,
                    status: 'publish',
                },
            });

        res.status(200).json(post);
    } catch (error) {
        console.error('Lỗi khi đăng bài:', error);
        res.status(500).json({ error: 'Lỗi đăng bài lên WordPress' });
    }
}
