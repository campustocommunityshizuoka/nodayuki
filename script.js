/* ============================================================
   YUKI NODA PORTFOLIO — script.js (lightweight)
   ============================================================ */

'use strict';

document.body.classList.add('loaded');

/* QR library is loaded only when the business card is opened */
function loadQRLib(cb) {
    if (window.__qrLoading) { window.__qrLoading.push(cb); return; }
    window.__qrLoading = [cb];
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.async = true;
    s.onload = () => { window.__qrLoading.forEach(f => f()); };
    document.head.appendChild(s);
}

/* ============================================================
   TYPEWRITER label — show text immediately
   ============================================================ */
(function initLabel() {
    const el = document.querySelector('.hero-label-typewriter');
    if (el && el.dataset.text) el.textContent = el.dataset.text;
})();

/* ============================================================
   SCROLL — header state, progress bar, section dots (one rAF-throttled handler)
   ============================================================ */
(function initScroll() {
    const header = document.getElementById('header');
    const bar = document.getElementById('scrollProgress');
    const links = Array.from(document.querySelectorAll('.section-nav a'));
    const sections = links.map(l => document.querySelector(l.getAttribute('href')));
    let ticking = false;

    function update() {
        ticking = false;
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 60);
        if (bar) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (total > 0 ? y / total : 0) + ')';
        }
        if (links.length) {
            const trigger = y + window.innerHeight * 0.35;
            let active = 0;
            sections.forEach((sec, i) => { if (sec && sec.offsetTop <= trigger) active = i; });
            links.forEach((l, i) => l.classList.toggle('active', i === active));
        }
    }
    function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
})();

/* ============================================================
   SCROLL REVEAL — IntersectionObserver (one-shot)
   ============================================================ */
(function initReveal() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('visible'));
        return;
    }
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
   SMOOTH SCROLL for anchor links
   ============================================================ */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.getElementById(link.getAttribute('href').slice(1));
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
    card.addEventListener('click', () => card.classList.toggle('flipped'));
})();


/* ============================================================
   HERO PRIMARY CTA — vCard direct link (static .vcf file)
   ============================================================ */
(function initHeroSaveContact() {
    const btn = document.getElementById('heroSaveContactBtn');
    if (!btn) return;

    function ensureToast() {
        let toast = document.getElementById('globalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.className = 'global-toast';
            document.body.appendChild(toast);
        }
        return toast;
    }

    function showToast(msg) {
        const toast = ensureToast();
        toast.innerHTML = '<span class="global-toast-check">✓</span><span>' + msg + '</span>';
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
    }

    // Detect Android — show different toast message
    const isAndroid = /Android/i.test(navigator.userAgent);

    btn.addEventListener('click', () => {
        // The anchor's href + download attr handles the actual download.
        // We only add toast feedback + visual confirmation.
        if (isAndroid) {
            showToast('ダウンロード → 連絡先アプリで開いてください');
        } else {
            showToast('連絡先に追加しました');
        }
        btn.style.transform = 'scale(0.96)';
        setTimeout(() => { btn.style.transform = ''; }, 250);
    });
})();


/* ============================================================
   PROJECTS DETAIL MODAL — Open from Works card
   ============================================================ */
(function initProjectsModal() {
    const trigger = document.getElementById('projectsCardBtn');
    const modal   = document.getElementById('projectsModal');
    if (!trigger || !modal) return;

    function open() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    trigger.addEventListener('click', open);
    modal.querySelectorAll('[data-projects-close]').forEach(el => {
        el.addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
})();


/* ============================================================
   ARCHIVE FILTER — tabs + grid
   ============================================================ */
(function initArchiveFilter() {
    const tabs  = document.querySelectorAll('.archive-tab');
    const cards = document.querySelectorAll('.archive-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            tabs.forEach(t => {
                t.classList.toggle('active', t === tab);
                t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
            });
            cards.forEach(card => {
                const status = card.dataset.status;
                const show = filter === 'all' || filter === status;
                card.classList.toggle('is-hidden', !show);
            });
        });
    });
})();


/* ============================================================
   DIGITAL BUSINESS CARD — Modal, vCard, Share, QR
   ============================================================ */
