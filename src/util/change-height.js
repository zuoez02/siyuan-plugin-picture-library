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