// /api/linkedin/upload.js

import axios from 'axios';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { base64, filename, mimeType } = req.body;
        const accessToken = process.env.LI_ACCESS_TOKEN;
        const userId = process.env.LI_USER_ID; // should be like: "urn:li:person:abc123"

        // 1. Register upload with LinkedIn
        const registerRes = await axios.post(
            'https://api.linkedin.com/v2/assets?action=registerUpload',
            {
                registerUploadRequest: {
                    owner: userId,
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    serviceRelationships: [
                        {
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent'
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerRes.data.value.asset;

        // 2. Upload image binary to LinkedIn
        const base64Data = base64.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        await axios.put(uploadUrl, imageBuffer, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': mimeType,
                'Content-Length': imageBuffer.length
            }
        });

        // 3. Return the asset URN to be used in a later post
        res.status(200).json({ asset });
    } catch (error) {
        console.error('❌ Upload LinkedIn media error:', error?.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
}