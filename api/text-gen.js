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

    const system_message = "You are a professional blog writer and SEO expert. Given a blog title and a list of SEO keywords, generate a full, well-structured blog post (maximum 3000 characters) with a compelling introduction, informative body using H2/H3 subheadings, and a strong conclusion. Naturally incorporate all keywords without stuffing, write in a conversational yet authoritative tone, and optimize the content for both search engines and human readers. Respond with the complete blog content only, with no extra commentary. More specific title, SEO keywords, and further instruction will be provided by the user.";
    console.log(req.body.prompt);

    // const HF_TOKEN = process.env.HF_TOKEN;
    const CF_ACCID = process.env.CLOUDFLARE_ACCID;
    const CF_TOKEN = process.env.CLOUDFLARE_TOKEN;
    const model = "@cf/mistral/mistral-7b-instruct-v0.2-lora";

    const MODEL_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCID}/ai/run/${model}`; // hoặc model khác

    try {
        const response = await fetch(MODEL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CF_TOKEN}`,
            },
            body: JSON.stringify({
                "messages": [
                    { "role": "system", "content": system_message },
                    { "role": "user", "content": req.body.prompt }
                ]
            })
        });

        const responseData = await response.json();

        // console.log(CF_ACCID);
        console.log(responseData);

        if (responseData.result.response) {
            res.status(200).json({ response: responseData.result.response });
        } else {
            res.status(400).json({ responseData });
        }

    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: 'Lỗi proxy đến Cloudflare API' });
    }
}
