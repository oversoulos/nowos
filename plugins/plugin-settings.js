/* ================================================
   NOWOS PLUGIN — SETTINGS
   Drop in: /plugins/plugin-settings.js
   Load in index.html before </body>:
     <script src="plugins/plugin-settings.js"></script>

   Provides:
   - Settings socket pre-loaded (top-right by default)
   - Panel opens on tap
   - Aesthetic tab: live theme + palette switching
   - Profile tab: shell ready to fill
   - More tabs: shells ready to fill
================================================ */

(function() {

    /* ---- PANEL HTML ---- */
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.innerHTML = `
        <div id="sp-header">
            <span id="sp-title">SETTINGS</span>
            <button id="sp-close">✕</button>
        </div>
        <div id="sp-tabs">
            <button class="sp-tab active" data-tab="aesthetic">Aesthetic</button>
            <button class="sp-tab" data-tab="profile">Profile</button>
            <button class="sp-tab" data-tab="wallet">Wallet</button>
            <button class="sp-tab" data-tab="privacy">Privacy</button>
        </div>
        <div id="sp-body">

            <!-- AESTHETIC -->
            <div class="sp-pane active" data-pane="aesthetic">

                <div class="sp-section-label">THEME</div>
                <div class="sp-grid">
                    <button class="sp-swatch active" data-theme="">
                        <div class="sw-preview" style="background:linear-gradient(135deg,#03030a,#0e1530)"></div>
                        <span>Default</span>
                    </button>
                    <button class="sp-swatch" data-theme="ember">
                        <div class="sw-preview" style="background:linear-gradient(135deg,#0c0602,#341808)"></div>
                        <span>Ember</span>
                    </button>
                    <button class="sp-swatch" data-theme="void">
                        <div class="sw-preview" style="background:linear-gradient(135deg,#000,#10101c)"></div>
                        <span>Void</span>
                    </button>
                    <button class="sp-swatch" data-theme="bio">
                        <div class="sw-preview" style="background:linear-gradient(135deg,#010a04,#0d2818)"></div>
                        <span>Bio</span>
                    </button>
                </div>

                <div class="sp-section-label">CARD</div>
                <div class="sp-grid">
                    <button class="sp-swatch active" data-card="default">
                        <div class="sw-preview" style="background:#101622;border:1px solid rgba(100,200,255,0.4)"></div>
                        <span>Default</span>
                    </button>
                    <button class="sp-swatch" data-card="midnight">
                        <div class="sw-preview" style="background:#080810;border:1px solid rgba(160,80,255,0.4)"></div>
                        <span>Midnight</span>
                    </button>
                    <button class="sp-swatch" data-card="slate">
                        <div class="sw-preview" style="background:#1a1a2e;border:1px solid rgba(80,200,255,0.4)"></div>
                        <span>Slate</span>
                    </button>
                    <button class="sp-swatch" data-card="obsidian">
                        <div class="sw-preview" style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.15)"></div>
                        <span>Obsidian</span>
                    </button>
                </div>

                <div class="sp-section-label">RIM GLOW</div>
                <div class="sp-grid">
                    <button class="sp-swatch active" data-rim="default">
                        <div class="sw-preview" style="background:#101622;box-shadow:0 0 0 2px rgba(100,200,255,0.6),0 0 10px rgba(100,200,255,0.4)"></div>
                        <span>Cyan</span>
                    </button>
                    <button class="sp-swatch" data-rim="rose">
                        <div class="sw-preview" style="background:#101622;box-shadow:0 0 0 2px rgba(255,80,160,0.6),0 0 10px rgba(255,80,160,0.4)"></div>
                        <span>Rose</span>
                    </button>
                    <button class="sp-swatch" data-rim="gold">
                        <div class="sw-preview" style="background:#101622;box-shadow:0 0 0 2px rgba(255,200,60,0.6),0 0 10px rgba(255,200,60,0.4)"></div>
                        <span>Gold</span>
                    </button>
                    <button class="sp-swatch" data-rim="green">
                        <div class="sw-preview" style="background:#101622;box-shadow:0 0 0 2px rgba(80,255,140,0.6),0 0 10px rgba(80,255,140,0.4)"></div>
                        <span>Green</span>
                    </button>
                </div>

                <div class="sp-section-label">SPEED</div>
                <div class="sp-row">
                    <span class="sp-lbl">Navigation</span>
                    <input type="range" min="1" max="10" value="5" id="sp-nav-speed">
                </div>
                <div class="sp-row">
                    <span class="sp-lbl">Demo cycle</span>
                    <label class="sp-toggle">
                        <input type="checkbox" id="sp-demo">
                        <span class="sp-toggle-track"></span>
                    </label>
                </div>

            </div>

            <!-- PROFILE -->
            <div class="sp-pane" data-pane="profile">
                <div class="sp-section-label">PROFILE</div>
                <div class="sp-placeholder">Profile plugin coming soon</div>
            </div>

            <!-- WALLET -->
            <div class="sp-pane" data-pane="wallet">
                <div class="sp-section-label">WALLET</div>
                <div class="sp-placeholder">Wallet plugin coming soon</div>
            </div>

            <!-- PRIVACY -->
            <div class="sp-pane" data-pane="privacy">
                <div class="sp-section-label">PRIVACY</div>
                <div class="sp-placeholder">Privacy plugin coming soon</div>
            </div>

        </div>
    `;
    document.body.appendChild(panel);

    /* ---- PANEL CSS ---- */
    const style = document.createElement('style');
    style.textContent = `
        #settings-panel {
            position:fixed;
            top:0; right:0;
            width:min(320px, 92vw);
            height:100vh;
            background:#0a0c18;
            border-left:1px solid rgba(255,255,255,0.08);
            z-index:2000;
            display:flex;
            flex-direction:column;
            transform:translateX(100%);
            transition:transform 0.38s cubic-bezier(0.4,0,0.2,1);
            box-shadow:-8px 0 40px rgba(0,0,0,0.6);
            font-family:'SF Mono','Fira Code','Courier New',monospace;
        }

        #settings-panel.open {
            transform:translateX(0);
        }

        #sp-header {
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:18px 20px 14px;
            border-bottom:1px solid rgba(255,255,255,0.06);
            flex-shrink:0;
        }

        #sp-title {
            font-size:9px;
            letter-spacing:3px;
            color:rgba(255,255,255,0.38);
        }

        #sp-close {
            background:none;
            border:none;
            color:rgba(255,255,255,0.30);
            font-size:14px;
            cursor:pointer;
            padding:4px 8px;
            border-radius:4px;
            transition:color 0.2s, background 0.2s;
        }

        #sp-close:hover {
            color:rgba(255,255,255,0.80);
            background:rgba(255,255,255,0.06);
        }

        #sp-tabs {
            display:flex;
            gap:0;
            padding:10px 12px 0;
            flex-shrink:0;
            overflow-x:auto;
            scrollbar-width:none;
        }

        #sp-tabs::-webkit-scrollbar { display:none; }

        .sp-tab {
            background:none;
            border:none;
            border-bottom:2px solid transparent;
            color:rgba(255,255,255,0.28);
            font-family:inherit;
            font-size:8px;
            letter-spacing:2px;
            text-transform:uppercase;
            padding:8px 12px;
            cursor:pointer;
            white-space:nowrap;
            transition:color 0.2s, border-color 0.2s;
        }

        .sp-tab.active {
            color:var(--accent, #5abeff);
            border-bottom-color:var(--accent, #5abeff);
        }

        #sp-body {
            flex:1;
            overflow-y:auto;
            padding:16px 16px 32px;
            scrollbar-width:thin;
            scrollbar-color:rgba(255,255,255,0.08) transparent;
        }

        .sp-pane { display:none; }
        .sp-pane.active { display:block; }

        .sp-section-label {
            font-size:7px;
            letter-spacing:3px;
            color:rgba(255,255,255,0.20);
            margin:16px 0 8px;
            text-transform:uppercase;
        }

        .sp-section-label:first-child { margin-top:4px; }

        .sp-grid {
            display:grid;
            grid-template-columns:repeat(4, 1fr);
            gap:8px;
            margin-bottom:4px;
        }

        .sp-swatch {
            background:none;
            border:1.5px solid rgba(255,255,255,0.08);
            border-radius:8px;
            padding:6px 4px;
            cursor:pointer;
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:5px;
            transition:border-color 0.2s, transform 0.15s;
        }

        .sp-swatch:hover {
            border-color:rgba(255,255,255,0.22);
            transform:scale(1.04);
        }

        .sp-swatch.active {
            border-color:var(--accent, #5abeff);
            box-shadow:0 0 8px rgba(90,190,255,0.20);
        }

        .sw-preview {
            width:100%;
            height:28px;
            border-radius:4px;
        }

        .sp-swatch span {
            font-size:7px;
            letter-spacing:1px;
            color:rgba(255,255,255,0.38);
            text-transform:uppercase;
            font-family:inherit;
        }

        .sp-row {
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:10px 4px;
            border-bottom:1px solid rgba(255,255,255,0.04);
        }

        .sp-lbl {
            font-size:8px;
            letter-spacing:1.5px;
            color:rgba(255,255,255,0.38);
            text-transform:uppercase;
        }

        input[type="range"] {
            -webkit-appearance:none;
            width:120px;
            height:2px;
            background:rgba(255,255,255,0.14);
            border-radius:2px;
            outline:none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance:none;
            width:14px;
            height:14px;
            border-radius:50%;
            background:var(--accent, #5abeff);
            cursor:pointer;
            box-shadow:0 0 6px rgba(90,190,255,0.40);
        }

        .sp-toggle {
            position:relative;
            display:inline-block;
            width:36px;
            height:20px;
            cursor:pointer;
        }

        .sp-toggle input { opacity:0; width:0; height:0; }

        .sp-toggle-track {
            position:absolute;
            inset:0;
            background:rgba(255,255,255,0.10);
            border-radius:20px;
            transition:background 0.2s;
        }

        .sp-toggle-track::after {
            content:'';
            position:absolute;
            left:3px; top:3px;
            width:14px; height:14px;
            border-radius:50%;
            background:rgba(255,255,255,0.40);
            transition:transform 0.2s, background 0.2s;
        }

        .sp-toggle input:checked + .sp-toggle-track {
            background:var(--accent, #5abeff);
        }

        .sp-toggle input:checked + .sp-toggle-track::after {
            transform:translateX(16px);
            background:#fff;
        }

        .sp-placeholder {
            padding:24px 0;
            font-size:8px;
            letter-spacing:2px;
            color:rgba(255,255,255,0.14);
            text-transform:uppercase;
            text-align:center;
        }

        /* Overlay behind panel */
        #sp-overlay {
            position:fixed;
            inset:0;
            z-index:1999;
            background:rgba(0,0,0,0);
            pointer-events:none;
            transition:background 0.38s ease;
        }

        #sp-overlay.open {
            background:rgba(0,0,0,0.45);
            pointer-events:all;
        }
    `;
    document.head.appendChild(style);

    /* ---- OVERLAY ---- */
    const overlay = document.createElement('div');
    overlay.id = 'sp-overlay';
    document.body.appendChild(overlay);

    /* ---- OPEN / CLOSE ---- */
    function openPanel() {
        panel.classList.add('open');
        overlay.classList.add('open');
    }

    function closePanel() {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    }

    document.getElementById('sp-close').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    /* Hook into settings socket */
    const settingsSock = document.getElementById('s-settings');
    if (settingsSock) {
        settingsSock.addEventListener('click', function() {
            if (!this.__drag) openPanel();
        });
    }

    /* ---- TABS ---- */
    document.querySelectorAll('.sp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sp-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`.sp-pane[data-pane="${tab.dataset.tab}"]`).classList.add('active');
        });
    });

    /* ---- THEME SWATCHES ---- */
    const cardColors = {
        default:  { bg:'#101622', rim:'rgba(100,200,255,0.55)' },
        midnight: { bg:'#080810', rim:'rgba(160,80,255,0.55)'  },
        slate:    { bg:'#1a1a2e', rim:'rgba(80,200,255,0.55)'  },
        obsidian: { bg:'#0d0d0d', rim:'rgba(255,255,255,0.22)' },
    };

    const rimColors = {
        default: { rim:'rgba(100,200,255,0.55)', night:'rgba(60,120,255,0.35)' },
        rose:    { rim:'rgba(255,80,160,0.55)',  night:'rgba(200,40,120,0.35)' },
        gold:    { rim:'rgba(255,200,60,0.55)',  night:'rgba(200,140,20,0.35)' },
        green:   { rim:'rgba(80,255,140,0.55)',  night:'rgba(40,180,80,0.35)'  },
    };

    const root = document.documentElement;

    /* Theme */
    document.querySelectorAll('.sp-swatch[data-theme]').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('.sp-swatch[data-theme]').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            root.dataset.theme = sw.dataset.theme;
        });
    });

    /* Card color */
    document.querySelectorAll('.sp-swatch[data-card]').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('.sp-swatch[data-card]').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            const c = cardColors[sw.dataset.card];
            if (c) root.style.setProperty('--card-bg', c.bg);
        });
    });

    /* Rim glow */
    document.querySelectorAll('.sp-swatch[data-rim]').forEach(sw => {
        sw.addEventListener('click', () => {
            document.querySelectorAll('.sp-swatch[data-rim]').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            const r = rimColors[sw.dataset.rim];
            if (r) {
                root.style.setProperty('--card-rim', r.rim);
                root.style.setProperty('--card-rim-night', r.night);
            }
        });
    });

    /* Nav speed slider */
    document.getElementById('sp-nav-speed').addEventListener('input', function() {
        const spd = (0.8 - (this.value / 10) * 0.65).toFixed(2);
        root.style.setProperty('--nav-spd', spd + 's');
    });

    /* Demo cycle toggle */
    document.getElementById('sp-demo').addEventListener('change', function() {
        if (typeof S !== 'undefined') {
            S.demo = this.checked;
            S.t0 = Date.now();
        }
    });

})();

