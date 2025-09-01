/* This script has been cleaned to remove redundant CSS assignments */
(() => {
    const canvas = document.getElementById('bg');
    if (!canvas) {
        console.warn('No #bg canvas found.');
        return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
        console.warn('No 2D context.');
        return;
    }

    const SETTINGS = {
        countBase: 200,
        densityFactor: 0.00022,
        sizeMin: 1.2,
        sizeMax: 3.6,
        speedY: [-0.90, -0.35],
        speedX: [-0.25, 0.25],
        lifeMin: 3.8,
        lifeMax: 7.8,
        glowBlur: 24,
        flickerFreqMin: 1.2,
        flickerFreqMax: 2.2,
        flareChance: 0.015,
        flareBoost: 1.6,
        USE_DEST_OUT_TRAILS: false,
        tailFade: 0.10,
        veilAlpha: 0.035
    };

    const DPR_MAX = 2;
    let DPR = 1, W = 0, H = 0, lastTs = 0, running = true;
    const particles = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function spawnParticle() {
        return {
            x: Math.random() * W,
            y: H + Math.random() * 60, // Start particles from below the screen
            r: rand(SETTINGS.sizeMin, SETTINGS.sizeMax),
            vx: rand(SETTINGS.speedX[0], SETTINGS.speedX[1]),
            vy: rand(SETTINGS.speedY[0], SETTINGS.speedY[1]),
            life: 0,
            lifeMax: rand(SETTINGS.lifeMin, SETTINGS.lifeMax),
            seed: Math.random() * 1000,
            freq: rand(SETTINGS.flickerFreqMin, SETTINGS.flickerFreqMax),
            flare: 0
        };
    }

    function resize() {
        DPR = Math.min(DPR_MAX, window.devicePixelRatio || 1);
        W = Math.max(1, window.innerWidth);
        H = Math.max(1, window.innerHeight);

        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';

        const target = Math.round(SETTINGS.countBase + W * H * SETTINGS.densityFactor);
        if (particles.length > target) particles.length = target;
        while (particles.length < target) particles.push(spawnParticle());
    }

    function step(dt) {
        // Clear the canvas to allow the background image to show
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        for (const p of particles) {
            p.life += dt;
            if (p.life > p.lifeMax || p.y < -16 || p.x < -16 || p.x > W + 16) {
                Object.assign(p, spawnParticle());
                p.y = H + Math.random() * 60;
            }

            p.x += p.vx;
            p.y += p.vy;

            const t = p.life * p.freq + p.seed;
            const base = 0.65 + 0.35 * Math.sin(t * 6.283 + Math.sin(t * 2.7) * 0.7);
            if (Math.random() < SETTINGS.flareChance * dt) p.flare = 0.5;
            if (p.flare > 0) p.flare -= dt;
            const flare = p.flare > 0 ? SETTINGS.flareBoost : 1.0;

            const rNow = p.r * (0.9 + 0.35 * base) * flare;
            const blurNow = SETTINGS.glowBlur * (0.7 + 0.6 * base) * flare;

            const hotAlpha = 0.92 * (0.8 + 0.2 * base);
            const midAlpha = 0.55 * (0.8 + 0.2 * base);

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rNow * 2.2);
            grad.addColorStop(0.00, `rgba(255,230,160,${hotAlpha})`);
            grad.addColorStop(0.35, `rgba(255,170,70,${midAlpha})`);
            grad.addColorStop(1.00, `rgba(120,20,0,0)`);

            ctx.save();
            ctx.shadowBlur = blurNow;
            ctx.shadowColor = `rgba(255,120,30,${0.55 * (0.8 + 0.2 * base)})`;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rNow * 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function loop(ts) {
        if (!running) return;
        if (!lastTs) lastTs = ts;
        const dt = Math.min(0.05, (ts - lastTs) / 1000);
        lastTs = ts;
        step(dt);
        requestAnimationFrame(loop);
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    ctx.clearRect(0, 0, W, H);

    document.addEventListener('visibilitychange', () => {
        const wasRunning = running;
        running = !document.hidden;
        if (running && !wasRunning) {
            lastTs = 0;
            requestAnimationFrame(loop);
        }
    }, { passive: true });

    requestAnimationFrame(loop);

    window.embers = {
        count: () => particles.length,
        boost(n = 80) {
            for (let i = 0; i < n; i++) particles.push(spawnParticle());
        },
        fewer(n = 80) {
            particles.length = Math.max(0, particles.length - n);
        }
    };
})();