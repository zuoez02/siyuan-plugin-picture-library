<template>
    <div class="sppl-plugin-tab" @dragenter="onDragEnter" @dragover="onDragOver" @drop="onDrop" @dragleave="onDragLeave">
        <div class="tab-setting">
            <div class="tab-setting-item">
                <div class="b3-label__text">{{ _('mode') }}</div>
                <select class="b3-select" v-model="setting.mode">
                    <option v-for="k in setting.modes" :value="k">{{ _(k) }}</option>
                </select>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'grid'">
                <div class="b3-label__text">{{ _('size') }}</div>
                <select class="b3-select" v-model="setting.size">
                    <option v-for="k in setting.sizes" :value="k">{{ k }}</option>
                </select>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'manga'">
                <div class="b3-label__text">{{ _('mangaSize') }}</div>
                <select class="b3-select" v-model="setting.mangaSize">
                    <option v-for="k in setting.mangaSizes" :value="k">{{ k }}</option>
                </select>
            </div>
            <div class="tab-setting-item">
                <div class="b3-label__text">{{ _('sort') }}</div>
                <select class="b3-select" v-model="setting.sort">
                    <option v-for="k in setting.sorts" :value="k">{{ _(k) }}</option>
                </select>
            </div>
            <!-- {{ setting }} -->
        </div>
        <div class="image-wall" v-if="setting.mode === 'grid'">
            <el-image :key="f" v-for="(f, $i) in sortedFiles" class="sppl-image" :style="gridStyle" :src="f" fit="cover" @contextmenu="onContextClick(f, $event)"
                :initial-index="$i" :preview-src-list="sortedFiles" :lazy="true" loading="lazy">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)">{{ _('loadFailed') }}</div>
                </template>
            </el-image>
        </div>
        <div class="manga-wall" v-if="setting.mode === 'manga'">
            <el-image :key="f" v-for="(f, $i) in sortedFiles" class="sppl-manga" :style="mangaStyle" :src="f" fit="cover"  @contextmenu="onContextClick(f, $event)"
                :initial-index="$i" :preview-src-list="sortedFiles" :lazy="true" loading="lazy">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)">{{ _('loadFailed') }}</div>
                </template>
            </el-image>
        </div>
        <div class="drop-hover" v-show="showDropHover">
            <h1 class="drop-hover-title">{{ _('dropHoverTitle') }}</h1>
        </div>
    </div>
</template>
<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import { getFiles } from '../storage/file';
import { showMessage, Menu } from 'siyuan';
import { FILE_EXT } from '../util/constants';
import { _ } from '../util/i18n';

const { path } = inject('folder');
const plugin = inject('plugin');

const showDropHover = ref(false);

const files = ref([]);

const setting = ref(plugin.setting);

watch(setting.value, () => plugin.saveSetting(setting.value));

const sortedFiles = computed(() => {
    return files.value.sort((a, b) => setting.value.sort === 'nameIncrease' ? compare(a, b) : compare(b, a));
})

const compare = (a, b) => {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

const gridStyle = computed(() => ({
    width: `${setting.value.size}px`,
    height: `${setting.value.size}px`,
}));

const mangaStyle = computed(() => ({
    width: `${setting.value.mangaSize}`,
}));

onMounted(() => {
    getImages();
})

const getImages = () => {
    getFiles(path).then((list) => {
        files.value = list.filter(l => FILE_EXT.some(t => l.name.toLowerCase().endsWith(t))).map(l => l.url);
    });
}

const sm = (f) => showMessage(f);

const downloadUri = (uri, path) => {
    const filename = new URL(uri).pathname.split('/').pop();
    return fetch(uri).then(async res => {
        const blob = await res.blob();
        if (FILE_EXT.every((e) => !filename.endsWith(e))) {
            const ext = res.headers.get('Content-Type').split('/')[1];
            if (FILE_EXT.every((e) => ('.' + ext) !== e)) {
                return null;
            }
            return {
                filename: filename + '.' + ext,
                blob,
            }
        }
        return {
            filename,
            blob,
        }
    }).then((b) => {
        if (!b) {
            return;
        }
        return plugin.storage.addFileBlob(path, b.blob, b.filename);
    })
}

const openHover = () => {
    showDropHover.value = true;
}

const closeHover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showDropHover.value = false;
}

const onDragEnter = () => openHover();
const onDragOver = (e) => {
    openHover();
    e.preventDefault();
}
const onDrop = async (e) => {
    e.preventDefault();
    const d = e.dataTransfer?.files;
    if (d && d.length > 0) {
        await plugin.storage.addFiles(path, d);
        getImages();
    } else {
        const uri = e.dataTransfer?.getData('text/uri-list');
        if (uri) {
            await downloadUri(uri, path);
            getImages();
        }
    }
    closeHover(e);
}

const onDragLeave = (e) => closeHover(e);

const copyImageBlock = (path) => {
  // @ts-ignore
  const id = window.Lute.NewNodeID();
  const date = new Date();
  const d = `${date.getFullYear()}${date.getMonth()}${date.getDay()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
  const block = `![image](${path})
{: id="${id}" updated="${d}"}`
  navigator.clipboard.writeText(block);
};

const copyUrl = (path) => {
  navigator.clipboard.writeText(path);
};

const onContextClick = (f, e) => {
    const m = new Menu('sppl-menu');
    m.addItem({
        label: _('copyPath'),
        icon: 'iconCopy',
        click: () => copyUrl(f),
    })
    m.addItem({
        label: _('copyImageBlock'),
        icon: 'iconCopy',
        click: () => copyImageBlock(f),
    })
    m.open({x: e.pageX, y: e.pageY });
}


// const plugin = inject('plugin');
</script>
<style scoped>
.tab-setting {
    height: 40px;
    width: 100%;
    position: absolute;
    display: block;
    border-bottom: 1px solid var(--b3-theme-background-light);
    z-index: 1;
}

html[data-theme-mode='dark'] .tab-setting {
    background-color: rgba(30, 30, 30, 0.88);
}

html[data-theme-mode='light'] .tab-setting {
    background-color: rgba(255, 255, 255, 0.88);
}


.sppl-plugin-tab {
    overflow: scroll;
    height: 100%;
    width: 100%;
}

.sppl-image {
    display: inline-block;
    margin: 6px;
}

.sppl-manga {
    display: block;
    margin: 12px auto;
    text-align: center;
}


.image-wall {
    width: 100%;
    margin-top: 52px;
}

.manga-wall {
    width: 100%;
    padding-top: 40px;
}

.tab-setting-item {
    display: inline-block;
    margin-right: 8px;
}

.tab-setting-item>div {
    display: inline-block;
}

.tab-setting-item>.b3-label__text {
    padding: 6px;
    margin-left: 12px;
}

.tab-setting-item>.b3-select {
    position: relative;
    top: -13px;
}

.drop-hover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

.drop-hover-title {
    width: 100%;
    text-align: center;
    color: white;
    font-size: 32px;
    margin: 40vh auto;
    pointer-events: none;
    position: sticky;
    top: 45vh;
}
</style>