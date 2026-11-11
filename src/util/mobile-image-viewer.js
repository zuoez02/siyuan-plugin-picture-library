/**
 * 移动端大图预览（自建，替代 Element Plus 的 el-image-viewer）。
 *
 * 为什么不用 el-image-viewer：它只有左右按钮，没有触摸滑动、没有双指缩放，
 * 而且会把整个列表的 <img> 全部渲染出来。这里自己实现一层：
 * - 左右滑动切换上一张 / 下一张
 * - 上滑关闭
 * - 双指缩放（1x ~ 4x），放大后单指拖动查看
 * - 双击在 1x / 2.5x 之间切换
 */
import { showMessage } from 'siyuan';
import { openMobileActionSheet } from './mobile-actions';
import { copyText } from './clipboard';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_RATIO = 0.22;
const SWIPE_DISTANCE = 10;
const DISMISS_DISTANCE = 100;
const DOUBLE_TAP_DELAY = 300;

let viewerEl = null;
let stageEl = null;
let imgEl = null;
let counterEl = null;
let urls = [];
let index = 0;

let scale = 1;
let tx = 0;
let ty = 0;

let mode = null;          // null | swipe | dismiss | pan | pinch
let startX = 0;
let startY = 0;
let startAt = 0;
let panX = 0;
let panY = 0;
let pinch = null;
let lastTap = { at: 0, x: 0, y: 0 };

// 长按（按住不动 500ms）弹出操作菜单，替代桌面端的右键菜单
const LONG_PRESS_MS = 500;
const LONG_PRESS_TOLERANCE = 10;
let longPressTimer = null;
let longPressed = false;
let onDelete = null;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const applyTransform = (animate) => {
    if (!imgEl) {
        return;
    }
    imgEl.style.transition = animate ? 'transform .2s ease, opacity .2s ease' : 'none';
    imgEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    imgEl.style.opacity = '';
};

const clampPan = (animate) => {
    if (!stageEl) {
        return;
    }
    const rect = stageEl.getBoundingClientRect();
    const maxX = (rect.width * (scale - 1)) / 2;
    const maxY = (rect.height * (scale - 1)) / 2;
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);
    applyTransform(!!animate);
};

const resetZoom = (animate) => {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform(!!animate);
};

const updateCounter = () => {
    if (counterEl) {
        counterEl.textContent = `${index + 1} / ${urls.length}`;
    }
};

const preload = (i) => {
    const url = urls[i];
    if (url) {
        const img = new Image();
        img.src = url;
    }
};

const show = (nextIndex, offset) => {
    if (!imgEl || !urls.length) {
        return;
    }
    index = clamp(nextIndex, 0, urls.length - 1);
    imgEl.style.transition = 'none';
    imgEl.style.opacity = '0.35';
    imgEl.style.transform = `translate3d(${offset || 0}px, 0, 0) scale(1)`;
    imgEl.src = urls[index];
    updateCounter();
    preload(index + 1);
    preload(index - 1);
    requestAnimationFrame(() => {
        imgEl.style.transition = 'transform .18s ease, opacity .18s ease';
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
    scale = 1;
    tx = 0;
    ty = 0;
};

export const closeMobileImageViewer = () => {
    if (!viewerEl) {
        return;
    }
    viewerEl.remove();
    viewerEl = null;
    stageEl = null;
    imgEl = null;
    counterEl = null;
    urls = [];
    mode = null;
    pinch = null;
    scale = 1;
    tx = 0;
    ty = 0;
    clearLongPress();
    longPressed = false;
    onDelete = null;
};

const currentUrl = () => urls[index] || '';

const currentName = () => {
    const raw = (currentUrl().split('?')[0].split('/').pop()) || 'image';
    try {
        return decodeURIComponent(raw);
    } catch (e) {
        return raw;
    }
};

const toast = (msg) => {
    try {
        showMessage(msg);
    } catch (e) {
        // ignore
    }
};

/**
 * 保存 / 下载当前图：
 * 1. 系统分享面板（Android 上可直接「保存到相册」）
 * 2. a[download] 触发浏览器下载
 * 3. 退化为新标签打开，由用户长按保存
 */
const downloadCurrent = async () => {
    const url = currentUrl();
    if (!url) {
        return;
    }
    const name = currentName();
    const hint = () => toast('已开始下载：' + name);
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: name });
            return;
        }
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = name;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(href);
            a.remove();
        }, 5000);
        hint();
    } catch (e) {
        // 兜底：新标签打开，用户可以长按保存
        window.open(url, '_blank');
        toast('已在新标签打开，可长按保存');
    }
};

