/**
 * 移动端全屏视频播放器。
 *
 * 移动端没有「页签」可用（思源 addTab 被裁掉），思播插件开在右侧面板里会被
 * 图库浮层盖住，所以这里直接用原生 <video controls playsinline> 播放。
 *
 * 手势：
 * - 上滑退出（拖动过程中跟随手指上移并淡出，松手超过阈值才真正关闭）
 * - 左右拖动调进度（拖动时只做预览，松手才 seek，避免大文件反复请求）
 */
let playerEl = null;

const SWIPE_CLOSE_DISTANCE = 80;
const CONTROLS_GUARD = 64;      // 底部原生控件区域，不接手势
const GESTURE_SLOP = 8;

const formatTime = (d) => {
    if (!isFinite(d) || d < 0) {
        return '00:00';
    }
    const total = Math.floor(d);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const closeMobilePlayer = () => {
    if (!playerEl) {
        return;
    }
    const video = playerEl.querySelector('video');
    if (video) {
        try {
            video.pause();
            video.removeAttribute('src');
            video.load();
        } catch (e) {
            // ignore
        }
    }
    playerEl.remove();
    playerEl = null;
};

const bindGestures = (wrap, video, hud) => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let targetTime = 0;
    let mode = null;            // null | 'seek' | 'dismiss'
    let tracking = false;

    const showHud = (text) => {
        hud.textContent = text;
        hud.classList.add('sppl-mobile-player__hud--show');
    };

    const hideHud = () => {
        hud.classList.remove('sppl-mobile-player__hud--show');
    };

    const resetTransform = () => {
        wrap.style.transition = 'transform .18s ease, opacity .18s ease';
        wrap.style.transform = '';
        wrap.style.opacity = '';
    };

    const onStart = (e) => {
        if (e.touches.length !== 1) {
            return;
        }
        const touch = e.touches[0];
        const rect = wrap.getBoundingClientRect();
        // 避开底部原生控件条，否则会和进度条拖动冲突
        if (touch.clientY > rect.bottom - CONTROLS_GUARD) {
            return;
        }
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = video.currentTime || 0;
        targetTime = startTime;
        mode = null;
        tracking = true;
    };

    const onMove = (e) => {
        if (!tracking || e.touches.length !== 1) {
            return;
        }
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        if (!mode) {
            if (Math.abs(dx) < GESTURE_SLOP && Math.abs(dy) < GESTURE_SLOP) {
                return;
            }
            mode = Math.abs(dx) > Math.abs(dy) ? 'seek' : 'dismiss';
            wrap.style.transition = 'none';
        }

        if (e.cancelable) {
            e.preventDefault();
        }

        if (mode === 'seek') {
            const duration = isFinite(video.duration) ? video.duration : 0;
            const width = wrap.clientWidth || 1;
            targetTime = Math.max(0, Math.min(duration, startTime + (dx / width) * duration));
            const delta = Math.round(targetTime - startTime);
            const sign = delta > 0 ? '+' : '';
            showHud(`${sign}${delta}s   ${formatTime(targetTime)} / ${formatTime(duration)}`);
            return;
        }

        // 只允许向上拖，向下不关闭，避免误触
        const offset = Math.min(0, dy);
        wrap.style.transform = `translateY(${offset}px)`;
        wrap.style.opacity = String(Math.max(0.35, 1 + offset / 360));
    };

    const finish = (e) => {
        if (!tracking) {
            return;
        }
        tracking = false;
        const touch = (e.changedTouches && e.changedTouches[0]) || null;

        if (mode === 'seek') {
            video.currentTime = targetTime;
            hideHud();
            wrap.style.transition = '';
            mode = null;
            return;
        }

        if (mode === 'dismiss') {
            const dy = touch ? touch.clientY - startY : 0;
            const dx = touch ? touch.clientX - startX : 0;
            if (dy < -SWIPE_CLOSE_DISTANCE && Math.abs(dy) > Math.abs(dx)) {
                closeMobilePlayer();
                return;
            }
            resetTransform();
        }
        mode = null;
    };

    wrap.addEventListener('touchstart', onStart, { passive: true });
    wrap.addEventListener('touchmove', onMove, { passive: false });
    wrap.addEventListener('touchend', finish);
    wrap.addEventListener('touchcancel', finish);
};

export const openMobilePlayer = (url, title) => {
    closeMobilePlayer();
    // 打开播放器前把图库里可能正在播的预览视频停掉
    document.querySelectorAll('.sppl-mobile-overlay video').forEach((v) => {
        try { v.pause(); } catch (e) { /* ignore */ }
    });

    const wrap = document.createElement('div');
    wrap.className = 'sppl-mobile-player';
    wrap.innerHTML = `<div class="sppl-mobile-player__bar">
        <span class="sppl-mobile-player__btn" data-action="back"><svg><use xlink:href="#iconLeft"></use></svg></span>
        <span class="sppl-mobile-player__title"></span>
    </div>
    <video class="sppl-mobile-player__video" controls playsinline webkit-playsinline preload="metadata"></video>
    <div class="sppl-mobile-player__hud"></div>`;

    wrap.querySelector('.sppl-mobile-player__title').textContent = title || '';
    wrap.querySelector('[data-action="back"]').setAttribute('aria-label', '返回');
    wrap.querySelector('[data-action="back"]').addEventListener('click', closeMobilePlayer);
    // 点空白区域也能退出
    wrap.addEventListener('click', (e) => {
        if (e.target === wrap) {
            closeMobilePlayer();
        }
    });

    const video = wrap.querySelector('video');
    video.src = url;

    document.body.appendChild(wrap);
    playerEl = wrap;

    bindGestures(wrap, video, wrap.querySelector('.sppl-mobile-player__hud'));

    const played = video.play();
    if (played && typeof played.catch === 'function') {
        // 浏览器拦截自动播放时保持 controls 可用，用户点一下即可
        played.catch(() => { });
    }

    return wrap;
};
