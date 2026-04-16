/* ============================================================
   YUKI NODA PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ============================================================
   LOADER
   ============================================================ */
(function initLoader() {
    const loader       = document.getElementById('loader');
    const loaderCount  = document.getElementById('loaderCount');
    const loaderBar    = document.getElementById('loaderBarFill');

    const DURATION = 1800;
    const startTime = performance.now();

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased    = easeOutCubic(progress);
        const count    = Math.floor(eased * 100);

        loaderCount.textContent = String(count).padStart(3, '0');
        loaderBar.style.width   = count + '%';

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.add('loaded');
            }, 350);
        }
    }

    requestAnimationFrame(tick);
})();


/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
    const dot      = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (!dot || !follower) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;
    let fX     = mouseX;
    let fY     = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    function animateFollower() {
        fX += (mouseX - fX) * 0.12;
        fY += (mouseY - fY) * 0.12;
        follower.style.left = fX + 'px';
        follower.style.top  = fY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Expand on interactive elements
    const interactives = document.querySelectorAll('a, button, .card, .btn-hero');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('hovered'));
        el.addEventListener('mouseleave', () => follower.classList.remove('hovered'));
    });

    // Cursor trail (pre-allocated pool)
    const TRAIL_SIZE = 18;
    const trailPool  = [];
    let trailIndex   = 0;
    for (let i = 0; i < TRAIL_SIZE; i++) {
        const d = document.createElement('div');
        d.className = 'cursor-trail-dot';
        d.style.opacity = '0';
        document.body.appendChild(d);
        trailPool.push(d);
    }

    document.addEventListener('mousemove', (e) => {
        const t = trailPool[trailIndex % TRAIL_SIZE];
        trailIndex++;
        t.style.left    = e.clientX + 'px';
        t.style.top     = e.clientY + 'px';
        t.style.opacity = '1';
        t.style.transform = 'translate(-50%, -50%) scale(1)';
        // Color shift inside space card
        const spaceCard = document.querySelector('.card--space');
        if (spaceCard) {
            const r = spaceCard.getBoundingClientRect();
            const inSpace = e.clientX > r.left && e.clientX < r.right
                         && e.clientY > r.top  && e.clientY < r.bottom;
            t.style.background = inSpace
                ? 'rgba(80,160,255,0.75)'
                : 'rgba(184,240,92,0.75)';
        }
        setTimeout(() => {
            t.style.opacity   = '0';
            t.style.transform = 'translate(-50%, -50%) scale(0.2)';
        }, 90);
    });
})();


/* ============================================================
   HEADER — scroll state
   ============================================================ */
(function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
(function initReveal() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Cascade tag float delays when about-tags becomes visible
                if (entry.target.classList.contains('about-tags')) {
                    entry.target.querySelectorAll('.about-tag').forEach((tag, i) => {
                        tag.style.transitionDelay = (i * 0.07 + 0.1) + 's';
                        tag.style.setProperty('--tf-dur',   (2.5 + Math.random() * 2) + 's');
                        tag.style.setProperty('--tf-delay', (Math.random() * 1.5) + 's');
                        tag.style.setProperty('--tf-lift',  -(3 + Math.random() * 6) + 'px');
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => observer.observe(el));
})();


/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    if (!counters.length) return;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function burstParticles(el) {
        const wrap  = el.closest('.stat-item') || el.parentElement;
        const COUNT = 16;
        const eRect = el.getBoundingClientRect();
        const wRect = wrap.getBoundingClientRect();
        wrap.style.position = 'relative';
        for (let i = 0; i < COUNT; i++) {
            const p = document.createElement('div');
            p.className = 'stat-burst-particle';
            const angle = (i / COUNT) * Math.PI * 2;
            const dist  = 28 + Math.random() * 45;
            p.style.cssText = [
                'left:' + (eRect.left - wRect.left + eRect.width  / 2) + 'px',
                'top:'  + (eRect.top  - wRect.top  + eRect.height / 2) + 'px',
                '--bx:' + (Math.cos(angle) * dist) + 'px',
                '--by:' + (Math.sin(angle) * dist) + 'px',
                '--bd:' + (0.4 + Math.random() * 0.35) + 's',
                'background:' + (Math.random() > 0.55 ? 'rgba(184,240,92,0.9)' : 'rgba(255,255,255,0.75)')
            ].join(';');
            wrap.appendChild(p);
            setTimeout(() => p.remove(), 850);
        }
        el.classList.add('bounce');
        setTimeout(() => el.classList.remove('bounce'), 340);
    }

    function animateCounter(el) {
        const target   = parseInt(el.dataset.target, 10);
        const DURATION = 1600;
        const start    = performance.now();

        function tick(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / DURATION, 1);
            el.textContent = Math.floor(easeOutQuart(progress) * target);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
                burstParticles(el);
            }
        }
        requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(el => observer.observe(el));
})();


