/* ================================================
       NOWOS JS CORE

       ZOOM STATE MACHINE:
         'zoomed'    → landed, reading the card
         'traveling' → in motion between cards

       NAVIGATE FLOW:
         1. If zoomed → immediately set traveling (zoom out)
         2. Wait for zoom-out transition to settle (~zoom-spd)
         3. Slide card out + shift background
         4. Swap card content
         5. Slide card in
         6. Start 10s idle timer → zoomed on expire
         7. Tap → immediate zoomed

       BACKGROUND PARALLAX DIRECTION:
         Moving left  → background shifts left  (ground moving with you)
         Moving right → background shifts right
         Moving up    → background scales slightly larger (approaching)
         Moving down  → background scales slightly smaller (receding)
    ================================================ */

    const S = {
        x:0, y:0,
        nav:false,
        invert:false,
        state:'zoomed',      /* 'zoomed' | 'traveling' */
        idleT:null,
        t0:Date.now(),
        RT:28800000, DEMO:120000, demo:false,
        stars:true, pulse:true,
        /* bg scale accumulates for up/down depth feel */
        bgScale:1,
    };

    const el = id => document.getElementById(id);
    const card      = el('card');
    const zoomWrap  = el('zoom-wrap');
    const coord     = el('coord');
    const cardNode  = el('card-node');
    const bgPlanet  = el('bg-planet');
    const bgHaze    = el('bg-haze');
    const sky       = el('sky');
    const starEl    = el('star');
    const shadow    = el('light-shadow');
    const shine     = el('card-shine');
    const hudPos    = el('hud-pos');
    const terrCvs   = el('terrain-canvas');
    const starCvs   = el('star-canvas');
    const tCtx      = terrCvs.getContext('2d');
    const sCtx      = starCvs.getContext('2d');
    const root      = document.documentElement;

    /* ---- CARD SIZING ---- */
    function sizeCard() {
        const vw=window.innerWidth, vh=window.innerHeight;
        const base=Math.min(vw*0.58,vh*0.48,280);
        root.style.setProperty('--card-w', Math.round(base)+'px');
        root.style.setProperty('--card-h', Math.round(base*1.4)+'px');
        /* Focused size: leaves ~15% breathing room on each side */
        const fw=Math.round(Math.min(vw*0.70,vh*0.62,420));
        root.style.setProperty('--card-fw', fw+'px');
        root.style.setProperty('--card-fh', Math.round(fw*1.4)+'px');
    }

    /* ---- ZOOM STATE ---- */
    function setZoom(state) {
        S.state = state;
        zoomWrap.classList.toggle('zoomed',    state==='zoomed');
        zoomWrap.classList.toggle('traveling', state==='traveling');
    }

    function zoomSpd() {
        return parseFloat(getComputedStyle(root).getPropertyValue('--zoom-spd'))*1000||550;
    }

    function navSpd() {
        return parseFloat(getComputedStyle(root).getPropertyValue('--nav-spd'))*1000||420;
    }

    /* Start idle timer → auto zoom-in after 10s */
    function startIdle() {
        clearTimeout(S.idleT);
        S.idleT = setTimeout(()=>{
            if(!S.nav && !card.classList.contains('flipped')) setZoom('zoomed');
        }, 10000);
    }

    /* ---- NAVIGATE ---- */
    function navigate(dx, dy) {
        if (S.nav) return;
        if (card.classList.contains('flipped')) return;

        S.nav = true;
        clearTimeout(S.idleT);

        const nx = S.invert ? -dx : dx;
        const ny = S.invert ? -dy : dy;

        /* Step 1: zoom out to traveling state */
        setZoom('traveling');

        const doTravel = () => {
            S.x += nx; S.y += ny;

            /* Background parallax
               Left/right: terrain drifts with movement (ground under you)
               Up:   scale terrain slightly up (moving forward = things get closer)
               Down: scale terrain slightly down (pulling back) */
            const bx = S.x * 14;
            const by = S.y * 14;

            /* Accumulate subtle scale for forward/back depth */
            if (dy !== 0) {
                S.bgScale = Math.max(0.82, Math.min(1.22, S.bgScale + (-dy * 0.04)));
            }

            bgPlanet.style.transform =
                `translate(${-bx}px,${-by}px) scale(${S.bgScale})`;
            bgHaze.style.transform =
                `translate(${-bx*0.6}px,${-by*0.6}px)`;

            /* Slide direction
               Left = move left  → old card exits left,  new enters from right
               Right = move right → old card exits right, new enters from left
               Up = move forward  → old card shrinks away up, new arrives from below (closer)
               Down = move back   → old card grows away down, new arrives from above (farther) */
            const [oC,iC] =
                nx>0?['out-l','in-r']:
                nx<0?['out-r','in-l']:
                ny<0?['out-u','in-d']:   /* up = forward: card recedes up */
                     ['out-d','in-u'];   /* down = back:  card grows down */

            card.classList.add(oC);
            const spd = navSpd();

            setTimeout(()=>{
                coord.textContent    = `${S.x}, ${S.y}`;
                cardNode.textContent = `NODE · ${hex4(S.x,S.y)}`;
                hudPos.textContent   = `${S.x}, ${S.y}`;
                card.classList.remove(oC);
                card.classList.add(iC);
                setTimeout(()=>{
                    card.classList.remove(iC);
                    S.nav = false;
                    startIdle();
                }, spd);
            }, spd);
        };

        /* If already traveling just go immediately,
           if was zoomed wait for zoom-out to register */
        if (S.state === 'traveling') {
            doTravel();
        } else {
            setTimeout(doTravel, zoomSpd() * 0.6);
        }
    }

    function hex4(x,y) {
        return(((x&0xFF)<<8)|(y&0xFF)).toString(16).toUpperCase().padStart(4,'0');
    }

    /* ---- FLIP ---- */
    function flip() {
        if (S.nav) return;
        card.classList.toggle('flipped');
        card.classList.contains('flipped')
            ? clearTimeout(S.idleT)
            : startIdle();
    }

    /* ---- DAY/NIGHT ---- */
    function progress() {
        const dur = S.demo ? S.DEMO : S.RT;
        return ((Date.now()-S.t0) % dur) / dur;
    }

    function themeHue() {
        return parseInt(getComputedStyle(root).getPropertyValue('--terrain-hue'))||222;
    }

    function updateLight(ts) {
        const p=progress(), isDay=p<0.5;
        const dayP=p*2, ngtP=(p-0.5)*2;
        const arc=isDay?Math.sin(dayP*Math.PI):0;
        const H=themeHue();

        if(isDay){
            starEl.style.left   =`${-6+dayP*112}vw`;
            starEl.style.top    =`${84-arc*78}vh`;
            starEl.style.opacity=(0.15+arc*0.48).toFixed(3);
            const sz=Math.round(26+arc*18);
            starEl.style.width=sz+'px'; starEl.style.height=sz+'px';
        } else {
            starEl.style.opacity='0';
        }

        let skyBg='';
        if(isDay){
            if(dayP<0.13){
                const t=dayP/0.13;
                skyBg=`linear-gradient(to bottom,hsla(${H-178},68%,44%,${(0.17*t).toFixed(3)}) 0%,transparent 72%)`;
            } else if(dayP>0.87){
                const t=(dayP-0.87)/0.13;
                skyBg=`linear-gradient(to bottom,hsla(${H-198},72%,38%,${(0.17*t).toFixed(3)}) 0%,transparent 72%)`;
            } else {
                const m=Math.sin((dayP-0.13)/0.74*Math.PI);
                skyBg=`linear-gradient(to bottom,hsla(${H},48%,50%,${(0.07*m).toFixed(3)}) 0%,transparent 78%)`;
            }
        } else {
            const pulse=S.pulse?(0.07+Math.sin(ts*0.00036)*0.032).toFixed(3):'0.07';
            skyBg=`radial-gradient(ellipse at 50% 40%,hsla(${H},48%,24%,${pulse}) 0%,transparent 65%)`;
        }
        sky.style.background=skyBg;

        if(isDay){
            const ang=88+dayP*184, str=(0.022+arc*0.062).toFixed(3);
            shadow.style.background=`linear-gradient(${ang}deg,rgba(0,0,0,${str}) 0%,transparent 52%)`;
            shine.style.background=`radial-gradient(ellipse at ${(dayP*100).toFixed(1)}% 24%,rgba(255,245,190,${(arc*0.05).toFixed(3)}) 0%,transparent 50%)`;
            shine.style.opacity='1';
        } else {
            shadow.style.background='none';
            shine.style.opacity='0';
        }

        const starA=isDay?Math.max(0,1-dayP*7).toFixed(3):Math.min(1,ngtP*4).toFixed(3);
        starCvs.style.opacity=S.stars?starA:'0';
    }

    /* ---- TERRAIN ---- */
    const BLOBS=[];

    function initBlobs(){
        BLOBS.length=0;
        const H=themeHue();
        for(let i=0;i<14;i++){
            BLOBS.push({
                x:Math.random(), y:0.28+Math.random()*0.72,
                rx:0.06+Math.random()*0.19, ry:0.032+Math.random()*0.10,
                spd:(0.11+Math.random()*0.36)*(Math.random()<.5?1:-1),
                ph:Math.random()*Math.PI*2,
                a:0.028+Math.random()*0.046,
                dh:Math.floor(Math.random()*36)-18, H,
            });
        }
    }

    function drawTerrain(ts){
        const W=terrCvs.width,H=terrCvs.height;
        tCtx.clearRect(0,0,W,H);
        for(const b of BLOBS){
            const ang=ts*0.000030*b.spd+b.ph;
            const bx=((b.x+Math.cos(ang)*0.04+1)%1)*W;
            const by=(b.y+Math.sin(ang*0.6)*0.022)*H;
            const hue=b.H+b.dh, sc=b.ry/b.rx;
            const g=tCtx.createRadialGradient(bx,by,0,bx,by,b.rx*W);
            g.addColorStop(0,`hsla(${hue},50%,44%,${b.a})`);
            g.addColorStop(0.5,`hsla(${hue},36%,28%,${(b.a*0.35).toFixed(3)})`);
            g.addColorStop(1,'transparent');
            tCtx.save();
            tCtx.transform(1,0,0,sc,0,by*(1-sc));
            tCtx.fillStyle=g;
            tCtx.beginPath();
            tCtx.arc(bx,by/sc,b.rx*W,0,Math.PI*2);
            tCtx.fill();
            tCtx.restore();
        }
    }

    /* ---- STARS ---- */
    const STARS=[];

    function initStars(){
        STARS.length=0;
        for(let i=0;i<280;i++){
            STARS.push({
                x:Math.random(), y:Math.random()*0.70,
                r:0.2+Math.random()*1.0,
                l:0.3+Math.random()*0.7,
                tw:0.0008+Math.random()*0.0024,
                ph:Math.random()*Math.PI*2,
            });
        }
    }

    function drawStars(ts){
        const W=starCvs.width,H=starCvs.height;
        sCtx.clearRect(0,0,W,H);
        for(const s of STARS){
            const tw=S.pulse?0.30+Math.sin(ts*s.tw+s.ph)*0.70:0.70;
            const a=s.l*tw;
            const sx=s.x*W,sy=s.y*H;
            sCtx.beginPath();
            sCtx.arc(sx,sy,s.r,0,Math.PI*2);
            sCtx.fillStyle=`rgba(210,224,255,${a.toFixed(3)})`;
            sCtx.fill();
            if(s.l>0.66&&tw>0.60){
                sCtx.strokeStyle=`rgba(210,224,255,${(a*0.26).toFixed(3)})`;
                sCtx.lineWidth=0.5;
                sCtx.beginPath();
                sCtx.moveTo(sx-s.r*3.5,sy);sCtx.lineTo(sx+s.r*3.5,sy);
                sCtx.moveTo(sx,sy-s.r*3.5);sCtx.lineTo(sx,sy+s.r*3.5);
                sCtx.stroke();
            }
        }
    }

    /* ---- INPUT ---- */
    document.addEventListener('keydown',e=>{
        const map={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
        if(map[e.key]){e.preventDefault();navigate(...map[e.key]);}
        if(e.key===' '||e.key==='f'||e.key==='F'){e.preventDefault();flip();}
    });

    let tx=0,ty=0;
    document.addEventListener('touchstart',e=>{
        tx=e.changedTouches[0].screenX; ty=e.changedTouches[0].screenY;
    },{passive:true});

    document.addEventListener('touchend',e=>{
        const dx=e.changedTouches[0].screenX-tx;
        const dy=e.changedTouches[0].screenY-ty;
        if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50) navigate(dx>0?-1:1,0);
        else if(Math.abs(dy)>50) navigate(0,dy>0?1:-1);
    },{passive:true});

    /* Tap card → zoom in immediately */
    card.addEventListener('click',()=>{
        if(S.nav) return;
        if(S.state==='traveling'||S.state!=='zoomed'){
            clearTimeout(S.idleT);
            setZoom('zoomed');
        } else {
            flip();
        }
    });

    el('s-flip').addEventListener('click',function(){if(!this.__drag)flip();});

    /* ---- SOCKET DRAGGING ---- */
    document.querySelectorAll('.socket').forEach(sock=>{
        let ox=0,oy=0;
        const gp=e=>e.touches
            ?{x:e.touches[0].clientX,y:e.touches[0].clientY}
            :{x:e.clientX,y:e.clientY};
        const down=e=>{
            sock.__drag=false;
            const p=gp(e),r=sock.getBoundingClientRect();
            ox=p.x-r.left; oy=p.y-r.top;
            const move=e2=>{
                sock.__drag=true;e2.preventDefault();
                const p2=gp(e2);
                sock.style.left=`${p2.x-ox}px`;
                sock.style.top=`${p2.y-oy}px`;
                sock.style.right='auto';sock.style.bottom='auto';
            };
            const up=()=>{
                window.removeEventListener('mousemove',move);
                window.removeEventListener('touchmove',move);
                window.removeEventListener('mouseup',up);
                window.removeEventListener('touchend',up);
                setTimeout(()=>{sock.__drag=false;},60);
            };
            window.addEventListener('mousemove',move);
            window.addEventListener('touchmove',move,{passive:false});
            window.addEventListener('mouseup',up);
            window.addEventListener('touchend',up);
        };
        sock.addEventListener('mousedown',down);
        sock.addEventListener('touchstart',down,{passive:true});
    });

    /* ---- INIT + LOOP ---- */
    function resize(){
        const w=window.innerWidth,h=window.innerHeight;
        terrCvs.width=starCvs.width=w;
        terrCvs.height=starCvs.height=h;
        sizeCard();
    }

    window.addEventListener('resize',()=>{resize();initStars();initBlobs();});
    resize(); initStars(); initBlobs();
    setZoom('zoomed');
    startIdle();

    function loop(ts){
        updateLight(ts);
        drawTerrain(ts);
        drawStars(ts);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
    /* ================================================
       SKIN API (call from settings plugin):

       Card texture:
         root.style.setProperty('--card-skin-url','url("tex.jpg")')

       Background image:
         root.style.setProperty('--bg-skin-url','url("bg.jpg")')

       Theme:
         root.dataset.theme = 'ember' | 'void' | 'bio' | ''

       Fast cycle for testing:
         S.demo = true; S.t0 = Date.now();
    ================================================ */
