import { TAB_TYPE, ICON } from './constants';

export const PLUGIN_NAME = 'siyuan-plugin-picture-library';

/**
 * 生成图库链接。
 *
 * 用官方推荐格式：siyuan://plugins/<插件名>?type=<页签类型>&icon=&title=&data=
 * - 桌面端：思源把 URL 交给插件（open-siyuan-url-plugin 事件），插件自己开页签
 * - 移动端：移动端没有自定义页签，插件收到事件后开全屏浮层
 *
 * 旧格式 siyuan://plugins/<插件名><页签类型>?... 在移动端会被判定为
 * 「页签的插件不可用」（移动端拿不到 addTab），所以不再生成。
 */
export const buildGalleryUrl = (node) => {
    const params = [
        `type=${encodeURIComponent(TAB_TYPE)}`,
        `icon=${encodeURIComponent(ICON)}`,
        `title=${encodeURIComponent(node.name || '')}`,
        `data=${encodeURIComponent(JSON.stringify({ name: node.name, path: node.path }))}`,
    ].join('&');
    return `siyuan://plugins/${PLUGIN_NAME}?${params}`;
};

export const buildGalleryMarkdown = (node) => `[${node.name}](${buildGalleryUrl(node)})`;

/**
 * 解析图库链接，同时兼容新旧两种写法。
 * 返回 { title, data } 或 null（不是图库链接 / 参数不合法）。
 */
export const parseGalleryUrl = (raw) => {
    if (!raw) {
        return null;
    }
    let url;
    try {
        url = new URL(raw);
    } catch (e) {
        return null;
    }
    if (url.protocol !== 'siyuan:' || url.host !== 'plugins') {
        return null;
    }

    let segment = url.pathname.replace(/^\/+/, '');
    try {
        segment = decodeURIComponent(segment);
    } catch (e) {
        return null;
    }
    // 新格式只有插件名；旧格式是「插件名 + 页签类型」
    if (segment !== PLUGIN_NAME && segment !== PLUGIN_NAME + TAB_TYPE) {
        return null;
    }

    let data = {};
    const rawData = url.searchParams.get('data');
    if (rawData) {
        try {
            data = JSON.parse(rawData);
        } catch (e) {
            return null;
        }
    }
    if (!data || typeof data.path !== 'string') {
        return null;
    }

    return {
        title: url.searchParams.get('title') || data.name || '',
        data: { name: data.name || url.searchParams.get('title') || '', path: data.path },
    };
};
