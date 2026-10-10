// Thin proxy around the Anthropic Messages API. The API key never leaves the server.
const API = 'https://api.anthropic.com/v1/messages';

async function complete({ system, prompt, maxTokens = 600 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { mock: true, text: null };
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return { mock: false, text };
}
module.exports = { complete };
