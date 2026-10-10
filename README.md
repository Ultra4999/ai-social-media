# AI Social Media Manager Dashboard

Node.js and Express backend that proxies the Anthropic API, with a separate route module for each of Twitter/X, Instagram, Facebook and LinkedIn, plus a small browser dashboard for generating, editing and publishing posts.

## Run
    npm install
    cp .env.example .env     # add ANTHROPIC_API_KEY (optional)
    npm start                # http://localhost:3000
    npm test

With no API key the app runs in mock mode and returns canned drafts, so the full flow works offline.

## Structure
- `server.js` Express app, security headers, rate limiting, static dashboard
- `routes/index.js` mounts one router per platform at `/api/<platform>`
- `lib/platformRouter.js` shared `POST /generate` and `POST /publish` handlers with validation
- `lib/anthropic.js` Anthropic Messages API proxy; the key stays on the server
- `platforms/*.js` per-platform character limit, prompt guidance and publish call
- `public/` dashboard (tabs, tone and brand voice, live character counter, history)

## Publishing
Publishing is a dry run by default. To post for real set `PUBLISH_LIVE=true` and that platform's credentials in `.env`. The publish calls follow each platform's documented API (X `POST /2/tweets`, Facebook Page feed, LinkedIn UGC Posts, Instagram two-step media container, which requires an image URL) but have not been run against live accounts. Each platform needs its own developer app and approved access token.

## Security notes
JSON body size cap, per-IP rate limit, input validation, character-limit enforcement, CSP and nosniff headers, secrets only in `.env` (git-ignored).
