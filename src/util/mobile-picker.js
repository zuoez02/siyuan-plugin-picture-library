import { openMobileActionSheet } from './mobile-actions';

/**
 * 移动端选择器：底部弹出面板。
 *
 * 顶部工具栏原来的原生 <select> 在手机 WebView / iOS 上点不动
 * （点击既不弹系统选择器，也不触发 click），这里统一换成一个
 * 每项 52px 的底部列表，顺带解决 28px 高度不好点的问题。
 */
export const openMobilePicker = ({ title, options, value, onSelect, cancelLabel }) => {
    const list = options || [];
    if (!list.length) {
        return;
    }

    const actions = list.map((opt) => ({
        label: String(opt.label),
        selected: opt.value === value,
        onClick: () => {
            if (opt.value !== value && typeof onSelect === 'function') {
                onSelect(opt.value);
            }
        },
    }));
    // openMobileActionSheet 用第一项的 cancelLabel 作为取消按钮文案
    actions[0].cancelLabel = cancelLabel || '取消';

    openMobileActionSheet(title || '', actions);
};
