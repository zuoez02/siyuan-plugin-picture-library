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

/**
 * 把图片 URL 复制进剪贴板（需要安全上下文 + ClipboardItem）。
 * Chrome 只接受 image/png，所以非 PNG 会先用 canvas 转一次。
 */
const MAX_CLIP_EDGE = 2560;

/**
 * 转成 PNG（Chrome 的 ClipboardItem 只接受 image/png）。
 * 超大图先等比缩到 MAX_CLIP_EDGE，否则 4000px 的原图转 PNG 会有几十 MB。
 */
const toPngBlob = (url, maxEdge = MAX_CLIP_EDGE) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        try {
            const naturalW = img.naturalWidth || img.width;
            const naturalH = img.naturalHeight || img.height;
            const ratio = Math.min(1, maxEdge / Math.max(naturalW, naturalH));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(naturalW * ratio);
            canvas.height = Math.round(naturalH * ratio);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('转 PNG 失败'));
                }
            }, 'image/png');
        } catch (e) {
            reject(e);
        }
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
});

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const data = String(reader.result || '');
        const idx = data.indexOf(',');
        resolve(idx >= 0 ? data.slice(idx + 1) : data);
    };
    reader.onerror = () => reject(reader.error || new Error('读取失败'));
    reader.readAsDataURL(blob);
});

/**
 * 自建 WebView 壳子可以注入 SpplShell.copyImageBase64(b64) 这个 JS 接口，
 * http 下没有 ClipboardItem，走原生反而更可靠。
 * 这里传的是**原图字节**（JPEG 就传 JPEG），不做 PNG 转换，避免 base64 膨胀。
 */
const copyViaShell = async (blob) => {
    try {
        const shell = window.SpplShell;
        if (!shell || typeof shell.copyImageBase64 !== 'function') {
            return false;
        }
        shell.copyImageBase64(await blobToBase64(blob));
        return true;
    } catch (e) {
        return false;
    }
};

export const copyImageFromUrl = async (url) => {
    let original = null;
    try {
        const res = await fetch(url);
        original = await res.blob();
    } catch (e) {
        return false;
    }

    // 1) 壳子原生通道（http 的 WebView 里唯一可行），传原图字节
    if (await copyViaShell(original)) {
        return true;
    }

    // 2) 标准 ClipboardItem（需要 https / localhost），超大图先缩小
    try {
        if (!navigator.clipboard || !navigator.clipboard.write || !window.ClipboardItem) {
            return false;
        }
        const png = original.type === 'image/png' ? original : await toPngBlob(url);
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': png })]);
        return true;
    } catch (e) {
        return false;
    }
};
