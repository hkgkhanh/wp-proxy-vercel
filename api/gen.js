export default async function handler(req, res) {
    // Xử lý CORS cho mọi request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
        return;
    }

    const OLLAMA_URL = 'https://ollama-khanh.loca.lt';

    try {
        const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Nếu Ollama yêu cầu thêm headers khác, thêm ở đây
        },
        body: JSON.stringify(req.body),
        });

        const data = await ollamaRes.json();

        // Trả kết quả lại cho frontend
        res.status(ollamaRes.status).json(data);
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Lỗi kết nối tới Ollama server' });
    }
}