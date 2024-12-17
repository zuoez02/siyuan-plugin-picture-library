<template>
    <el-image v-bind="{...$props, ...$attrs}" :src="srcRef" v-if="ready">
        <template #error>
            <slot name="error"></slot>
        </template>
    </el-image>
    <div class="view-loading" v-else :class="$props.class"></div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';

const srcRef = ref('');
const plugin = inject('plugin');
const ready = ref(false)

const props = defineProps({
    src: String,
})

const onSrc = async (src) => {
    return plugin.storage.getCacheOfPicture(src);
}

onMounted(() => {
    const src = props.src;
    onSrc(src).then((img) => {
        srcRef.value = img;
        ready.value = true;
    }).catch((e) => {
        console.error(e);
        ready.value = true;
    });
})
</script>
<style>
.view-loading {
    background-color: rgba(255, 255, 255, .5);
}
</style>