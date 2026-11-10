/**
 * 移动端全屏视频播放器。
 *
 * 移动端没有「页签」可用（思源 addTab 被裁掉），思播插件也不一定加载在移动端，
 * 所以直接在浮层里用原生 <video controls playsinline> 播放，点关闭回到图库。
 */
let playerEl = null;

export const closeMobilePlayer = () => {
    if (!playerEl) {
        return;
    }
    const video = playerEl.querySelector('video');
    if (video) {
        try {
            video.pause();
            video.removeAttribute('src');
            video.load();
        } catch (e) {
            // ignore
        }
    }
    playerEl.remove();
    playerEl = null;
};

export const openMobilePlayer = (url, title) => {
    closeMobilePlayer();

    const wrap = document.createElement('div');
    wrap.className = 'sppl-mobile-player';
    wrap.innerHTML = `<div class="sppl-mobile-player__bar">
        <span class="sppl-mobile-player__btn" data-action="back"><svg><use xlink:href="#iconLeft"></use></svg></span>
        <span class="sppl-mobile-player__title"></span>
    </div>
    <video class="sppl-mobile-player__video" controls playsinline webkit-playsinline preload="metadata"></video>`;

    wrap.querySelector('.sppl-mobile-player__title').textContent = title || '';
    wrap.querySelector('[data-action="back"]').setAttribute('aria-label', '返回');
    wrap.querySelector('[data-action="back"]').addEventListener('click', closeMobilePlayer);
    // 点空白区域也能退出
    wrap.addEventListener('click', (e) => {
        if (e.target === wrap) {
            closeMobilePlayer();
        }
    });

    const video = wrap.querySelector('video');
    video.src = url;

    document.body.appendChild(wrap);
    playerEl = wrap;

    const played = video.play();
    if (played && typeof played.catch === 'function') {
        // 浏览器拦截自动播放时保持 controls 可用，用户点一下即可
        played.catch(() => { });
    }

    return wrap;
};
