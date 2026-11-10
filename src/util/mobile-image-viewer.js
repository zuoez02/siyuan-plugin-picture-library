/**
 * 移动端大图预览手势。
 *
 * Element Plus 的 el-image-viewer 只有左右按钮（el-image-viewer__prev / __next），
 * 没有触摸滑动，手机上一个手指划不动。这里在 document 上挂捕获阶段的触摸监听，
 * 命中预览浮层时按水平滑动方向点一下对应按钮。
 *
 * 已经放大（scale > 1）时不切换，避免和缩放/平移手势打架。
 */
const SWIPE_DISTANCE = 50;
const HORIZONTAL_RATIO = 1.2;

let bound = false;
let tracking = false;
let startX = 0;
let startY = 0;

const scaleOf = (img) => {
    const transform = (img && img.style && img.style.transform) || '';
    const matched = /scale\(([\d.]+)\)/.exec(transform);
    return matched ? parseFloat(matched[1]) : 1;
};

// 预览器会把整个列表的 img 都渲染出来，只有当前那张是可见的
const currentImgOf = (viewer) => {
    const imgs = Array.from(viewer.querySelectorAll('.el-image-viewer__img'));
    return imgs.find((img) => img.offsetParent !== null && getComputedStyle(img).display !== 'none') || imgs[0] || null;
};

const isInViewer = (node) => node instanceof Element && !!node.closest('.el-image-viewer__wrapper');

const onTouchStart = (e) => {
    if (e.touches.length !== 1 || !isInViewer(e.target)) {
        tracking = false;
        return;
    }
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
};

const onTouchEnd = (e) => {
    if (!tracking) {
        return;
    }
    tracking = false;

    const touch = e.changedTouches && e.changedTouches[0];
    const viewer = document.querySelector('.el-image-viewer__wrapper');
    if (!touch || !viewer) {
        return;
    }

    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * HORIZONTAL_RATIO) {
        return;
    }

    if (scaleOf(currentImgOf(viewer)) > 1.01) {
        return;
    }

    const button = viewer.querySelector(dx < 0 ? '.el-image-viewer__next' : '.el-image-viewer__prev');
    if (button) {
        button.click();
    }
};

export const bindMobileImageViewer = () => {
    if (bound) {
        return;
    }
    bound = true;
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    document.addEventListener('touchend', onTouchEnd, { capture: true });
};
