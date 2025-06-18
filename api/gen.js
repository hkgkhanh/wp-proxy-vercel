export default async function handler(req, res) {
    // Xử lý CORS cho mọi request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
        return;
    }

    const body = await req.json();
    try {
        const ollamaRes = await fetch("http://172.17.5.145:4000/api/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!ollamaRes.ok) {
            const err = await ollamaRes.text();
            res.status(500).json({ error: 'Ollama lỗi: ' + err });
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value));
        }
        res.end();
    } catch (e) {
        console.error('Stream proxy lỗi:', e);
        res.status(500).json({ error: e.message });
    }
}