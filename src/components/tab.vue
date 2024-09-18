<template>
    <div class="sppl-plugin-tab" @dragenter="onDragEnter" @dragover="onDragOver" @drop="onDrop"
        @dragleave="onDragLeave">
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
            <div class="tab-setting-item">
                <input type="checkbox" class="b3-button" v-model="setting.overwrite">
                <span>{{ _('overwrite') }}</span>
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="onUpload">{{ _('uploadImage')
                    }}</button>
                <input ref="uploadFile" type="file" name="uploadFile" id="uploadFile" multiple style="display: none;">
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="onPaste">{{ _('pasteImage')
                    }}</button>
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="onShowInFloder">{{ _('showInFolder') }}</button>
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="refresh">{{ _('refresh') }}</button>
            </div>
            <div class="tab-setting-item">
                <span>共 {{ total }} 个</span>
            </div>
        </div>
        <div class="image-wall" v-if="setting.mode === 'grid'">
            <el-image :key="f" v-for="(f, $i) in images" class="sppl-image" :style="gridStyle" :src="f" fit="cover"
                @contextmenu="onContextClick(f, $event)" :initial-index="$i" :preview-src-list="images" :lazy="true"
                loading="lazy">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)">{{ _('loadFailed') }}</div>
                </template>
            </el-image>
            <div class="video-preview" :key="f"  v-for="(f, $i) in videoUrls"  v-on:click="() => onClickVideo(f)">
                <video :src="f" class="sppl-video" :style="gridStyle"></video>
                <div class="play-icon" style="">
                    <svg><use xlink:href="#iconPlay"></use></svg>
                </div>
            </div>
            
            
        </div>
        <div class="manga-wall" v-if="setting.mode === 'manga'">
            <el-image :key="f" v-for="(f, $i) in images" class="sppl-manga" :style="mangaStyle" :src="f" fit="cover"
                @contextmenu="onContextClick(f, $event)" :initial-index="$i" :preview-src-list="images" :lazy="true"
                loading="lazy">
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
import { showMessage, Menu, confirm, openTab } from 'siyuan';
import { FILE_EXT } from '../util/constants';
import { _ } from '../util/i18n';
import { getPngFunc } from '../util/image';

// @ts-ignore
const { path } = inject('folder');
const plugin = inject('plugin');

const showDropHover = ref(false);

const files = ref([]);

const videos = ref([]);

const uploadFile = ref(null);

const images = computed(() => {
    return sortedFiles.value.map(l => l.url);
})

const videoUrls = computed(() => {
    return videos.value.map(l => l.url);
})

const setting = ref(plugin.setting);

watch(setting.value, () => plugin.saveSetting(setting.value));

const total = computed(() => {
    if (setting.mode === 'grid') {
        return videos.value.length + images.value.length;
    }
    return images.value.length;
})

