const express = require('express');
const path = require('path');
const rateLimit = require('./lib/ratelimit');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'");
  next();
});
app.use('/api', rateLimit({ windowMs: 60_000, max: 30 }), require('./routes'));
app.get('/health', (req, res) => res.json({ ok: true, anthropic: !!process.env.ANTHROPIC_API_KEY, publishLive: process.env.PUBLISH_LIVE === 'true' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => { console.error(err.message); res.status(err.status || 500).json({ error: err.status === 502 ? err.message : 'Internal error.' }); });

const port = process.env.PORT || 3000;
if (require.main === module) app.listen(port, () => console.log(`Dashboard on http://localhost:${port}  (Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'live' : 'mock mode'})`));
module.exports = app;
