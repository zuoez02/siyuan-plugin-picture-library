<template>
    <div class="block text-center">
        <el-carousel :height="height" :autoplay="true">
            <el-carousel-item v-for="item in images" :key="item" :style="getStyle(item)">
            </el-carousel-item>
        </el-carousel>
    </div>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue';
import { _ } from '../util/i18n';
import { getFiles } from '../storage/file';

const path = inject('path');
const height = inject('height');

const images = ref([]);

const getStyle = (f) => ({
    'background-image': `url(${f})`,
    'background-repeat': 'no-repeat',
    'background-size': 'contain',
    'background-position': 'center',
})
onMounted(() => {
    if (!path) {
        return;
    }
    getFiles(path).then((files) => {
        images.value = files.map((f) => f.url);
    })
})
</script>
