/**
 * 前端类型判断。
 *
 * 单独放在这里（不 import 任何组件），避免 tab.vue 与 mobile-gallery.js 互相引用成环。
 * getFrontend() 可能返回：desktop / desktop-window / browser-desktop / mobile / browser-mobile
 */
export const getFrontendName = () => {
    try {
        // @ts-ignore
        const { getFrontend } = require('siyuan');
        const frontend = getFrontend && getFrontend();
        if (frontend) {
            return frontend;
        }
    } catch (e) {
        // ignore
    }
    // 回退：没有 #toolbar 视为移动端
    return document.getElementById('toolbar') ? 'desktop' : 'mobile';
};

/** 移动端（含手机浏览器） */
export const isMobileFrontend = () => {
    const frontend = getFrontendName();
    return frontend === 'mobile' || frontend === 'browser-mobile';
};

/** Electron 桌面端（只有这里才有 window.require / @electron/remote） */
export const isDesktopApp = () => {
    const frontend = getFrontendName();
    return frontend === 'desktop' || frontend === 'desktop-window';
};
