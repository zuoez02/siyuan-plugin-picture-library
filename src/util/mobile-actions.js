/**
 * 移动端底部操作面板。
 *
 * 侧边栏每行塞不下多个小图标（手机上手点不准），
 * 这里统一用「⋯ → 底部弹出面板」，每个操作都是整行 52px 的点击区。
 */
let sheetEl = null;

export const closeMobileActionSheet = () => {
    if (sheetEl) {
        sheetEl.remove();
        sheetEl = null;
    }
};

export const openMobileActionSheet = (title, actions) => {
    closeMobileActionSheet();
    if (!actions || !actions.length) {
        return null;
    }

    const wrap = document.createElement('div');
    wrap.className = 'sppl-mobile-sheet';
    wrap.innerHTML = `<div class="sppl-mobile-sheet__mask"></div>
        <div class="sppl-mobile-sheet__panel">
            <div class="sppl-mobile-sheet__title"></div>
            ${actions.map((_, i) => `<button class="sppl-mobile-sheet__item" data-index="${i}">
                <svg class="sppl-mobile-sheet__icon"><use></use></svg>
                <span class="sppl-mobile-sheet__label"></span>
            </button>`).join('')}
            <button class="sppl-mobile-sheet__item sppl-mobile-sheet__item--cancel" data-index="-1">
                <span class="sppl-mobile-sheet__label"></span>
            </button>
        </div>`;

    wrap.querySelector('.sppl-mobile-sheet__title').textContent = title || '';

    wrap.querySelectorAll('[data-index]').forEach((button) => {
        const idx = Number(button.getAttribute('data-index'));
        const labelEl = button.querySelector('.sppl-mobile-sheet__label');
        if (idx < 0) {
            labelEl.textContent = actions[0].cancelLabel || '取消';
        } else {
            labelEl.textContent = actions[idx].label || '';
            const use = button.querySelector('use');
            if (use && actions[idx].icon) {
                use.setAttribute('xlink:href', `#${actions[idx].icon}`);
            }
        }
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileActionSheet();
            if (idx >= 0 && typeof actions[idx].onClick === 'function') {
                actions[idx].onClick();
            }
        });
    });

    wrap.querySelector('.sppl-mobile-sheet__mask').addEventListener('click', closeMobileActionSheet);
    document.body.appendChild(wrap);
    sheetEl = wrap;
    return wrap;
};
