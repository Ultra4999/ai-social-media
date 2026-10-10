const { postJson } = require('../lib/http');
module.exports = {
  name: 'facebook', label: 'Facebook', charLimit: 2000,
  guidance: 'Write a friendly post of two to four short sentences with a clear call to action. At most one emoji.',
  mockDraft: t => `We have been thinking about ${t} lately and would love to hear your experience. Tell us in the comments what has worked for you.`,
  hasCredentials: () => !!(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_TOKEN),
  // Graph API: publish a text post to a Page feed with a Page access token.
  publish: ({ text }) => postJson(`https://graph.facebook.com/v21.0/${process.env.FACEBOOK_PAGE_ID}/feed`, {}, { message: text, access_token: process.env.FACEBOOK_PAGE_TOKEN }),
};
