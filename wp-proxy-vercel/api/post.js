import wpcomFactory from 'wpcom';  // hoặc dùng fetch tới WordPress API nếu bạn đã cài wpcomFactory

export default async function handler(req, res) {
  // Phản hồi CORS cho mọi request (bao gồm POST và OPTIONS)
  res.setHeader('Access-Control-Allow-Origin', 'https://legendary-train-j7qv6jp45j6fj5w7-3000.app.github.dev');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Chỉ xử lý OPTIONS pre-flight
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, content, site } = req.body;
  if (!token || !title || !content || !site) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  try {
    const wpcom = wpcomFactory(token);
    const post = await new Promise((resolve, reject) => {
      wpcom.req.post(`/sites/${site}/posts/new`, { title, content, status: 'publish' }, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
