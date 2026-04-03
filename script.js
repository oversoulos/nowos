
// NOWOS — complete script.js
const S = {
    x: 0, y: 0,
    nav: false,
    state: 'zoomed',
    idleT: null
};

const card = document.getElementById('card');
const zoomWrap = document.getElementById('zoom-wrap');
const coord = document.getElementById('coord');
const cardNode = document.getElementById('card-node');
const hudPos = document.getElementById('hud-pos');
const bgPlanet = document.getElementById('bg-planet');
const bgHaze = document.getElementById('bg-haze');

function setZoom(state) {
    S.state = state;
    if (state === 'zoomed') zoomWrap.classList.remove('traveling');
    else if (state === 'traveling') zoomWrap.classList.add('traveling');
}

function startIdle() {
    clearTimeout(S.idleT);
    S.idleT = setTimeout(() => {
        if (!S.nav && !card.classList.contains('flipped')) setZoom('zoomed');
    }, 2000);
}

function hex4(x, y) {
    return (((x & 0xFF) << 8) | (y & 0xFF)).toString(16).toUpperCase().padStart(4, '0');
}

function updateDisplay() {
    coord.textContent = `${S.x}, ${S.y}`;
    cardNode.textContent = `NODE · ${hex4(S.x, S.y)}`;
    hudPos.textContent = `${S.x}, ${S.y}`;
    updateBackground();
}

function updateBackground() {
    // Parallax speeds – farther layers move slower
    const cardX = S.x * 12;   // Card moves the most
    const cardY = S.y * 12;
    
    const planetX = cardX * 0.4;   // Planet moves slow (far away)
    const planetY = cardY * 0.4;
    
    const hazeX = cardX * 0.6;     // Haze moves medium
    const hazeY = cardY * 0.6;
    
    // Apply transforms to each layer
    bgPlanet.style.transform = `translate(${-planetX}px, ${-planetY}px) scale(1.05)`;
    bgHaze.style.transform = `translate(${-hazeX}px, ${-hazeY}px)`;
    
    // Optional: subtle rotation for depth
    const rotation = (S.x + S.y) * 0.5;
    bgPlanet.style.transform += ` rotate(${rotation}deg)`;
}

function navigate(dx, dy) {
    if (S.nav) return;
    if (card.classList.contains('flipped')) return;

    S.nav = true;
    clearTimeout(S.idleT);
    setZoom('traveling');

    const nx = dx;
    const ny = dy;
    const spd = 420;

    const outClass = nx > 0 ? 'out-l' : nx < 0 ? 'out-r' : ny < 0 ? 'out-u' : 'out-d';
    const inClass = nx > 0 ? 'in-r' : nx < 0 ? 'in-l' : ny < 0 ? 'in-d' : 'in-u';

    card.classList.add(outClass);

    setTimeout(() => {
        S.x += nx;
        S.y += ny;
        updateDisplay();

        card.classList.remove(outClass);
        card.classList.add(inClass);

        setTimeout(() => {
            card.classList.remove(inClass);
            S.nav = false;
            startIdle();
        }, spd);
    }, spd);
}

function flip() {
    if (S.nav) return;
    card.classList.toggle('flipped');
    if (card.classList.contains('flipped')) {
        clearTimeout(S.idleT);
    } else {
        startIdle();
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const map = {
        ArrowLeft: () => navigate(-1, 0),
        ArrowRight: () => navigate(1, 0),
        ArrowUp: () => navigate(0, -1),
        ArrowDown: () => navigate(0, 1),
        ' ': () => flip(),
        'f': () => flip(),
        'F': () => flip()
    };
    if (map[e.key]) {
        e.preventDefault();
        map[e.key]();
    }
});

// Touch swipe
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        navigate(dx > 0 ? -1 : 1, 0);
    } else if (Math.abs(dy) > 40) {
        navigate(0, dy > 0 ? 1 : -1);
    }
}, { passive: true });

// Click/tap on card
card.addEventListener('click', () => {
    if (S.nav) return;
    if (S.state !== 'zoomed') {
        clearTimeout(S.idleT);
        setZoom('zoomed');
    } else {
        flip();
    }
});

// Initialize
updateDisplay();
startIdle();
            
