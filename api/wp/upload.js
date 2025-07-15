const { Buffer } = require('buffer');
const crypto = require('crypto');

export const config = {
    api: {
        bodyParser: true
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, site, X-Filename');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { post_token, base64, filename = 'upload.jpg', mimeType = 'image/jpeg', title, content } = req.body;
        const token = req.headers['authorization'];
        const site = req.headers['site'];

        const timestamp = Date.now();
        const dotIndex = filename.lastIndexOf('.');
        const name = filename.substring(0, dotIndex);
        const ext = filename.substring(dotIndex);
        const hashedFilename = `${name}_${timestamp}${ext}`;

        // Tách base64 nếu là data URL
        const base64Data = base64.split(',')[1]; // bỏ phần "data:image/jpeg;base64,..."
        const fileBuffer = Buffer.from(base64Data, 'base64');

        // Tạo multipart body thủ công
        const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

        const multipartBody = Buffer.concat([
            Buffer.from(`--${boundary}\r\n`),
            Buffer.from(`Content-Disposition: form-data; name="media[]"; filename="${filename}"\r\n`),
            Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`),
            fileBuffer,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);

        // Gửi file buffer lên WordPress
        const wpRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
            },
            body: multipartBody,
            duplex: 'half'
        });

        const wpData = await wpRes.json();
        // console.log(wpData);

        if (!wpRes.ok) {
            return res.status(wpRes.status).json({ error: wpData.message || 'Upload thất bại' });
        }

        if (title == "" && content == "") {
            return res.status(200).json(wpData)
        }

        const imageUrl = wpData.media[0].URL;
        const finalContent = imageUrl
            ? content.replace('[image_insert_here]', `![Image](${imageUrl})`)
            : content;


        const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/posts/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${post_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content: finalContent,
                status: 'publish'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'Đăng bài thất bại' });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi server' });
    }
}
