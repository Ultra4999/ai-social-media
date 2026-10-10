const { postJson } = require('../lib/http');
module.exports = {
  name: 'linkedin', label: 'LinkedIn', charLimit: 3000,
  guidance: 'Write a professional post: a strong first line, short paragraphs, one concrete lesson, and a closing question. At most three hashtags.',
  mockDraft: t => `One lesson from working on ${t}: clarity beats cleverness.\n\nWe agreed the goal first, shipped a small version, and let feedback shape the rest.\n\nWhat is one habit that made your last project easier?\n\n#softwareengineering #teamwork`,
  hasCredentials: () => !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN),
  // UGC Posts API with the w_member_social scope.
  publish: ({ text }) => postJson('https://api.linkedin.com/v2/ugcPosts', { authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`, 'x-restli-protocol-version': '2.0.0' }, {
    author: process.env.LINKEDIN_AUTHOR_URN, lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text }, shareMediaCategory: 'NONE' } },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }),
};
