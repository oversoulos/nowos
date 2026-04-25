// ============================================================
// NOWOS TOOLKIT — toolbar, settings, aesthetic, frames
// ============================================================

(function () {

  // ── DOM refs ──────────────────────────────────────────────
  const cardEl      = document.getElementById('card');
  const cardContainer = document.getElementById('card-container');
  const zoomWrap    = document.getElementById('zoom-wrap');

  // ── Toolbar ───────────────────────────────────────────────
  const bar = document.createElement('div');
  bar.id = 'toolkit-bar';
  bar.innerHTML = `
    <button class="tk-btn" id="tk-settings" title="Settings">⚙</button>
    <button class="tk-btn" id="tk-aesthetic" title="Aesthetic">🎨</button>
    <button class="tk-btn" id="tk-add-frame" title="Add Frame">＋</button>
    <span class="tk-spacer"></span>
    <button class="tk-btn close" id="tk-close" title="Close">✕</button>
  `;

  // Toolbar lives inside card-container so it positions relative to card
  const cardWrap = cardEl.parentElement; // zoom-wrap
  cardWrap.style.position = 'relative';
  cardWrap.appendChild(bar);

  // Show/hide toolbar when card flips
  const origFlip = window._nowosFlip; // in case you expose it
  function showToolbar() { bar.classList.add('visible'); }
  function hideToolbar() { bar.classList.remove('visible'); }

  // Watch for flip via MutationObserver on card class
  new MutationObserver(() => {
    if (cardEl.classList.contains('flipped')) showToolbar();
    else hideToolbar();
  }).observe(cardEl, { attributes: true, attributeFilter: ['class'] });

  // Close btn — flip back
  document.getElementById('tk-close').addEventListener('click', (e) => {
    e.stopPropagation();
    if (cardEl.classList.contains('flipped')) {
      cardEl.classList.remove('flipped');
    }
    closeAllPopups();
  });

  // ── Popup factory ─────────────────────────────────────────
  function makePopup(id, title, contentHTML) {
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); }

    const pop = document.createElement('div');
    pop.className = 'tk-popup';
    pop.id = id;
    pop.style.cssText = 'top:60px;left:50%;transform:translateX(-50%);';
    pop.innerHTML = `
      <div class="tk-popup-header">
        <span class="tk-popup-title">${title}</span>
        <button class="tk-popup-close">✕</button>
      </div>
      <div class="tk-popup-body">${contentHTML}</div>
    `;

    // Close btn
    pop.querySelector('.tk-popup-close').addEventListener('click', () => pop.remove());

    // Drag
    makeDraggable(pop, pop.querySelector('.tk-popup-header'));

    // Attach to card face back
    const backFace = cardEl.querySelector('.card-back');
    backFace.appendChild(pop);
    return pop;
  }

  function closeAllPopups() {
    document.querySelectorAll('.tk-popup').forEach(p => p.remove());
  }

  // ── Settings popup ────────────────────────────────────────
  document.getElementById('tk-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.getElementById('popup-settings')) {
      document.getElementById('popup-settings').remove(); return;
    }
    makePopup('popup-settings', 'Settings', `
      <div class="tk-row">
        <span class="tk-label">Anonymous</span>
        <label class="tk-toggle">
          <input type="checkbox" id="anon-toggle">
          <span class="tk-toggle-track"></span>
        </label>
      </div>
      <div class="tk-row">
        <span class="tk-label">NSFW</span>
        <label class="tk-toggle">
          <input type="checkbox" id="nsfw-toggle">
          <span class="tk-toggle-track"></span>
        </label>
      </div>
      <div class="tk-slider-wrap">
        <span class="tk-label">Time Limit</span>
        <input type="range" class="tk-slider" id="time-slider" min="0" max="10" value="5">
        <div class="tk-slider-labels"><span>None</span><span>Max</span></div>
      </div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,255,160,0.1);">
        <span class="tk-label" style="opacity:0.3">· Moderation rules — coming soon</span>
      </div>
    `);
  });

  // ── Aesthetic popup ───────────────────────────────────────
  const themes = [
    { name: 'Neon',    bg: 'linear-gradient(145deg,rgba(0,55,45,.6),rgba(0,18,28,.9))',  border: 'rgba(0,255,160,0.55)'  },
    { name: 'Violet',  bg: 'linear-gradient(145deg,rgba(20,0,50,.65),rgba(10,0,35,.9))', border: 'rgba(140,80,255,0.55)' },
    { name: 'Ocean',   bg: 'linear-gradient(145deg,rgba(0,20,50,.65),rgba(0,8,30,.9))',  border: 'rgba(0,150,255,0.55)'  },
    { name: 'Ember',   bg: 'linear-gradient(145deg,rgba(40,10,0,.65),rgba(20,4,0,.9))',  border: 'rgba(255,100,30,0.55)' },
    { name: 'Slate',   bg: 'linear-gradient(145deg,rgba(15,15,20,.7),rgba(8,8,14,.9))',  border: 'rgba(180,180,220,0.35)'},
    { name: 'Mint',    bg: 'linear-gradient(145deg,rgba(0,40,30,.6),rgba(0,25,18,.9))',  border: 'rgba(0,255,200,0.55)'  },
    { name: 'Rose',    bg: 'linear-gradient(145deg,rgba(40,0,20,.65),rgba(20,0,10,.9))', border: 'rgba(255,80,160,0.55)' },
    { name: 'Gold',    bg: 'linear-gradient(145deg,rgba(30,20,0,.65),rgba(15,10,0,.9))', border: 'rgba(220,180,0,0.55)'  },
  ];

  document.getElementById('tk-aesthetic').addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.getElementById('popup-aesthetic')) {
      document.getElementById('popup-aesthetic').remove(); return;
    }
    const swatchHTML = `
      <div class="tk-swatches">
        ${themes.map((t, i) => `
          <div class="tk-swatch" data-i="${i}"
            style="background:${t.bg};border:1.5px solid ${t.border};"
            title="${t.name}"></div>
        `).join('')}
      </div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,255,160,0.1);">
        <span class="tk-label" style="opacity:0.3">· Custom skins — coming soon</span>
      </div>
    `;
    const pop = makePopup('popup-aesthetic', 'Aesthetic', swatchHTML);
    pop.querySelectorAll('.tk-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const t = themes[+sw.dataset.i];
        const front = cardEl.querySelector('.card-front');
        front.style.background = t.bg;
        front.style.borderColor = t.border;
        pop.querySelectorAll('.tk-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      });
    });
  });

  // ── Frame layer ───────────────────────────────────────────
  const frameLayer = document.createElement('div');
  frameLayer.id = 'frame-layer';
  cardEl.querySelector('.card-back').appendChild(frameLayer);

  let frameCount = 0;

  document.getElementById('tk-add-frame').addEventListener('click', (e) => {
    e.stopPropagation();
    spawnFrame();
  });

  function spawnFrame() {
    frameCount++;
    const frame = document.createElement('div');
    frame.className = 'card-frame placing';
    frame.id = `frame-${frameCount}`;
    frame.style.cssText = `
      left: 10%; top: 10%;
      width: 80%; height: 60%;
      min-width: 80px; min-height: 60px;
    `;

    frame.innerHTML = `
      <div class="frame-controls">
        <button class="frame-btn frame-x" title="Remove">✕</button>
        <button class="frame-btn frame-check" title="Lock in">✓</button>
      </div>
      <div class="frame-body">
        <div class="frame-type-select">
          <button class="frame-type-btn" data-type="chat">Chat</button>
          <button class="frame-type-btn" data-type="text">Text</button>
          <button class="frame-type-btn" data-type="embed">Embed</button>
          <button class="frame-type-btn" data-type="feed">Feed</button>
        </div>
        <input class="frame-embed-input" placeholder="or paste a link…" style="display:none;">
      </div>
      <div class="frame-resize">⌟</div>
    `;

    frameLayer.style.pointerEvents = 'all';
    frameLayer.appendChild(frame);

    // Type selection
    frame.querySelectorAll('.frame-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        frame.querySelectorAll('.frame-type-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const embedInput = frame.querySelector('.frame-embed-input');
        embedInput.style.display = btn.dataset.type === 'embed' ? 'block' : 'none';
        frame.dataset.selectedType = btn.dataset.type;
      });
    });

    // Remove
    frame.querySelector('.frame-x').addEventListener('click', (e) => {
      e.stopPropagation();
      frame.remove();
    });

    // Lock in (check)
    frame.querySelector('.frame-check').addEventListener('click', (e) => {
      e.stopPropagation();
      const type = frame.dataset.selectedType;
      const embedVal = frame.querySelector('.frame-embed-input').value.trim();
      if (!type && !embedVal) { return; }
      lockFrame(frame, type || 'embed', embedVal);
    });

    // Drag
    makeDraggableInBounds(frame, frame, frameLayer);

    // Resize
    makeResizable(frame, frame.querySelector('.frame-resize'), frameLayer);
  }

  function lockFrame(frame, type, embedUrl) {
    frame.classList.remove('placing');
    frame.classList.add('locked');
    const body = frame.querySelector('.frame-body');

    let content = '';
    if (type === 'chat') {
      content = `
        <div class="frame-chat">
          <div class="frame-chat-messages" id="msgs-${frame.id}">
            <div class="frame-chat-msg">anon · hey, what's up</div>
            <div class="frame-chat-msg">anon · this is a demo chat</div>
          </div>
          <div class="frame-chat-input-row">
            <input class="frame-chat-input" placeholder="say something…" id="inp-${frame.id}">
            <button class="frame-chat-send" data-frame="${frame.id}">→</button>
          </div>
        </div>`;
    } else if (type === 'text') {
      content = `<textarea class="frame-text-area" placeholder="write something…"></textarea>`;
    } else if (type === 'feed') {
      content = `
        <div class="frame-chat-messages" style="width:100%">
          <div class="frame-chat-msg">📌 post one — placeholder</div>
          <div class="frame-chat-msg">📌 post two — placeholder</div>
          <div class="frame-chat-msg">📌 post three — placeholder</div>
        </div>`;
    } else if (type === 'embed' && embedUrl) {
      content = `<iframe src="${embedUrl}" style="width:100%;height:100%;border:none;border-radius:6px;" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
    } else {
      content = `<span style="font-size:9px;color:rgba(0,255,160,0.3);letter-spacing:2px;">FRAME READY</span>`;
    }

    body.innerHTML = content;

    // Wire up demo chat send
    const sendBtn = body.querySelector('.frame-chat-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => demoSend(frame.id));
      body.querySelector(`#inp-${frame.id}`).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') demoSend(frame.id);
      });
    }

    // Re-add resize handle
    const rh = document.createElement('div');
    rh.className = 'frame-resize';
    rh.textContent = '⌟';
    frame.appendChild(rh);
    makeResizable(frame, rh, frameLayer);

    // Keep drag on locked frame header (controls bar)
    makeDraggableInBounds(frame, frame.querySelector('.frame-controls'), frameLayer);
  }

  function demoSend(fid) {
    const inp = document.getElementById(`inp-${fid}`);
    const msgs = document.getElementById(`msgs-${fid}`);
    if (!inp || !msgs || !inp.value.trim()) return;
    const msg = document.createElement('div');
    msg.className = 'frame-chat-msg';
    msg.textContent = `you · ${inp.value.trim()}`;
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
    inp.value = '';
  }

  // ── Card fullscreen button ────────────────────────────────
  const fsBtnCard = document.createElement('button');
  fsBtnCard.id = 'fs-card-btn';
  fsBtnCard.title = 'Card fullscreen';
  fsBtnCard.textContent = '⤢';
  document.body.appendChild(fsBtnCard);

  let cardFS = false;
  fsBtnCard.addEventListener('click', () => {
    cardFS = !cardFS;
    cardContainer.classList.toggle('card-fullscreen', cardFS);
    fsBtnCard.textContent = cardFS ? '⤡' : '⤢';
  });

  // ── Drag helper (unconstrained) ───────────────────────────
  function makeDraggable(el, handle) {
    let ox, oy, sx, sy;
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: true });

    function start(e) {
      const pt = e.touches ? e.touches[0] : e;
      sx = pt.clientX; sy = pt.clientY;
      const r = el.getBoundingClientRect();
      ox = r.left; oy = r.top;
      el.style.transform = 'none';
      el.style.left = ox + 'px';
      el.style.top  = oy + 'px';
      el.style.position = 'absolute';
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
      document.addEventListener('touchmove', move, { passive: true });
      document.addEventListener('touchend', end);
    }
    function move(e) {
      const pt = e.touches ? e.touches[0] : e;
      el.style.left = (ox + pt.clientX - sx) + 'px';
      el.style.top  = (oy + pt.clientY - sy) + 'px';
    }
    function end() {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    }
  }

  // ── Drag helper (constrained to parent) ──────────────────
  function makeDraggableInBounds(el, handle, parent) {
    let ox, oy, sx, sy;
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: true });

    function start(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' || e.target.tagName === 'IFRAME') return;
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      sx = pt.clientX; sy = pt.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', end);
    }
    function move(e) {
      if (e.cancelable) e.preventDefault();
      const pt = e.touches ? e.touches[0] : e;
      const pw = parent.offsetWidth;
      const ph = parent.offsetHeight;
      const ew = el.offsetWidth;
      const eh = el.offsetHeight;
      const nx = Math.max(0, Math.min(pw - ew, ox + pt.clientX - sx));
      const ny = Math.max(0, Math.min(ph - eh, oy + pt.clientY - sy));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';
    }
    function end() {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    }
  }

  // ── Resize helper ─────────────────────────────────────────
  function makeResizable(el, handle, parent) {
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: true });

    function start(e) {
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      const sw = el.offsetWidth;
      const sh = el.offsetHeight;
      const sx = pt.clientX;
      const sy = pt.clientY;

      function move(e) {
        const pt2 = e.touches ? e.touches[0] : e;
        const pw = parent.offsetWidth;
        const ph = parent.offsetHeight;
        const nw = Math.max(80,  Math.min(pw - el.offsetLeft, sw + pt2.clientX - sx));
        const nh = Math.max(60,  Math.min(ph - el.offsetTop,  sh + pt2.clientY - sy));
        el.style.width  = nw + 'px';
        el.style.height = nh + 'px';
      }
      function end() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
      document.addEventListener('touchmove', move, { passive: true });
      document.addEventListener('touchend', end);
    }
  }

})();
