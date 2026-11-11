/**
 * 图库刷新事件。
 *
 * 大图预览层是独立挂载的（view.vue / tab.vue 都能打开它），
 * 在里面删图之后需要让当前图库页签重新拉一次文件列表，
 * 这里用一个极简的事件总线，避免组件之间互相注入。
 */
const handlers = new Set();

export const onGalleryRefresh = (fn) => {
    if (typeof fn !== 'function') {
        return () => { };
    }
    handlers.add(fn);
    return () => {
        handlers.delete(fn);
    };
};

export const emitGalleryRefresh = () => {
    handlers.forEach((fn) => {
        try {
            fn();
        } catch (e) {
            console.error(e);
        }
    });
};
