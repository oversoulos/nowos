/* ========================================
   FOUNDATION JAVASCRIPT
   Core navigation + socket system
   ======================================== */

/* ========================================
   STATE MANAGEMENT
   ======================================== */
let x = 0, y = 0;
let isNavigating = false;
let idleTimer = null;
let touchStartX = 0, touchStartY = 0;

/* Elements */
const card = document.getElementById('card');
const coord = document.getElementById('coord');
const bgFar = document.getElementById('bg-far');
const bgMid = document.getElementById('bg-mid');
const bgNear = document.getElementById('bg-near');
const posDisplay = document.getElementById('pos');
const sizeDisplay = document.getElementById('size');

/* ========================================
   CARD NAVIGATION SYSTEM
   ======================================== */

function navigate(dx, dy) {
    if (isNavigating || card.classList.contains('flipped')) return;
    
    isNavigating = true;
    x += dx;
    y += dy;
    
    /* Determine slide direction */
    let slideOut, slideIn;
    if (dx > 0) {
        slideOut = 'slide-out-left';
        slideIn = 'slide-in-right';
    } else if (dx < 0) {
        slideOut = 'slide-out-right';
        slideIn = 'slide-in-left';
    } else if (dy > 0) {
        slideOut = 'slide-out-down';
        slideIn = 'slide-in-up';
    } else {
        slideOut = 'slide-out-up';
        slideIn = 'slide-in-down';
    }
    
    /* Multi-layer parallax */
    const farX = x * 8, farY = y * 8;
    const midX = x * 16, midY = y * 16;
    const nearX = x * 24, nearY = y * 24;
    
    bgFar.style.transform = `translate(${-farX}px, ${-farY}px) scale(1.05)`;
    bgMid.style.transform = `translate(${-midX}px, ${-midY}px)`;
    bgNear.style.transform = `translate(${-nearX}px, ${-nearY}px)`;
    
    /* Card transition */
    card.classList.add(slideOut);
    
    setTimeout(() => {
        coord.textContent = `${x}, ${y}`;
        posDisplay.textContent = `${x}, ${y}`;
        card.classList.remove(slideOut);
        card.classList.add(slideIn);
        
        setTimeout(() => {
            card.classList.remove(slideIn);
            isNavigating = false;
            startIdleTimer();
        }, 400);
    }, 400);
}

/* Card flip */
function flipCard() {
    card.classList.toggle('flipped');
    if (card.classList.contains('flipped')) {
        clearTimeout(idleTimer);
    } else {
        startIdleTimer();
    }
}

/* Auto-focus timer (optional - comment out to disable) */
function startIdleTimer() {
    clearTimeout(idleTimer);
    card.classList.remove('focused');
    sizeDisplay.textContent = 'Small';
    
    /* Uncomment to enable auto-zoom after 15 seconds */
    // idleTimer = setTimeout(() => {
    //     if (!isNavigating && !card.classList.contains('flipped')) {
    //         card.classList.add('focused');
    //         sizeDisplay.textContent = 'Focused';
    //     }
    // }, 15000);
}

/* ========================================
   INPUT HANDLING
   ======================================== */

/* Keyboard */
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigate(-1, 0);
    if (e.key === 'ArrowRight') navigate(1, 0);
    if (e.key === 'ArrowUp') navigate(0, -1);
    if (e.key === 'ArrowDown') navigate(0, 1);
    if (e.key === ' ') { e.preventDefault(); flipCard(); }
});

/* Touch */
document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    const deltaY = e.changedTouches[0].screenY - touchStartY;
    const minSwipe = 60;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipe) {
        navigate(deltaX > 0 ? -1 : 1, 0);
    } else if (Math.abs(deltaY) > minSwipe) {
        navigate(0, deltaY > 0 ? -1 : 1);
    }
});

/* ========================================
   SOCKET DRAGGING SYSTEM
   ======================================== */

document.querySelectorAll('.socket').forEach(socket => {
    let isDragging = false;
    let startX, startY;

    socket.addEventListener('mousedown', start);
    socket.addEventListener('touchstart', start);

    function start(e) {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX - socket.offsetLeft;
        startY = touch.clientY - socket.offsetTop;
        socket.style.cursor = 'grabbing';
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move);

    function move(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        socket.style.left = (touch.clientX - startX) + 'px';
        socket.style.top = (touch.clientY - startY) + 'px';
    }

    document.addEventListener('mouseup', () => {
        isDragging = false;
        socket.style.cursor = 'move';
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
});

/* ========================================
   COMPONENT LOADER (for future use)
   Uncomment when ready to load components
   ======================================== */

/*
async function loadComponent(name, socketId) {
    try {
        const response = await fetch(`components/${name}.html`);
        const html = await response.text();
        const socket = document.getElementById(socketId);
        socket.innerHTML = html;
        socket.style.border = 'none';
        socket.style.background = 'transparent';
    } catch (err) {
        console.error(`Failed to load ${name}:`, err);
    }
}

// Example usage:
// loadComponent('settings-panel', 'socket-settings');
// loadComponent('wallet-pog', 'socket-profile');
*/

/* Initialize */
startIdleTimer();