const openImageActions = () => {
    const url = currentUrl();
    if (!url) {
        return;
    }
    const actions = [
        {
            label: '保存到相册 / 下载',
            icon: 'iconDownload',
            onClick: () => {
                downloadCurrent();
            },
        },
        {
            label: '复制图片链接',
            icon: 'iconCopy',
            onClick: async () => {
                const ok = await copyText(url);
                toast(ok ? '已复制图片链接' : '复制失败，请手动复制');
            },
        },
        {
            label: '复制 Markdown',
            icon: 'iconCopy',
            onClick: async () => {
                const ok = await copyText(`![image](${url})`);
                toast(ok ? '已复制 Markdown' : '复制失败，请手动复制');
            },
        },
        {
            label: '在新标签打开',
            icon: 'iconLink',
            onClick: () => {
                window.open(url, '_blank');
            },
        },
    ];
    if (typeof onDelete === 'function') {
        actions.push({
            label: '删除这张',
            icon: 'iconTrashcan',
            onClick: () => onDelete(url),
        });
    }
    openMobileActionSheet(`${index + 1}/${urls.length} ${currentName()}`, actions);
};

const clearLongPress = () => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
};

const startLongPress = () => {
    clearLongPress();
    longPressed = false;
    longPressTimer = setTimeout(() => {
        longPressTimer = null;
        longPressed = true;
        try {
            if (navigator.vibrate) {
                navigator.vibrate(8);
            }
        } catch (e) {
            // ignore
        }
        openImageActions();
    }, LONG_PRESS_MS);
};

const distanceOf = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
const middleOf = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

const onTouchStart = (e) => {
    if (e.touches.length === 2) {
        mode = 'pinch';
        pinch = {
            distance: distanceOf(e.touches[0], e.touches[1]) || 1,
            middle: middleOf(e.touches[0], e.touches[1]),
            scale,
            tx,
            ty,
        };
        return;
    }
    if (e.touches.length !== 1) {
        return;
    }
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startAt = Date.now();
    panX = tx;
    panY = ty;
    pinch = null;
    mode = scale > 1.01 ? 'pan' : null;
    startLongPress();
};

const onTouchMove = (e) => {
    if (startX && e.touches.length === 1) {
        const t0 = e.touches[0];
        if (Math.hypot(t0.clientX - startX, t0.clientY - startY) > LONG_PRESS_TOLERANCE) {
            clearLongPress();
        }
    }
    if (mode === 'pinch' && e.touches.length >= 2 && pinch) {
        const ratio = distanceOf(e.touches[0], e.touches[1]) / pinch.distance;
        const middle = middleOf(e.touches[0], e.touches[1]);
        const rect = stageEl.getBoundingClientRect();
        const cx = pinch.middle.x - (rect.left + rect.width / 2);
        const cy = pinch.middle.y - (rect.top + rect.height / 2);
        scale = clamp(pinch.scale * ratio, MIN_SCALE, MAX_SCALE);
        // 以两指中点为中心缩放，同时跟随中点平移
        tx = cx - (cx - pinch.tx) * (scale / pinch.scale) + (middle.x - pinch.middle.x);
        ty = cy - (cy - pinch.ty) * (scale / pinch.scale) + (middle.y - pinch.middle.y);
        if (scale <= MIN_SCALE * 1.01) {
            tx = 0;
            ty = 0;
        }
        applyTransform(false);
        if (e.cancelable) {
            e.preventDefault();
        }
        return;
    }

    if (!e.touches.length) {
        return;
    }
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (mode === 'pan') {
        tx = panX + dx;
        ty = panY + dy;
        clampPan(false);
        if (e.cancelable) {
            e.preventDefault();
        }
        return;
    }

    if (!mode) {
        if (Math.hypot(dx, dy) < SWIPE_DISTANCE) {
            return;
        }
        mode = Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'dismiss';
    }

    if (mode === 'swipe') {
        const width = stageEl.getBoundingClientRect().width || 1;
        imgEl.style.transition = 'none';
        imgEl.style.transform = `translate3d(${dx}px, 0, 0) scale(1)`;
        imgEl.style.opacity = String(clamp(1 - Math.abs(dx) / (width * 1.2), 0.4, 1));
    } else if (mode === 'dismiss') {
        const offset = Math.min(0, dy);
        imgEl.style.transition = 'none';
        imgEl.style.transform = `translate3d(0, ${offset}px, 0) scale(1)`;
        imgEl.style.opacity = String(clamp(1 + offset / 400, 0.3, 1));
    }

    if (e.cancelable) {
        e.preventDefault();
    }
};

