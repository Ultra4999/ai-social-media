const $ = id => document.getElementById(id);
let platforms = [], current = null;
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
                set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

async function api(path, body) {
  const res = await fetch('/api/' + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function select(p) {
  current = p;
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.n === p.name));
  $('imgwrap').hidden = !p.needsImage; updateCount(); renderHistory();
}
function updateCount() {
  const n = $('draft').value.length, over = n > current.charLimit;
  $('count').textContent = `${n} / ${current.charLimit}`; $('count').className = over ? 'over' : '';
  $('pub').disabled = over || !n;
}
function renderHistory() {
  const items = store.get('history', []).filter(h => h.platform === current.name).slice(0, 8);
  $('history').replaceChildren(...items.map(h => { const li = document.createElement('li'); li.textContent = h.text; return li; }));
}
function status(msg, bad) { $('status').textContent = msg; $('status').style.color = bad ? '#b00020' : '#1c1f24'; }

$('gen').onclick = async () => {
  $('gen').disabled = true; status('Generating…');
  try {
    const r = await api(current.name + '/generate', { topic: $('topic').value, tone: $('tone').value, brandVoice: $('voice').value });
    $('draft').value = r.text; $('note').textContent = r.mock ? 'Mock draft (no API key set)' : r.truncated ? 'Trimmed to fit the limit' : '';
    updateCount(); status('Draft ready. Edit it, then publish.');
  } catch (e) { status(e.message, true); } finally { $('gen').disabled = false; }
};
$('pub').onclick = async () => {
  try {
    const r = await api(current.name + '/publish', { text: $('draft').value, imageUrl: $('img').value || undefined });
    status(r.dryRun ? r.message : 'Published.');
    store.set('history', [{ platform: current.name, text: $('draft').value }, ...store.get('history', [])].slice(0, 50)); renderHistory();
  } catch (e) { status(e.message, true); }
};
$('draft').oninput = updateCount;

(async () => {
  const h = await (await fetch('/health')).json();
  $('mode').textContent = (h.anthropic ? 'Claude live' : 'Mock mode') + ' · ' + (h.publishLive ? 'publishing live' : 'dry-run publish');
  platforms = await api('platforms');
  $('tabs').replaceChildren(...platforms.map(p => { const b = document.createElement('button'); b.textContent = p.label; b.dataset.n = p.name; b.onclick = () => select(p); return b; }));
  select(platforms[0]);
})();
