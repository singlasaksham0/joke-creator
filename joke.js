// Random Joke Generator
// Primary source: https://icanhazdadjoke.com/ (Accept: application/json)
// Fallback: https://official-joke-api.appspot.com/random_joke

const el = {
  jokeText: document.getElementById('joke-text'),
  jokeMeta: document.getElementById('joke-meta'),
  status: document.getElementById('status'),
  btnGet: document.getElementById('get-joke'),
  btnCopy: document.getElementById('copy-joke'),
  btnShare: document.getElementById('share-joke'),
};

const USER_AGENT = 'solo-leveling-game-joke-generator (singlasaksham0)';

// Utility
function setStatus(msg, type = 'info') {
  if (!el.status) return;
  el.status.textContent = msg || '';
  el.status.style.color = type === 'error' ? 'var(--danger)' : (type === 'success' ? 'var(--success)' : '');
}

function showJoke(text, meta = '') {
  if (!el.jokeText) return;
  el.jokeText.textContent = text;
  if (el.jokeMeta) el.jokeMeta.textContent = meta;
}

// Fetch from icanhazdadjoke
async function fetchFromIcan() {
  const res = await fetch('https://icanhazdadjoke.com/', {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT
    }
  });
  if (!res.ok) throw new Error(`icanhazdadjoke error ${res.status}`);
  const data = await res.json();
  if (!data || !data.joke) throw new Error('Invalid joke response');
  return { text: data.joke, id: data.id, source: 'icanhazdadjoke' };
}

// Fallback: official-joke-api (structure: {setup, punchline})
async function fetchFromOfficial() {
  const res = await fetch('https://official-joke-api.appspot.com/random_joke');
  if (!res.ok) throw new Error(`official-joke-api error ${res.status}`);
  const data = await res.json();
  if (!data || (!data.setup && !data.punchline)) throw new Error('Invalid joke response');
  const text = data.setup ? `${data.setup} — ${data.punchline || ''}` : data.punchline;
  return { text, id: data.id || '', source: 'official-joke-api' };
}

async function fetchJoke() {
  setStatus('Loading joke...');
  showJoke('...', '');
  try {
    // Try primary API first
    try {
      const j = await fetchFromIcan();
      showJoke(j.text, `Source: ${j.source}`);
      setStatus('Loaded!', 'success');
      return j;
    } catch (err) {
      // primary failed — try fallback
      console.warn('Primary joke API failed, fallback:', err);
      const j2 = await fetchFromOfficial();
      showJoke(j2.text, `Source: ${j2.source}`);
      setStatus('Loaded (fallback)', 'success');
      return j2;
    }
  } catch (err) {
    console.error('Fetching joke failed:', err);
    showJoke('Failed to load a joke. Try again.');
    setStatus('Error loading joke', 'error');
    return null;
  }
}

async function copyJokeToClipboard() {
  const text = el.jokeText?.textContent?.trim();
  if (!text) return setStatus('No joke to copy', 'error');
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Joke copied to clipboard', 'success');
  } catch (err) {
    setStatus('Unable to copy (clipboard denied)', 'error');
  }
}

async function shareJoke() {
  const text = el.jokeText?.textContent?.trim();
  if (!text) return setStatus('No joke to share', 'error');
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Random Joke', text });
      setStatus('Shared!', 'success');
    } catch (err) {
      setStatus('Share cancelled or failed', 'error');
    }
  } else {
    setStatus('Share not supported in this browser', 'error');
  }
}

// Event handlers
el.btnGet?.addEventListener('click', () => {
  // disable button briefly to avoid spam
  el.btnGet.disabled = true;
  fetchJoke().finally(() => { el.btnGet.disabled = false; });
});
el.btnCopy?.addEventListener('click', copyJokeToClipboard);
el.btnShare?.addEventListener('click', shareJoke);

// Auto-initialize: if you want a joke immediately, uncomment:
// fetchJoke();