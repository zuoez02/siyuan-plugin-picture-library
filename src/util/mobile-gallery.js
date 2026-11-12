import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import Tab from '../components/tab.vue';
import { _ } from './i18n';
import { closeMobilePlayer } from './mobile-player';
import { closeMobileImageViewer } from './mobile-image-viewer';

let overlay = null;
let app = null;

export const closeMobileGallery = () => {
    unbindSwipeToClose();
    closeMobilePlayer();
    closeMobileImageViewer();
    if (app) {
        try {
            app.unmount();
        } catch (e) {
            console.error(e);
        }
        app = null;
    }
    if (overlay) {
        overlay.remove();
        overlay = null;
        document.body.classList.remove('sppl-mobile-gallery-open');
    }
};

const SWIPE_CLOSE_DISTANCE = 80;
const SWIPE_HORIZONTAL_RATIO = 1.5;
const SWIPE_CLAIM_DISTANCE = 12;

let unbindSwipe = null;

const unbindSwipeToClose = () => {
    if (typeof unbindSwipe === 'function') {
        unbindSwipe();
        unbindSwipe = null;
    }
};

/**
 * 右滑关闭图库浮层（不做跟手动画）。
 *
 * 关键点：监听挂在 **window 的捕获阶段**。
 * 之前挂在浮层上是冒泡阶段，思源自己在 document / window 上的手势监听
 * （侧边栏、返回）在捕获阶段就已经跑完了，stopPropagation 拦不住，
 * 于是右滑关图库的同时，下面本体的右侧边栏也被滑没了。
 * 捕获阶段 + stopImmediatePropagation 才能让后面的监听全部收不到。
 */
const bindSwipeToClose = () => {
    unbindSwipeToClose();

    let tracking = false;
    let claimed = false;
    let startX = 0;
    let startY = 0;

    const inOverlay = (el) => !!(el && el.closest && el.closest('.sppl-mobile-overlay'));
    const hasLayerAbove = () => !!document.querySelector('.sppl-mobile-player, .sppl-mobile-viewer');

    const onStart = (e) => {
        claimed = false;
        tracking = e.touches.length === 1 && !hasLayerAbove() && inOverlay(e.target);
        if (tracking) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    };

    const onMove = (e) => {
        if (!tracking || e.touches.length !== 1) {
            return;
        }
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (!claimed && dx > SWIPE_CLAIM_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
            claimed = true;
        }
        if (claimed) {
            e.stopImmediatePropagation();
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    };

    const onEnd = (e) => {
        if (!tracking) {
            return;
        }
        tracking = false;
        const touch = (e.changedTouches && e.changedTouches[0]) || null;
        if (!touch || hasLayerAbove()) {
            claimed = false;
            return;
        }
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const isCloseSwipe = dx >= SWIPE_CLOSE_DISTANCE && Math.abs(dx) >= Math.abs(dy) * SWIPE_HORIZONTAL_RATIO;
        if (claimed || isCloseSwipe) {
            e.stopImmediatePropagation();
        }
        claimed = false;
        if (isCloseSwipe) {
            closeMobileGallery();
        }
    };

    const onCancel = () => {
        tracking = false;
        claimed = false;
    };

    const opts = { capture: true };
    window.addEventListener('touchstart', onStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onMove, { capture: true, passive: false });
    window.addEventListener('touchend', onEnd, opts);
    window.addEventListener('touchcancel', onCancel, opts);

    unbindSwipe = () => {
        window.removeEventListener('touchstart', onStart, { capture: true });
        window.removeEventListener('touchmove', onMove, { capture: true });
        window.removeEventListener('touchend', onEnd, opts);
        window.removeEventListener('touchcancel', onCancel, opts);
    };
};

/**
 * 移动端没有自定义页签（addTab 在移动端是空实现），
 * 这里用全屏浮层承载同一个图库视图。
 */
export const openMobileGallery = (plugin, folder) => {
    closeMobileGallery();

    overlay = document.createElement('div');
    overlay.className = 'sppl-mobile-overlay';
    overlay.innerHTML = `<div class="sppl-mobile-overlay__bar">
        <span class="sppl-mobile-overlay__btn" data-action="back"><svg><use xlink:href="#iconLeft"></use></svg></span>
        <span class="sppl-mobile-overlay__title"></span>
        <span class="sppl-mobile-overlay__btn" data-action="settings"><svg><use xlink:href="#iconSettings"></use></svg></span>
        <span class="sppl-mobile-overlay__btn" data-action="close"><svg><use xlink:href="#iconClose"></use></svg></span>
    </div>
    <div class="sppl-mobile-overlay__body"></div>`;

    overlay.querySelector('.sppl-mobile-overlay__title').textContent = folder.name || '';
    overlay.querySelector('[data-action="back"]').setAttribute('aria-label', _('back'));
    overlay.querySelector('[data-action="settings"]').setAttribute('aria-label', _('setting'));
    overlay.querySelector('[data-action="close"]').setAttribute('aria-label', _('close'));
    overlay.querySelector('[data-action="back"]').addEventListener('click', closeMobileGallery);
    overlay.querySelector('[data-action="close"]').addEventListener('click', closeMobileGallery);
    overlay.querySelector('[data-action="settings"]').addEventListener('click', () => {
        overlay.classList.toggle('sppl-mobile-overlay--settings');
    });

    document.body.appendChild(overlay);
    document.body.classList.add('sppl-mobile-gallery-open');

    app = createApp(Tab);
    app.use(ElementPlus);
    app.provide('plugin', plugin);
    app.provide('folder', folder);
    app.mount(overlay.querySelector('.sppl-mobile-overlay__body'));

    bindSwipeToClose();

    return overlay;
};
