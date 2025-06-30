exports.default = async function handler(req, res) {
    // Xử lý CORS cho mọi request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Nếu là preflight request (CORS OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
    }

    // const HF_TOKEN = process.env.HF_TOKEN;
    const CF_ACCID = process.env.CLOUDFLARE_ACCID;
    const CF_TOKEN = process.env.CLOUDFLARE_TOKEN;
    const model = "@cf/lykon/dreamshaper-8-lcm";

    const MODEL_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCID}/ai/run/${model}`; // hoặc model khác

    try {
        const response = await fetch(MODEL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CF_TOKEN}`,
            },
            // body: JSON.stringify({
            //     inputs: req.body.prompt || "a robot dancing in the rain",
            //     options: { wait_for_model: true },
            // }),
            body: JSON.stringify({
                prompt: req.body.prompt || "A robot dancing in the rain"
            })
        });

        console.log(CF_ACCID);
        console.log(response);

        const contentType = response.headers.get('content-type');

        // if (contentType && contentType.includes('application/json')) {
        //     const json = await hfRes.json();
        //     return res.status(hfRes.status).json(json);
        // } else {
        //     const blob = await hfRes.blob();
        //     res.setHeader("Content-Type", "image/png");
        //     blob.arrayBuffer().then((buffer) => {
        //         res.status(200).send(Buffer.from(buffer));
        //     });
        // }

    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: 'Lỗi proxy đến Cloudflare API' });
    }
}
