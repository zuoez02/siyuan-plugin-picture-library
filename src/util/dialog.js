import { Dialog } from 'siyuan';

export async function createFolder() {
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({
            title: '新建文件夹',
            content: `<div class="b3-dialog__content" style="user-select: auto;">
            <input placeholder="文件夹名" class="b3-text-field fn__block"> 请输入文件夹名
        </div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">取消</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text">确定</button>
        </div>`,
            width: '400px',
        });
        const input = dialog.element.querySelector('input');
        const cancel  = dialog.element.querySelector('.b3-button--cancel')
        const confirm = dialog.element.querySelector('.b3-button--text');
        cancel.addEventListener('click', () => {
            reject();
            dialog.destroy();
        });
        confirm.addEventListener('click', () => {
            if (!input.value.trim()) {
                return;
            }
            resolve(input.value.trim());
            dialog.destroy()
        });
    })
}