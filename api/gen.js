exports.default = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST' });

    // const HF_TOKEN = process.env.HF_TOKEN;
    const CF_ACCID = process.env.CLOUDFLARE_ACCID;
    const CF_TOKEN = process.env.CLOUDFLARE_TOKEN;
    const model = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

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

        // console.log(CF_ACCID);
        // console.log(response);

        const contentType = response.headers.get("content-type");
        const arrayBuffer = await response.arrayBuffer();

        res.setHeader("Content-Type", contentType);
        res.status(200).send(Buffer.from(arrayBuffer));

    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: 'Lỗi proxy đến Cloudflare API' });
    }
}
