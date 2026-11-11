/**
 * 剪贴板工具：浏览器端在 http（非安全上下文）下 navigator.clipboard 是 undefined，
 * 直接调用会静默失败（局域网 IP、WebView 套壳都是这种情况）。
 * 这里统一先试 async API，不可用再用 textarea + execCommand 兜底。
 */

export const hasAsyncClipboard = () => {
    try {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    } catch (e) {
        return false;
    }
};

/**
 * 复制纯文本。返回是否成功。
 */
export const copyText = async (text) => {
    const value = String(text ?? '');

    if (hasAsyncClipboard()) {
        try {
            await navigator.clipboard.writeText(value);
            return true;
        } catch (e) {
            // 权限被拒（非用户手势、无权限）时继续走兜底
        }
    }

    try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        // iOS 上必须显式设置选区，否则 copy 拿不到内容
        ta.setSelectionRange(0, value.length);
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    } catch (e) {
        return false;
    }
};

/**
 * 复制图片到剪贴板。只在安全上下文且有 ClipboardItem 时可用，返回是否成功。
 */
export const copyImageBlob = async (blob) => {
    try {
        if (!navigator.clipboard || !navigator.clipboard.write || !window.ClipboardItem) {
            return false;
        }
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
        return true;
    } catch (e) {
        return false;
    }
};
