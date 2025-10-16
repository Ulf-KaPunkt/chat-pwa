let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  let btn = document.getElementById('installBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'installBtn';
    btn.textContent = '📲 App installieren';
    btn.style = 'position:fixed;bottom:20px;right:20px;padding:10px 16px;font-size:16px;background:#ffcc00;border:none;border-radius:8px;cursor:pointer;z-index:9999';
    document.body.appendChild(btn);
  }
  btn.hidden = false;

  btn.onclick = async () => {
    btn.hidden = true;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Installationsentscheidung:', outcome);
    deferredPrompt = null;
  };
});
