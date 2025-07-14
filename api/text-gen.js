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

    const system_message = "You are a professional blog writer and SEO expert.\n" +
    "Input: a title for a blog and some SEO keywords, separated by commas.\n" +
    "Output in the following format:\n" +
    "<content>\n" +
    "The content of the blog about the topic based on the given title and SEO keywords. The tone of the content is professional and intriguing and each argument should be developed thoroughly. Make sure that the content should be less than 3000 characters.\n" +
    "You must also choose a position within the content (inside the <content> only, not in the summary tag or sdprompt tag) to add the following string and only this string to specify the position of the image which will be added to the final post, not including the image file name or image text placeholder or anything else: [image_insert_here]\n" +
    "</content>\n" +
    "<summary>\n" +
    "One sentence of less than 180 characters (this is a must) that summarizes the content of the blog that you have just generated. The tone of the sentence is professional and intriguing.\n" +
    "</summary>\n" +
    "<sdprompt>\n" +
    "A prompt to generate an image using Stable Diffusion model based on the content of the blog that you have just generated.\n" +
    "</sdprompt>\n\n" +
    "You must make sure that for each content of your output, it is consisted of only the content required in the format above, no extra signs or symbols are allowed.";
    // console.log(req.body.prompt);

    // const HF_TOKEN = process.env.HF_TOKEN;
    const CF_ACCID = process.env.CLOUDFLARE_ACCID;
    const CF_TOKEN = process.env.CLOUDFLARE_TOKEN;
    const model = "@cf/openchat/openchat-3.5-0106";

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
                ],
                max_tokens: 2048
            })
        });

        const responseData = await response.json();

        // console.log(CF_ACCID);
        // console.log(responseData);

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
