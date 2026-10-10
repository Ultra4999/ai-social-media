// Builds one Express router per platform module: POST /generate and POST /publish.
const express = require('express');
const { complete } = require('./anthropic');

module.exports = function platformRouter(p) {
  const r = express.Router();

  r.get('/', (req, res) => res.json({ name: p.name, label: p.label, charLimit: p.charLimit, needsImage: !!p.needsImage }));

  r.post('/generate', async (req, res, next) => {
    try {
      const { topic, tone = 'professional', brandVoice = '' } = req.body || {};
      if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 500)
        return res.status(400).json({ error: 'topic must be a string of 3 to 500 characters.' });
      const system = [
        `You are a social media copywriter writing for ${p.label}.`,
        p.guidance,
        `Hard limit: ${p.charLimit} characters. Return only the post text, no preamble, no quotation marks.`,
        brandVoice ? `Brand voice: ${String(brandVoice).slice(0, 300)}` : '',
      ].filter(Boolean).join('\n');
      const out = await complete({ system, prompt: `Topic: ${topic.trim()}\nTone: ${String(tone).slice(0, 40)}` });
      let text = out.mock ? p.mockDraft(topic.trim()) : out.text;
      const truncated = text.length > p.charLimit;
      if (truncated) text = text.slice(0, p.charLimit - 1).trimEnd() + '…';
      res.json({ platform: p.name, text, length: text.length, charLimit: p.charLimit, mock: out.mock, truncated });
    } catch (e) { next(e); }
  });

  r.post('/publish', async (req, res, next) => {
    try {
      const { text, imageUrl } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text is required.' });
      if (text.length > p.charLimit) return res.status(400).json({ error: `Over the ${p.charLimit} character limit.` });
      if (p.needsImage && !imageUrl) return res.status(400).json({ error: `${p.label} requires an imageUrl.` });
      const live = process.env.PUBLISH_LIVE === 'true' && p.hasCredentials();
      if (!live) return res.json({ platform: p.name, dryRun: true, message: 'Dry run: nothing was posted. Set PUBLISH_LIVE=true and platform credentials to post.', text });
      const result = await p.publish({ text, imageUrl });
      res.json({ platform: p.name, dryRun: false, result });
    } catch (e) { next(e); }
  });
  return r;
};
