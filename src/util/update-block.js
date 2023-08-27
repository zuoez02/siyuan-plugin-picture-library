import { Dialog } from 'siyuan';
import { getKramdown, updateBlock } from './request';
import { _ } from './i18n';

export const changeHeight = async (id, height) => {
    const content = await getKramdown(id);
    const dialog = new Dialog({
        title: _('changeHeight'),
        content: `<div class="b3-dialog__content" style="user-select: auto;">
        <input type="number" placeholder="${_('height')}" class="b3-text-field fn__block">${_('inputHeight')}
    </div>
    <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">${_('cancel')}</button>
        <div class="fn__space"></div>
        <button class="b3-button b3-button--text">${_('confirm')}</button>
    </div>`,
        width: '400px',
    });
    const input = dialog.element.querySelector('input');
    input.value = parseInt(height);
    const cancel  = dialog.element.querySelector('.b3-button--cancel')
    const confirm = dialog.element.querySelector('.b3-button--text');
    cancel.addEventListener('click', () => {
        dialog.destroy();
    });
    confirm.addEventListener('click', () => {
        if (!input.value.trim()) {
            return;
        }
        updateBlock(id, content.replace(height, `${input.value}px`))
        dialog.destroy()
    });
}

export const changeSize = async (id, size) => {
    const content = await getKramdown(id);
    const dialog = new Dialog({
        title: _('changeSize'),
        content: `<div class="b3-dialog__content" style="user-select: auto;">
        <select class="b3-select">
            <option value="contain">${_('contain')}</option>
            <option value="cover">${_('cover')}</cover>
        </select>
    </div>
    <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">${_('cancel')}</button>
        <div class="fn__space"></div>
        <button class="b3-button b3-button--text">${_('confirm')}</button>
    </div>`,
        width: '400px',
    });
    const select = dialog.element.querySelector('select');
    select.value = size || 'contain';
    const cancel  = dialog.element.querySelector('.b3-button--cancel')
    const confirm = dialog.element.querySelector('.b3-button--text');
    cancel.addEventListener('click', () => {
        dialog.destroy();
    });
    confirm.addEventListener('click', () => {
        if (!select.value.trim()) {
            return;
        }
        if (content.indexOf(`data-size="${size}"`) === -1) {
            const pl = 'data-plugin="siyuan-plugin-picture-library"';
            const position = content.indexOf(pl) + pl.length;
            const newContent = content.slice(0, position) + ` data-size="${select.value.trim()}" ` + content.slice(position);
            updateBlock(id, newContent);
        } else {
            updateBlock(id, content.replace(`data-size="${size}"`, `data-size="${select.value.trim()}"`))
        }
        dialog.destroy()
    });
}