/* ============================================================
   HERO — subtle mouse parallax on background SVG
   ============================================================ */
(function initHeroParallax() {
    const svg = document.getElementById('heroBgSvg');
    if (!svg) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        targetX  = (e.clientX - cx) / cx * 12;
        targetY  = (e.clientY - cy) / cy * 8;
    });

    function animateParallax() {
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;
        svg.style.transform = `translateY(-50%) rotate(${currentX * 0.5}deg) translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(animateParallax);
    }
    animateParallax();
})();


/* ============================================================
   MARQUEE — pause on hover (all tracks)
   ============================================================ */
(function initMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    if (!tracks.length) return;

    tracks.forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });
})();


/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();
/* ============================================================
   PROFILE FLIP CARD
   ============================================================ */
(function initProfileFlipCard() {
    const card = document.getElementById('profileFlipCard');
    if (!card) return;

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    // スマホ：タッチ対応
    card.addEventListener('touchend', (e) => {
        e.preventDefault();
        card.classList.toggle('flipped');
    }, { passive: false });
})();

/* ============================================================
   PARTICLE SYSTEM (leaves + orbs + sparkles)
   ============================================================ */
(function initParticleSystem() {
    const container = document.getElementById('leaf-container');
    if (!container) return;

    // Leaves
    for (let i = 0; i < 18; i++) {
        const el = document.createElement('div');
        el.className = 'leaf-item';
        const size = 10 + Math.random() * 15;
        const dur  = 8 + Math.random() * 7;
        const del  = Math.random() * 12;
        el.style.cssText = [
            'left:' + (Math.random() * 100) + '%',
            'width:' + size + 'px',
            'height:' + size + 'px',
            'opacity:' + (0.1 + Math.random() * 0.3),
            'animation:fall ' + dur + 's linear ' + del + 's infinite, sway 3s ease-in-out infinite alternate'
        ].join(';');
        container.appendChild(el);
    }

    // Glowing orbs
    for (let i = 0; i < 8; i++) {
        const el = document.createElement('div');
        el.className = 'particle-orb';
        const size = 4 + Math.random() * 8;
        const dur  = 10 + Math.random() * 8;
        const del  = Math.random() * 12;
        el.style.cssText = [
            'left:' + (Math.random() * 100) + '%',
            'width:' + size + 'px',
            'height:' + size + 'px',
            '--fall-dur:' + dur + 's',
            '--fall-delay:' + del + 's',
            '--pulse-dur:' + (1.8 + Math.random() * 2) + 's'
        ].join(';');
        container.appendChild(el);
    }

    // Sparkles
    for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = 'particle-sparkle';
        const size = 4 + Math.random() * 5;
        const dur  = 5 + Math.random() * 7;
        const del  = Math.random() * 14;
        el.style.cssText = [
            'left:' + (Math.random() * 100) + '%',
            'width:' + size + 'px',
            'height:' + size + 'px',
            '--fall-dur:' + dur + 's',
            '--fall-delay:' + del + 's',
            '--spin-dur:' + (0.6 + Math.random() * 0.9) + 's'
        ].join(';');
        container.appendChild(el);
    }
})();


/* ============================================================
   SPACE CARD — Rocket, Twinkling Stars
   ============================================================ */
(function initSpaceCard() {
    const card = document.querySelector('.card--space');
    if (!card) return;

    // Inject twinkling stars
    const starsBg = card.querySelector('.space-stars-bg');
    if (starsBg) {
        for (let i = 0; i < 55; i++) {
            const s = document.createElement('div');
            s.className = 'space-star';
            const size = 1 + Math.random() * 2.5;
            s.style.cssText = [
                'width:' + size + 'px',
                'height:' + size + 'px',
                'left:' + (Math.random() * 100) + '%',
                'top:' + (Math.random() * 100) + '%',
                '--twinkle-dur:' + (1.2 + Math.random() * 2.8) + 's',
                '--twinkle-delay:' + (Math.random() * 5) + 's',
                '--star-opacity:' + (0.4 + Math.random() * 0.6)
            ].join(';');
            starsBg.appendChild(s);
        }
    }

    // Rocket launch cycle
    const rocketWrap = card.querySelector('.space-rocket-wrap');
    if (!rocketWrap) return;

    function spawnExhaust() {
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const p = document.createElement('div');
                const angle = (Math.random() * 60 - 120) * (Math.PI / 180);
                const dist  = 15 + Math.random() * 30;
                p.style.cssText = [
                    'position:absolute',
                    'width:' + (3 + Math.random() * 5) + 'px',
                    'height:' + (3 + Math.random() * 5) + 'px',
                    'background:' + (Math.random() > 0.5 ? 'rgba(184,240,92,0.8)' : 'rgba(255,255,255,0.6)'),
                    'border-radius:50%',
                    'pointer-events:none',
                    'z-index:5',
                    'filter:blur(1px)',
                    'bottom:' + (Math.random() * 15) + 'px',
                    'left:' + (8 + Math.random() * 15) + 'px',
                    '--ex:' + (Math.cos(angle) * dist) + 'px',
                    '--ey:' + (Math.sin(angle) * dist) + 'px',
                    'animation:exhaustFade ' + (0.5 + Math.random() * 0.4) + 's ease-out forwards'
                ].join(';');
                card.appendChild(p);
                setTimeout(() => p.remove(), 950);
            }, i * 55);
        }
    }

    function launchRocket() {
        if (rocketWrap.classList.contains('launch')) return;
        card.classList.add('rocket-active');
        rocketWrap.classList.add('launch');
        spawnExhaust();
        rocketWrap.addEventListener('animationend', () => {
            rocketWrap.classList.remove('launch');
            card.classList.remove('rocket-active');
        }, { once: true });
    }

    function scheduleLaunch() {
        const delay = 6000 + Math.random() * 5000;
        setTimeout(() => {
            launchRocket();
            scheduleLaunch();
        }, delay);
    }

    // Only start when card is visible
    const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            scheduleLaunch();
            io.disconnect();
        }
    }, { threshold: 0.3 });
    io.observe(card);
})();


/* ============================================================
   CARD 3D TILT — Holographic Effect
   ============================================================ */
(function initCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards   = document.querySelectorAll('.card');
    const MAX_TILT = 8;
    const EASE     = 0.1;

    cards.forEach(card => {
        // Inject glare
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);

        let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
        let hovered = false;
        let rafId   = null;

        function loop() {
            cRX += (tRX - cRX) * EASE;
            cRY += (tRY - cRY) * EASE;
            card.style.transform = 'perspective(900px) rotateX(' + cRX + 'deg) rotateY(' + cRY + 'deg) scale3d(1.02,1.02,1.02)';
            if (hovered || Math.abs(cRX) > 0.05 || Math.abs(cRY) > 0.05) {
                rafId = requestAnimationFrame(loop);
            } else {
                card.style.transform = '';
                rafId = null;
            }
        }

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            tRY =  x * MAX_TILT * 2;
            tRX = -y * MAX_TILT;
            glare.style.setProperty('--gx', ((x + 0.5) * 100) + '%');
            glare.style.setProperty('--gy', ((y + 0.5) * 100) + '%');
        });

        card.addEventListener('mouseenter', () => {
            hovered = true;
            if (!rafId) rafId = requestAnimationFrame(loop);
        });

        card.addEventListener('mouseleave', () => {
            hovered = false;
            tRX = 0; tRY = 0;
            glare.style.setProperty('--gx', '50%');
            glare.style.setProperty('--gy', '50%');
            if (!rafId) rafId = requestAnimationFrame(loop);
        });
    });
})();


/* ============================================================
   HERO — Shooting Stars
   ============================================================ */
(function initShootingStars() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function spawnStar() {
        const star   = document.createElement('div');
        star.className = 'shooting-star';
        const length = 80 + Math.random() * 200;
        const angle  = -(12 + Math.random() * 28);
        const dur    = 0.8 + Math.random() * 0.9;
        star.style.cssText = [
            'width:' + length + 'px',
            'top:' + (Math.random() * 65) + '%',
            'left:' + (-5 + Math.random() * 75) + '%',
            '--ss-angle:' + angle + 'deg',
            '--ss-dur:' + dur + 's',
            '--ss-dist:' + (length + 90) + 'px'
        ].join(';');
        hero.appendChild(star);
        setTimeout(() => star.remove(), (dur + 0.15) * 1000);
    }

    function schedule() {
        spawnStar();
        setTimeout(schedule, 1800 + Math.random() * 3500);
    }
    setTimeout(schedule, 2800);
})();


/* ============================================================
   TYPEWRITER — Hero Label
   ============================================================ */
(function initTypewriter() {
    const el = document.querySelector('.hero-label-typewriter');
    if (!el) return;
    const text = el.dataset.text || '';
    let i = 0;

    function type() {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            setTimeout(type, 42 + Math.random() * 38);
        }
    }
    setTimeout(type, 2000);
})();


/* ============================================================
   GLITCH — Periodic on Hero Title
   ============================================================ */
(function initGlitch() {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    function trigger() {
        title.classList.add('glitching');
        setTimeout(() => title.classList.remove('glitching'), 390);
        setTimeout(trigger, 5000 + Math.random() * 9000);
    }
    setTimeout(trigger, 4200);
})();


/* ============================================================
   NAV SCRAMBLE — Matrix letter reveal on hover
   ============================================================ */
(function initNavScramble() {
    if (window.matchMedia('(hover: none)').matches) return;
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        const original = link.textContent;
        let rafId = null;

        link.addEventListener('mouseenter', () => {
            let iter = 0;
            const ITERS = original.length * 3;
            cancelAnimationFrame(rafId);

            function scramble() {
                link.textContent = original.split('').map((ch, i) => {
                    if (i < iter / 3) return original[i];
                    if (ch === ' ')   return ' ';
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                }).join('');
                iter++;
                if (iter < ITERS) rafId = requestAnimationFrame(scramble);
                else link.textContent = original;
            }
            rafId = requestAnimationFrame(scramble);
        });
    });
})();


/* ============================================================
   SPLIT CHARACTER REVEAL — Section Headings
   ============================================================ */
(function initSplitHeadings() {
    const headings = document.querySelectorAll('.section-title, .about-title, .contact-title');
    if (!headings.length) return;

    headings.forEach(h => {
        // Wrap each character in a span (preserve HTML tags like <em>/<br>)
        h.innerHTML = h.innerHTML.replace(/>([^<]+)</g, (match, text) => {
            const wrapped = [...text].map((c, i) => {
                if (c === ' ') return ' ';
                return '<span class="split-char" style="--ci:' + i + '">' + c + '</span>';
            }).join('');
            return '>' + wrapped + '<';
        });
        h.classList.add('split-heading');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('split-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    headings.forEach(h => observer.observe(h));
})();


/* ============================================================
   SCANLINE REVEAL — Section Entry
   ============================================================ */
(function initScanlines() {
    const sections = document.querySelectorAll('.about-section, .works-section, .contact-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scanline-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    sections.forEach(s => observer.observe(s));
})();