(function initBusinessCard() {
    const fab     = document.getElementById('bcardFab');
    const modal   = document.getElementById('bcardModal');
    if (!modal) return;

    const saveBtn  = document.getElementById('bcardSaveBtn');
    const shareBtn = document.getElementById('bcardShareBtn');
    const copyBtn  = document.getElementById('bcardCopyBtn');
    const ctaBtn   = document.getElementById('bcardCtaBtn');
    const toast    = document.getElementById('bcardToast');
    const qrEl     = document.getElementById('bcardQR');

    const SITE_URL = 'https://noda.omusubi-machi.com/';

    function openModal() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        generateQR();
    }
    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (fab)    fab.addEventListener('click', openModal);
    if (ctaBtn) ctaBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-bcard-close]').forEach(el => {
        el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    // ===== QR generation — embed full vCard data =====
    // QR with vCard content lets the user's camera app directly trigger
    // "Add to Contacts" without going through the website at all.
    let qrGenerated = false;
    function generateQR() {
        if (qrGenerated || !qrEl) return;
        if (typeof qrcode === 'undefined') {
            loadQRLib(generateQR);
            return;
        }
        try {
            // Use a streamlined vCard for QR (keep payload small for legibility)
            const vcardForQR = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                'FN:野田 悠生',
                'N:野田;悠生;;;',
                'ORG:合同会社Omusubi',
                'TITLE:代表社員',
                'EMAIL:office.noda.yuki@gmail.com',
                'URL:' + SITE_URL,
                'NOTE:合同会社Omusubi 代表社員 / Grow Up Academy 理事 / JOINX 学生事業部',
                'END:VCARD'
            ].join('\r\n');

            // Higher type number for vCard data (more capacity)
            const qr = qrcode(0, 'M');
            qr.addData(vcardForQR);
            qr.make();
            qrEl.innerHTML = qr.createSvgTag({ scalable: true, cellSize: 4, margin: 1 });
            qrGenerated = true;
        } catch (e) {
            // Fallback to URL-only QR if vCard payload exceeds QR capacity
            try {
                const qr = qrcode(0, 'M');
                qr.addData(SITE_URL);
                qr.make();
                qrEl.innerHTML = qr.createSvgTag({ scalable: true, cellSize: 4, margin: 1 });
                qrGenerated = true;
            } catch (e2) {
                console.warn('QR gen failed:', e2);
            }
        }
    }

    // ===== Toast helper =====
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ===== vCard download =====
    function buildVCard() {
        const note = [
            '合同会社Omusubi 代表社員',
            '一般社団法人 Grow Up Academy 理事',
            '株式会社JOINX 学生事業部',
            '静岡大学 工学部 機械工学科'
        ].join(' / ');
        return [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'FN:野田 悠生',
            'N:野田;悠生;;;',
            'X-PHONETIC-FIRST-NAME:ユウキ',
            'X-PHONETIC-LAST-NAME:ノダ',
            'ORG:合同会社Omusubi',
            'TITLE:代表社員 / Co-Founder',
            'ROLE:合同会社Omusubi 代表社員 ; Grow Up Academy 理事 ; JOINX 学生事業部',
            'EMAIL;TYPE=WORK:office.noda.yuki@gmail.com',
            'URL:' + SITE_URL,
            'URL;TYPE=Organization:https://omusubi-machi.com/',
            'URL;TYPE=Instagram:https://www.instagram.com/noda.yu_ki',
            'ADR;TYPE=WORK:;;;Shizuoka;;;Japan',
            'NOTE:' + note,
            'END:VCARD'
        ].join('\r\n');
    }

    // Save button is now an anchor pointing to /yuki-noda.vcf (static file).
    // Just add toast feedback — actual download is handled by href + download attr.
    if (saveBtn) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        saveBtn.addEventListener('click', () => {
            if (isAndroid) {
                showToast('ダウンロード → 連絡先アプリで開いてください');
            } else {
                showToast('連絡先に追加しました ✓');
            }
        });
    }

    // ===== Share =====
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Yuki Noda | Portfolio',
                text:  '野田 悠生 (Yuki Noda) — 合同会社Omusubi 代表社員',
                url:   SITE_URL
            };
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (e) {
                    if (e.name !== 'AbortError') showToast('シェアできませんでした');
                }
            } else {
                // Fallback: copy URL
                try {
                    await navigator.clipboard.writeText(SITE_URL);
                    showToast('URLをコピーしました ✓');
                } catch (e) {
                    showToast('シェアに対応していません');
                }
            }
        });
    }

    // ===== Copy URL =====
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(SITE_URL);
                showToast('URLをコピーしました ✓');
            } catch (e) {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = SITE_URL;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('URLをコピーしました ✓');
            }
        });
    }
})();
