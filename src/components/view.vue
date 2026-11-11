<template>
    <el-image v-bind="boundAttrs" :src="srcRef" v-if="ready" @click="onClick">
        <template #error>
            <slot name="error"></slot>
        </template>
    </el-image>
    <div class="view-loading" v-else :class="rootClass"></div>
</template>

<script setup>
import { computed, inject, onMounted, ref, useAttrs } from 'vue';
import { confirm, showMessage } from 'siyuan';
import { isMobileFrontend } from '../util/mobile';
import { openMobileImageViewer, closeMobileImageViewer } from '../util/mobile-image-viewer';
import { emitGalleryRefresh } from '../util/gallery-events';

defineOptions({ inheritAttrs: false });

const srcRef = ref('');
const plugin = inject('plugin');
const ready = ref(false);

const props = defineProps({
    src: String,
});

const attrs = useAttrs();
const mobile = isMobileFrontend();
const rootClass = computed(() => attrs.class);

// 移动端不挂 el-image 自带的预览（它没有触摸滑动 / 双指缩放），点开用自建预览层
const boundAttrs = computed(() => {
    const merged = { ...props, ...attrs };
    if (!mobile) {
        return merged;
    }
    delete merged.previewSrcList;
    delete merged['preview-src-list'];
    delete merged.initialIndex;
    delete merged['initial-index'];
    return merged;
});

const onClick = () => {
    if (!mobile) {
        return;
    }
    const list = attrs.previewSrcList || attrs['preview-src-list'];
    const startIndex = attrs.initialIndex != null ? attrs.initialIndex : attrs['initial-index'];
    if (list && list.length) {
        openMobileImageViewer(list, Number(startIndex) || 0, { onDelete });
    }
};

// 长按菜单里的「删除这张」：确认后删文件并让图库刷新
const onDelete = (url) => {
    closeMobileImageViewer();
    confirm('⚠️', '确认删除这张图片？', async () => {
        try {
            await plugin.storage.deleteFile('/data/' + decodeURI(url));
            emitGalleryRefresh();
            showMessage('已删除');
        } catch (e) {
            showMessage('删除失败：' + ((e && e.message) || e));
        }
    });
};

const onSrc = async (src) => {
    return plugin.storage.getCacheOfPicture(src);
};

onMounted(() => {
    const src = props.src;
    onSrc(src).then((img) => {
        srcRef.value = img;
        ready.value = true;
    }).catch((e) => {
        console.error(e);
        ready.value = true;
    });
});
</script>
<style>
.view-loading {
    background-color: rgba(255, 255, 255, .5);
}
</style>
