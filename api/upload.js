// const formidable = require('formidable');
// const fs = require('fs');

exports.config = {
  api: {
    bodyParser: false,
  },
};

exports.default = async function handler(req, res) {
    // Đặt CORS headers cho tất cả mọi response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site, filename, mimetype');

    // Trả về luôn nếu là preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const site = req.headers['site'];
        const token = req.headers['authorization'];
        const contentType = req.headers['content-type'];

        console.log('req.readable', req.readable);

        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': contentType, // bắt buộc giữ nguyên content-type (multipart/form-data; boundary=...)
            },
            body: req, // forward nguyên stream
            duplex: 'half'
        });
        console.log('Headers:', req.headers);
        console.log('req.readable', req.readable);

        const data = await wpRes.json();

        if (!wpRes.ok) {
        return res.status(wpRes.status).json({ error: data.message || 'Upload thất bại' });
        }

        return res.status(200).json(data);

    } catch (error) {
        // ❗ Vẫn phải gửi header CORS ở đây nữa
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy khi upload' });
    }
}
