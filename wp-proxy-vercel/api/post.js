export default async function handler(req, res) {
  // Handle preflight CORS (OPTIONS method)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Thay * bằng domain frontend nếu cần bảo mật hơn
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  // CORS headers cho các request chính (POST)
  res.setHeader('Access-Control-Allow-Origin', '*'); // hoặc thay bằng domain cụ thể
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, title, content, site } = req.body;

    if (!token || !title || !content || !site) {
      return res.status(400).json({ error: 'Thiếu token, title, content hoặc site' });
    }

    const wpResponse = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}/posts/new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        status: 'publish',
      }),
    });

    const data = await wpResponse.json();

    if (!wpResponse.ok) {
      return res.status(wpResponse.status).json({ error: data.message || 'Lỗi từ WordPress' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Lỗi proxy:', error);
    res.status(500).json({ error: 'Lỗi proxy server' });
  }
}
