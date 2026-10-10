const { postJson } = require('../lib/http');
module.exports = {
  name: 'instagram', label: 'Instagram', charLimit: 2200, needsImage: true,
  guidance: 'Write a caption: a hook in the first line, two or three short lines, then up to five relevant hashtags on a new line.',
  mockDraft: t => `Behind the scenes on ${t}.\nSmall progress every day adds up.\n\n#creators #behindthescenes #dailyprogress`,
  hasCredentials: () => !!(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN),
  // Instagram Graph API is two steps: create a media container, then publish it. An image is mandatory.
  async publish({ text, imageUrl }) {
    const base = `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_USER_ID}`;
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const container = await postJson(`${base}/media`, {}, { image_url: imageUrl, caption: text, access_token: token });
    return postJson(`${base}/media_publish`, {}, { creation_id: container.id, access_token: token });
  },
};
