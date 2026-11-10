/**
 * 前端类型判断：移动端（含手机浏览器）。
 * 优先使用官方 getFrontend()；取不到时回退到「没有 #toolbar 即移动端」。
 *
 * 单独放在这里（不 import 任何组件），避免 tab.vue 与 mobile-gallery.js 互相引用成环。
 */
export const isMobileFrontend = () => {
    try {
        // @ts-ignore
        const { getFrontend } = require('siyuan');
        const frontend = getFrontend && getFrontend();
        if (frontend) {
            return frontend === 'mobile' || frontend === 'browser-mobile';
        }
    } catch (e) {
        // ignore
    }
    return !document.getElementById('toolbar');
};
