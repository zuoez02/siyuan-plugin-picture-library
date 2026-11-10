import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import Tab from '../components/tab.vue';
import { _ } from './i18n';
import { closeMobilePlayer } from './mobile-player';
import { closeMobileImageViewer } from './mobile-image-viewer';

let overlay = null;
let app = null;

export const closeMobileGallery = () => {
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

/**
 * 右滑关闭图库浮层（不做跟手动画）。
 * 只认「向右为主、位移够大」的滑动，避免和纵向滚动、点按冲突；
 * 上面还压着播放器 / 大图预览时交给它们自己处理。
 */
const bindSwipeToClose = (el) => {
    let tracking = false;
    let startX = 0;
    let startY = 0;

    const hasLayerAbove = () => !!document.querySelector('.sppl-mobile-player, .sppl-mobile-viewer');

    el.addEventListener('touchstart', (e) => {
        tracking = e.touches.length === 1 && !hasLayerAbove();
        if (tracking) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
        if (!tracking) {
            return;
        }
        tracking = false;
        const touch = e.changedTouches && e.changedTouches[0];
        if (!touch || hasLayerAbove()) {
            return;
        }
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (dx < SWIPE_CLOSE_DISTANCE || Math.abs(dx) < Math.abs(dy) * SWIPE_HORIZONTAL_RATIO) {
            return;
        }
        closeMobileGallery();
    });

    el.addEventListener('touchcancel', () => {
        tracking = false;
    });
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

    bindSwipeToClose(overlay);

    return overlay;
};
