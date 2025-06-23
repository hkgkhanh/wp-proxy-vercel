const formidable = require('formidable');
const fs = require('fs');

exports.config = {
    api: {
        bodyParser: false, // disable default body parser
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
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.status(500).json({ error: 'Lỗi khi parse form data' });
                return;
            }

            const site = req.headers['site'];
            const token = req.headers['authorization'];

            const file = files.file[0];

            const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
                    'Content-Type': file.mimetype,
                },
                body: fs.createReadStream(file.filepath),
            });

            const wpData = await wpRes.json();

            if (!wpRes.ok) {
                res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
                return;
            }

            res.status(200).json(wpData);
        });

    } catch (error) {
        // ❗ Vẫn phải gửi header CORS ở đây nữa
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy khi upload' });
    }
}
