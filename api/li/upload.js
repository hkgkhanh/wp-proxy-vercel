export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { base64, filename, mimeType, liAccessToken, authorUrn } = req.body;
        // const accessToken = process.env.LI_ACCESS_TOKEN;
        const accessToken = liAccessToken;
        // const userId = process.env.LI_USER_ID; // Format: urn:li:person:abc123
        const urn = authorUrn;

        // console.log(accessToken);
        // console.log(urn);

        // 1. Register upload with LinkedIn
        const registerPayload = {
        registerUploadRequest: {
            owner: urn,
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            serviceRelationships: [
            {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
            }
            ]
        }
        };

        const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerPayload)
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
        throw new Error(`Register upload failed: ${JSON.stringify(registerData)}`);
        }

        const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerData.value.asset;

        // 2. Upload image binary to LinkedIn
        const base64Data = base64.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': mimeType,
            'Content-Length': imageBuffer.length.toString()
        },
        body: imageBuffer
        });

        if (!uploadRes.ok) {
            const uploadError = await uploadRes.text();
            throw new Error(`Image upload failed: ${uploadError}`);
        }

        // 3. Return the asset URN
        res.status(200).json({ asset });
    } catch (error) {
        console.error('❌ Upload LinkedIn media error:', error.message);
        res.status(500).json({ error: error.message });
    }
}