const handleTap = (touch) => {
    if (!touch) {
        return;
    }
    const now = Date.now();
    const isDouble = now - lastTap.at < DOUBLE_TAP_DELAY
        && Math.abs(touch.clientX - lastTap.x) < 30
        && Math.abs(touch.clientY - lastTap.y) < 30;

    if (!isDouble) {
        lastTap = { at: now, x: touch.clientX, y: touch.clientY };
        return;
    }

    lastTap = { at: 0, x: 0, y: 0 };
    if (scale > 1.01) {
        resetZoom(true);
        return;
    }
    const rect = stageEl.getBoundingClientRect();
    const cx = touch.clientX - (rect.left + rect.width / 2);
    const cy = touch.clientY - (rect.top + rect.height / 2);
    scale = 2.5;
    tx = -cx * (scale - 1);
    ty = -cy * (scale - 1);
    clampPan(true);
};

const onTouchEnd = (e) => {
    const touch = (e.changedTouches && e.changedTouches[0]) || null;

    clearLongPress();
    if (longPressed) {
        // 长按菜单已经弹出，这次抬手不再算点击/双击
        longPressed = false;
        mode = null;
        pinch = null;
        return;
    }

    if (mode === 'pinch') {
        pinch = null;
        mode = null;
        if (scale < MIN_SCALE * 1.05) {
            resetZoom(true);
        } else {
            clampPan(true);
        }
        return;
    }

    if (mode === 'pan') {
        mode = null;
        const moved = touch ? Math.hypot(touch.clientX - startX, touch.clientY - startY) : Infinity;
        if (moved < SWIPE_DISTANCE && Date.now() - startAt < 250) {
            // 放大状态下单指轻点也要能双击复原
            handleTap(touch);
            return;
        }
        clampPan(true);
        return;
    }

    if ((mode === 'swipe' || mode === 'dismiss') && touch) {
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const finished = mode;
        mode = null;

        if (finished === 'swipe') {
            const width = stageEl.getBoundingClientRect().width || 1;
            if (Math.abs(dx) > width * SWIPE_RATIO) {
                if (dx < 0 && index < urls.length - 1) {
                    show(index + 1, -width * 0.25);
                } else if (dx > 0 && index > 0) {
                    show(index - 1, width * 0.25);
                } else {
                    resetZoom(true);
                }
                return;
            }
            resetZoom(true);
            return;
        }

        if (dy < -DISMISS_DISTANCE) {
            closeMobileImageViewer();
            return;
        }
        resetZoom(true);
        return;
    }

    if (!touch || Date.now() - startAt > 250) {
        return;
    }
    handleTap(touch);
};

export const openMobileImageViewer = (list, startIndex, options = {}) => {
    closeMobileImageViewer();
    urls = Array.isArray(list) ? list.slice() : [];
    if (!urls.length) {
        return null;
    }
    index = clamp(startIndex || 0, 0, urls.length - 1);
    onDelete = typeof options.onDelete === 'function' ? options.onDelete : null;

    viewerEl = document.createElement('div');
    viewerEl.className = 'sppl-mobile-viewer';
    viewerEl.innerHTML = `<div class="sppl-mobile-viewer__bar">
        <span class="sppl-mobile-viewer__btn" data-action="back"><svg><use xlink:href="#iconLeft"></use></svg></span>
        <span class="sppl-mobile-viewer__counter"></span>
    </div>
    <div class="sppl-mobile-viewer__stage"><img class="sppl-mobile-viewer__img" alt=""></div>`;

    stageEl = viewerEl.querySelector('.sppl-mobile-viewer__stage');
    imgEl = viewerEl.querySelector('.sppl-mobile-viewer__img');
    counterEl = viewerEl.querySelector('.sppl-mobile-viewer__counter');

    viewerEl.querySelector('[data-action="back"]').setAttribute('aria-label', '返回');
    viewerEl.querySelector('[data-action="back"]').addEventListener('click', closeMobileImageViewer);

    stageEl.addEventListener('touchstart', onTouchStart, { passive: true });
    stageEl.addEventListener('touchmove', onTouchMove, { passive: false });
    stageEl.addEventListener('touchend', onTouchEnd);
    stageEl.addEventListener('touchcancel', onTouchEnd);

    document.body.appendChild(viewerEl);
    show(index, 0);
    return viewerEl;
};
