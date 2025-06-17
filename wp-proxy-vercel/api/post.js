// api/post.js

import wpcomFactory from 'wpcom';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { token, title, content } = req.body;

    if (!token || !title || !content) {
        return res.status(400).json({ error: 'Missing token, title, or content' });
    }

    try {
        const wpcom = wpcomFactory(token);

        const me = await wpcom.me();
        const site = me.primary_blog || 'khanhllm.wordpress.com';

        const post = await wpcom.req.post(`/sites/${site}/posts/new`, {
            title,
            content,
            status: 'publish'
        });

        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json({ error: err.message || err });
    }
}
