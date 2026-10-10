const assert = require('assert');
const app = require('./server');
const srv = app.listen(0, async () => {
  const base = `http://localhost:${srv.address().port}`;
  const j = (p, b) => fetch(base + p, b && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then(async r => [r.status, await r.json()]);
  try {
    let [s, d] = await j('/api/platforms'); assert.equal(s, 200); assert.equal(d.length, 4);
    for (const p of d) {
      [s, d] = await j(`/api/${p.name}/generate`, { topic: 'a new course' }); assert.equal(s, 200); assert.ok(d.length <= d.charLimit);
    }
    [s] = await j('/api/twitter/generate', { topic: 'x' }); assert.equal(s, 400);
    [s] = await j('/api/twitter/publish', { text: 'a'.repeat(300) }); assert.equal(s, 400);
    [s] = await j('/api/instagram/publish', { text: 'hi' }); assert.equal(s, 400);
    [s, d] = await j('/api/linkedin/publish', { text: 'hi' }); assert.equal(s, 200); assert.equal(d.dryRun, true);
    console.log('All tests passed'); process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
});
