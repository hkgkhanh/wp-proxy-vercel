import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // bắt buộc để dùng formidable
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi phân tích form dữ liệu' });
    }

    const token = fields.token?.[0];
    const site = fields.site?.[0];
    const file = files.image?.[0];

    if (!token || !site || !file) {
      return res.status(400).json({ error: 'Thiếu dữ liệu cần thiết' });
    }

    const fileBuffer = await file.toBuffer();
    const fileName = file.originalFilename;
    const mimeType = file.mimetype;

    try {
      const uploadRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/media/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': mimeType,
        },
        body: fileBuffer,
      });

      const data = await uploadRes.json();

      if (!uploadRes.ok) {
        return res.status(uploadRes.status).json({ error: data.message || 'Upload thất bại' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Lỗi máy chủ proxy khi upload' });
    }
  });
}
