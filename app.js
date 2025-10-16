(() => {
  const el = {
    log: document.getElementById('log'),
    input: document.getElementById('msg'),
    send: document.getElementById('send')
  };

  const STORAGE_KEY = 'chatpwa:messages';
  let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  const render = () => {
    el.log.innerHTML = '';
    for (const m of messages) {
      const div = document.createElement('div');
      div.className = `msg ${m.role}`;
      div.textContent = m.content;
      el.log.appendChild(div);
    }
    el.log.scrollTop = el.log.scrollHeight;
  };

  const persist = () =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

  const fakeBotReply = async (text) => {
    // Platzhalter – hier hängen wir später die echte API dran
    await new Promise(r => setTimeout(r, 400));
    return `Echo: ${text}`;
  };

  const onSend = async () => {
    const text = el.input.value.trim();
    if (!text) return;
    el.input.value = '';
    messages.push({ role: 'user', content: text });
    persist(); render();

    el.send.disabled = true;
    try {
      const reply = await fakeBotReply(text);
      messages.push({ role: 'bot', content: reply });
      persist(); render();
    } finally {
      el.send.disabled = false;
      el.input.focus();
    }
  };

  el.send.addEventListener('click', onSend);
  el.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) onSend();
  });

  render();
})();
