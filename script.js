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

    function animateCounter(el) {
        const target   = parseInt(el.dataset.target, 10);
        const DURATION = 1600;
        const start    = performance.now();

        function tick(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / DURATION, 1);
            el.textContent = Math.floor(easeOutQuart(progress) * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
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
   MARQUEE — pause on hover
   ============================================================ */
(function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
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
   FALLING LEAVES ANIMATION
   ============================================================ */
(function initFallingLeaves() {
    const container = document.getElementById('leaf-container');
    if (!container) return;

    const LEAF_COUNT = 30; // 葉の数

    for (let i = 0; i < LEAF_COUNT; i++) {
        createLeaf(container);
    }

    function createLeaf(target) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf-item';
        
        // ランダムな設定
        const startLeft = Math.random() * 100; // 開始位置（横）
        const animDuration = 8 + Math.random() * 7; // 落下速度 (8〜15秒)
        const animDelay = Math.random() * 10; // 開始の遅延
        const size = 10 + Math.random() * 15; // サイズ (10〜25px)

        leaf.style.left = startLeft + '%';
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        leaf.style.animation = `fall ${animDuration}s linear ${animDelay}s infinite, sway 3s ease-in-out infinite alternate`;
        
        // 少しずつ色を変える（自然なバリエーション）
        const opacity = 0.1 + Math.random() * 0.3;
        leaf.style.opacity = opacity;

        target.appendChild(leaf);
    }
})();