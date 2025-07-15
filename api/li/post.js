export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { text, assetUrn, authorUrn, liAccessToken } = req.body;
        // console.log(assetUrn);

        const postBody = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text,
                    },
                    shareMediaCategory: 'IMAGE',
                    media: [
                        {
                            status: 'READY',
                            media: assetUrn,
                        },
                    ],
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS',
            },
        };

        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${liAccessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(postBody),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ LinkedIn post error:', error);
            return res.status(response.status).json({ error });
        }

        const result = await response.json();
        // console.log('✅ LinkedIn post success:', result);

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('❌ LinkedIn post error:', error);
        res.status(500).json({ error: error.message });
    }
}