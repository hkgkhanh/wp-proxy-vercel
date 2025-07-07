// /api/x/post.js
const { TwitterApi } = require('twitter-api-v2');

function splitTextIntoTweets(text, maxLength = 280) {
  const chunks = [];
  while (text.length > 0) {
    let chunk = text.slice(0, maxLength);
    const lastSpace = chunk.lastIndexOf(' ');
    if (lastSpace > 0 && text.length > maxLength) {
      chunk = chunk.slice(0, lastSpace);
    }
    chunks.push(chunk);
    text = text.slice(chunk.length).trim();
  }
  return chunks;
}

// async function postThread(textArray) {
//   let replyToId = null;

//   for (const text of textArray) {
//     const tweet = await client.v1.tweet(text, {
//       ...(replyToId && {
//         in_reply_to_status_id: replyToId,
//         auto_populate_reply_metadata: true,
//       }),
//     });

//     replyToId = tweet.id_str;
//   }
// }

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { text, mediaId } = req.body;

        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });

        // const user = await client.v2.me();
        // console.log('📛 Authenticated user:', user);

        const textArray = splitTextIntoTweets(text);
        const tweets = [];

        const firstTweet = await client.v1.tweet(textArray[0], {
            media_ids: [mediaId]
        });

        tweets.push(firstTweet);
        let replyToId = firstTweet.id_str;

        for (let i = 1; i < textArray.length; i++) {
            const tweet = await client.v1.tweet(textArray[i], {
                in_reply_to_status_id: replyToId,
                auto_populate_reply_metadata: true
            });
            tweets.push(tweet);
            replyToId = tweet.id_str;
        }

        // const result = await client.v2.tweet({
        //     text,
        //     media: mediaId ? { media_ids: [mediaId] } : undefined,
        // });

        // res.status(200).json(result);
        res.status(200).json({
            success: true,
            thread: tweets.map((t) => ({
                id: t.id_str,
                text: t.full_text || t.text,
                url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
            })),
        });
    } catch (error) {
        console.error('❌ Post X tweet error:', error);
        res.status(500).json({ error: error.message });
    }
}
