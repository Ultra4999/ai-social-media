async function postJson(url, headers, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) { const e = new Error(`${new URL(url).host} responded ${res.status}: ${text.slice(0, 300)}`); e.status = 502; throw e; }
  return data;
}
module.exports = { postJson };