const sortedFiles = computed(() => {
    const sort = setting.value.sort;
    if (sort === 'nameIncrease') {
        return files.value.sort((a, b) => compare(a.name, b.name));
    }
    if (sort === 'nameDecrease') {
        return files.value.sort((a, b) => compare(b.name, a.name));
    }
    if (sort === 'dateIncrease') {
        return files.value.sort((a, b) => compare(a.updated, b.updated));
    }
    return files.value.sort((a, b) => compare(b.updated, a.updated));
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

const onUpload = () => {
    uploadFile.value.click();
}

const onPaste = async () => {
    try {
        const item_list = await navigator.clipboard.read();
        const blob = await item_list[0]?.getType('image/png');
        if (!blob) {
            return;
        }
        // @ts-ignore
        const id = window.Lute.NewNodeID();
        await plugin.storage.addFileBlob(path, blob, `${id}.png`);
        getImages();
    } catch (e) {
        try {
            // @ts-ignore
            const { clipboard } = window.require('electron');
            const image = clipboard.readImage('clipboard');
            if (!image) {
                return;
            }
            const img = image.toDataURL();
            const type = /^data:(.*);/.exec(img);
            if (!type || !type[1]) {
                return;
            }
            const isPng = type[1] === 'image/png';
            const isJpeg = type[1] === 'image/jpeg';
            let buffer;
            if (isPng) {
                buffer = image.toPNG();
            } else if (isJpeg) {
                buffer = image.toJPEG();
            } else {
                return;
            }
            const blob = new Blob([buffer]);
            // @ts-ignore
            const id = window.Lute.NewNodeID();
            await plugin.storage.addFileBlob(path, blob, `${id}.png`);
            getImages();
        } catch (e) {
            console.error(e);
            showMessage(_('onPasteError'));
            return;
        }
    }
}

const onShowInFloder = () => {
    // @ts-ignore
    const { shell } = window.require('@electron/remote') // deconstructing assignment
    const absPath = window.siyuan.config.system.workspaceDir + path;
    shell.showItemInFolder(absPath);
}

const onClickVideo = (f) => {
    openTab({
        app: window.siyuan.ws.app,
        asset: {
            path: f.slice(1),
        },
        position: 'right',
        keepCursor: false,
        removeCurrentTab: true,
    })
}

const refresh = () => getImages();

onMounted(() => {
    getImages();
    uploadFile.value.addEventListener('change', async function () {
        await plugin.storage.addFiles(path, Array.from(this.files).map((file) => {
            let name = file.name;
            if (!setting.value.overwrite && images.value.some((i) => i.endsWith(file.name))) {
                const id = window.Lute.NewNodeID();
                name = id + '.' + name.split('.')[name.split('.').length - 1];
            }
            return { file, name };
        }));
        getImages();
    })
})

const getImages = () => {
    // getFiles(path).then((list) => {
    //     files.value = list.filter(l => isPicture(l.name));
    // });
    return getFiles(path).then(list => {
        files.value = list.filter(l => l.isPicture);
        videos.value = list.filter(l => l.isVideo);
    })
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
        if (filename.endsWith('webp')) {
            throw Error('webp not support');
        }
        return {
            filename,
            blob,
        }
    }).then((b) => {
        if (!b) {
            return;
        }
        let name = b.filename;
        if (!setting.value.overwrite && images.value.some((i) => i.endsWith(b.filename))) {
            const id = window.Lute.NewNodeID();
            name = id + '.' + name.split('.')[name.split('.').length - 1];
        }
        return plugin.storage.addFileBlob(path, b.blob, name);
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
    console.log(d);
    if (d && d.length > 0) {
        const files = Array.from(d).map((file) => {
            let name = file.name;
            if (!setting.value.overwrite && images.value.some((i) => i.endsWith(file.name))) {
                const id = window.Lute.NewNodeID();
                name = id + '.' + name.split('.')[name.split('.').length - 1];
            }
            return { file, name };
        })
        await plugin.storage.addFiles(path, files);
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

const copyAsPng = async (path) => {
    const png = await getPngFunc(path);
    return navigator.clipboard.write([new ClipboardItem({
        'image/png': png,
    })]);
}

const deleteFileConfirm = (path) => {
    confirm('⚠️' + _('deleteConfirm'), _('deleteConfirmText'), async () => {
        await plugin.storage.deleteFile('/data/' + decodeURI(path));
        getImages();
    });
}

const onContextClick = (f, e) => {
    const m = new Menu('sppl-menu');
    m.addItem({
        label: decodeURI(f.split('/').pop()),
        icon: 'iconImage',
    });
    m.addSeparator();
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
    m.addItem({
        label: _('copyAsPng'),
        icon: 'iconCopy',
        click: () => copyAsPng(f),
    })
    m.addSeparator();
    m.addItem({
        label: _('deleteFile'),
        icon: 'iconTrashcan',
        click: () => deleteFileConfirm(f),
    });
    m.open({ x: e.pageX, y: e.pageY });
}


// const plugin = inject('plugin');
</script>
<style scoped>
.tab-setting {
    display: block;
    border-bottom: 1px solid var(--b3-theme-background-light);
    z-index: 1;
    padding: 4px 8px;
}

html[data-theme-mode='dark'] .tab-setting {
    background-color: rgba(30, 30, 30, 0.88);
}

html[data-theme-mode='light'] .tab-setting {
    background-color: rgba(255, 255, 255, 0.88);
}


.sppl-plugin-tab {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.sppl-image {
    display: inline-block;
    margin: 6px;
}

.sppl-video {
    cursor: pointer;
    display: inline-block;
    margin: 6px;
    object-fit: cover;
}

.video-preview {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

.video-preview .play-icon {
    position: absolute;
    right: 16px;
    bottom: 16px;
    background-color: rgba(0,0,0,.5);
    padding: 4px;
    border-radius: 4px;
    font-size: 12px;
    height: 12px;
    width: 12px;
}

.video-preview .play-icon svg {
    font-size: 12px;
    height: 12px;
    width: 12px;
}

.sppl-manga {
    display: block;
    margin: 12px auto;
    text-align: center;
}


.image-wall {
    width: 100%;
    flex: 1 1 auto;
    overflow-y: scroll;
}

.manga-wall {
    width: 100%;
    flex: 1 1 auto;
    overflow-y: scroll;
}

.tab-setting-item {
    display: inline-block;
    margin: 4px;
    vertical-align: middle;
}

.tab-setting-item>div {
    display: inline-block;
}

.tab-setting-item>button,
.tab-setting-item>span,
.tab-setting-item>input {
    position: relative;
}

.tab-setting-item>.b3-label__text {
    vertical-align: middle;
}

.tab-setting-item>.b3-select {
    position: relative;
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