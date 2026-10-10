const { postJson } = require('../lib/http');
module.exports = {
  name: 'twitter', label: 'Twitter / X', charLimit: 280,
  guidance: 'Write one punchy post. At most two hashtags. No thread.',
  mockDraft: t => `Quick take on ${t}: small, steady steps beat big promises. What would you try first? #buildinpublic`.slice(0, 280),
  hasCredentials: () => !!process.env.TWITTER_ACCESS_TOKEN,
  // POST /2/tweets with an OAuth 2.0 user-context access token (tweet.write scope).
  publish: ({ text }) => postJson('https://api.twitter.com/2/tweets', { authorization: `Bearer ${process.env.TWITTER_ACCESS_TOKEN}` }, { text }),
};
