import wpcomFactory from 'wpcom';

export default async function handler(req, res) {
  // ✅ Set CORS headers cho tất cả các request
  res.setHeader('Access-Control-Allow-Origin', 'https://legendary-train-j7qv6jp45j6fj5w7-3000.app.github.dev');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Trả về 200 cho preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ❌ Nếu không phải POST, trả về lỗi
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ Xử lý POST
  const { token, title, content, site } = req.body;

  if (!token || !title || !content || !site) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const wpcom = wpcomFactory(token);

    const post = await new Promise((resolve, reject) => {
      wpcom.req.post(
        `/sites/${site}/posts/new`,
        { title, content, status: 'publish' },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error('Lỗi proxy:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
}
