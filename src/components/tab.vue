<template>
    <div class="sppl-plugin-tab" @dragenter="onDragEnter" @dragover="onDragOver" @drop="onDrop"
        @dragleave="onDragLeave">
        <div class="tab-setting">
            <div class="tab-setting-item">
                <div class="b3-label__text">{{ _('mode') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.mode">
                    <option v-for="k in setting.modes" :value="k">{{ _(k) }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('mode', setting.modes, (v) => _(v), _('mode'))">
                    <span class="sppl-picker__value">{{ _(setting.mode) }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'grid'">
                <div class="b3-label__text">{{ _('size') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.size">
                    <option v-for="k in setting.sizes" :value="k">{{ k }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('size', setting.sizes, (v) => v, _('size'))">
                    <span class="sppl-picker__value">{{ setting.size }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'ratio'">
                <div class="b3-label__text">{{ _('ratio') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.ratio">
                    <option v-for="k in setting.ratios" :value="k">{{ _('ratio_' + k) }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('ratio', setting.ratios, (v) => _('ratio_' + v), _('ratio'))">
                    <span class="sppl-picker__value">{{ _('ratio_' + setting.ratio) }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'ratio'">
                <div class="b3-label__text">{{ _('size') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.ratioSize">
                    <option v-for="k in setting.ratioSizes" :value="k">{{ k }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('ratioSize', setting.ratioSizes, (v) => v, _('ratioSize'))">
                    <span class="sppl-picker__value">{{ setting.ratioSize }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item" v-if="setting.mode === 'manga'">
                <div class="b3-label__text">{{ _('mangaSize') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.mangaSize">
                    <option v-for="k in setting.mangaSizes" :value="k">{{ k }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('mangaSize', setting.mangaSizes, (v) => v, _('mangaSize'))">
                    <span class="sppl-picker__value">{{ setting.mangaSize }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item">
                <div class="b3-label__text">{{ _('sort') }}</div>
                <select v-if="!isMobile" class="b3-select" v-model="setting.sort">
                    <option v-for="k in setting.sorts" :value="k">{{ _(k) }}</option>
                </select>
                <button v-else class="b3-button sppl-picker"
                    @click="pickOne('sort', setting.sorts, (v) => _(v), _('sort'))">
                    <span class="sppl-picker__value">{{ _(setting.sort) }}</span>
                    <svg class="sppl-picker__arrow"><use xlink:href="#iconDown"></use></svg>
                </button>
            </div>
            <div class="tab-setting-item">
                <input type="checkbox" class="b3-button" v-model="setting.overwrite">
                <span>{{ _('overwrite') }}</span>
            </div>
            <div class="tab-setting-item">
                <input type="checkbox" class="b3-button" v-model="setting.showImage">
                <span>{{ _('showImage') }}</span>
            </div>
            <div class="tab-setting-item">
                <input type="checkbox" class="b3-button" v-model="setting.showVideo">
                <span>{{ _('showVideo') }}</span>
            </div>
            <div class="tab-setting-item">
                <!-- 用 label for 触发：iOS 对 JS click() 打开的文件选择器偶尔不传 change -->
                <label class="b3-button sppl-upload-label" for="uploadFile">{{ _('uploadImage') }}</label>
                <input ref="uploadFile" type="file" name="uploadFile" id="uploadFile" multiple
                    class="sppl-upload-input" accept="image/*,video/*">
                <div class="sppl-upload-status" v-if="uploadStatus">{{ uploadStatus }}</div>
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="onPaste">{{ _('pasteImage')
                    }}</button>
            </div>
            <div class="tab-setting-item sppl-desktop-only">
                <button class="b3-button" @click="toggleClipboardWatch">{{ !timerAutoClipboard ? _('toggleClipboardWatchOn') : _('toggleClipboardWatchOff')
                    }}</button>
            </div>
            <div class="tab-setting-item sppl-desktop-only">
                <button class="b3-button" @click="onShowInFloder">{{ _('showInFolder') }}</button>
            </div>
            <div class="tab-setting-item">
                <button class="b3-button" @click="refresh">{{ _('refresh') }}</button>
            </div>
            <div class="tab-setting-item">
                <span>共 {{ total }} 个</span>
            </div>
        </div>
        <div v-if="!firstLoading">{{  _('loading')  }}</div>
        <div class="image-wall" v-if="setting.mode === 'grid'">
            <View v-if="setting.showImage" :key="f" v-for="(f, $i) in infiniteImages" class="sppl-image" :class="gridClass"
                :hide-on-click-modal="false"
                :preview-teleported="true"
                :src="f" fit="cover" @contextmenu="onContextClick(f, $event)" :initial-index="$i"
                :preview-src-list="images" loading="lazy" decoding="async">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)" @contextmenu="onContextClick(f, $event)">{{
        _('loadFailed') }}</div>
                </template>
            </View>
            <div v-if="setting.showVideo && infiniteImages.length === images.length" class="video-preview" @contextmenu="onContextClick(f, $event)" :key="f"
                v-for="(f, $i) in videoUrls" v-on:click="() => onClickVideo(f)" :class="gridClass">
                <video :src="videoSrc(f)" class="sppl-video" preload="metadata" loop muted playsinline
                    :ref="(el) => prepareVideoEl(el)"></video>
                <div class="play-icon" style="">
                    <span class="sppl-duration" :ref="(el) => getVideo(el)"></span>
                    <svg>
                        <use xlink:href="#iconPlay"></use>
                    </svg>
                </div>
            </div>
            <InfiniteLoading @infinite="onInfiniteLoad" v-show="infiniteImages.length !== images.length" />
        </div>
        <div class="image-wall" v-if="setting.mode === 'ratio'">
            <View v-if="setting.showImage" :key="f" v-for="(f, $i) in infiniteImages" 
                class="sppl-image" :style="ratioStyle"
                :hide-on-click-modal="false"
                :preview-teleported="true"
                :initial-index="$i"
                :src="f" fit="cover" @contextmenu="onContextClick(f, $event)" 
                :preview-src-list="images" loading="lazy" decoding="async">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)" 
                        @contextmenu="onContextClick(f, $event)">
                        {{ _('loadFailed') }}
                    </div>
                </template>
            </View>
            <InfiniteLoading @infinite="onInfiniteLoad" 
                v-show="infiniteImages.length !== images.length" />
        </div>
        <div class="manga-wall" v-if="setting.showImage && setting.mode === 'manga'">
            <el-image :key="f" v-for="(f, $i) in images" class="sppl-manga" :style="mangaStyle" :src="f" fit="cover"
                :hide-on-click-modal="true"
                @contextmenu="onContextClick(f, $event)" :lazy="true"
                v-bind="isMobile ? {} : { 'initial-index': $i, 'preview-src-list': images }"
                @click="onMangaClick($i)"
                loading="lazy">
                <template #error>
                    <div class="image-slot" @click="() => sm(f)" @contextmenu="onContextClick(f, $event)">{{
        _('loadFailed') }}</div>
                </template>
            </el-image>
        </div>
        <div class="drop-hover" v-show="showDropHover">
            <h1 class="drop-hover-title">{{ _('dropHoverTitle') }}</h1>
        </div>
    </div>
</template>
<script setup>
import { computed, inject, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import { getFiles } from '../storage/file';
import { showMessage, Menu, confirm, openTab } from 'siyuan';
import { FILE_EXT, VIDEO_EXT } from '../util/constants';
import { _ } from '../util/i18n';
import { getPngFunc, isPicture } from '../util/image';
import InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";
import View from './view.vue';
import { isMobileFrontend } from '../util/mobile';
import { openMobilePlayer } from '../util/mobile-player';
import { openMobileImageViewer } from '../util/mobile-image-viewer';
import { openMobilePicker } from '../util/mobile-picker';

// @ts-ignore
const { path } = inject('folder');
const plugin = inject('plugin');

const isMobile = isMobileFrontend();

// 移动端用自建预览层（支持左右切换 / 上滑关闭 / 双指缩放）
const onMangaClick = (i) => {
    if (isMobile) {
        openMobileImageViewer(images.value, i);
    }
};

const showDropHover = ref(false);

const firstLoading = ref(false);

const imageFiles = ref([]);

const videoFiles = ref([]);

const uploadFile = ref(null);
const uploadStatus = ref('');

const page = ref(1);

const pageSize = 40;

const infiniteTriggered = ref(false);

const images = computed(() => {
    return sortedImageFiles.value.map(l => l.url);
});

const infiniteImages = computed(() => images.value.slice(0, page.value * pageSize))

const videoUrls = computed(() => {
    return sortedVideoFiles.value.map(l => l.url);
})

const setting = ref(plugin.setting);

// 移动端下拉框改成底部选择面板（原生 select 在手机上点不动）
const pickOne = (key, values, labelOf, title) => {
    openMobilePicker({
        title,
        options: (values || []).map((v) => ({ value: v, label: labelOf(v) })),
        value: setting.value[key],
        onSelect: (v) => {
            setting.value[key] = v;
        },
    });
};

// 添加新的设置项
setting.value.modes = ['grid', 'manga', 'ratio'];
setting.value.ratios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9'];
setting.value.ratioSizes = [50, 100, 150, 200, 250, 300];
setting.value.ratio = setting.value.ratio || '3:4';
setting.value.ratioSize = setting.value.ratioSize || 100;

watch(setting.value, () => plugin.saveSetting(setting.value));

const total = computed(() => {
    return (setting.value.showVideo ? videoUrls.value.length : 0)
        + (setting.value.showImage ? images.value.length : 0);
});

const onInfiniteLoad = (e) => {
    page.value++;
    infiniteTriggered.value = true;
}

// iOS Safari 在只有 metadata 时不绘制首帧，media fragment 让它定位到 0.1s 出封面
const videoSrc = (f) => `${f}#t=0.1`;

const getVideo = (el) => {
    if (!el || el.textContent.length > 0) {
        return;
    }
    setTimeout(() => {
        const videoElement = el.parentElement.parentElement.children[0];
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                el.textContent = formatTime(videoElement.duration);
                resolve(el);
            }
        })
    }, 0);

}

const formatTime = (d) => {
    if (isNaN(d)) {
        return '';
    }
    let second = Math.floor(d);
    let minute = 0;
    let hour = 0;
    if (second > 60) {
        minute = Math.floor(second / 60);
        second = second - minute * 60;
        if (minute > 60) {
            hour = Math.floor(minute / 60);
            minute = minute - hour * 60;
        }
        let time = '';
        time += (second)
        if (minute != 0) {
            time = minute + ':' + time
        }
        if (hour > 0) {
            time = hour + ':' + String(minute).padStart(2, '0') + ':' + String(second).padStart(2, '0');
        } else {
            time = minute + ':' + String(second).padStart(2, '0');
        }
        return time;
    } else {
        return '0:' + second.toFixed(0).padStart(2, '0');
    }
}

const sortedImageFiles = computed(() => {
    const sort = setting.value.sort;
    if (sort === 'nameIncrease') {
        return imageFiles.value.sort((a, b) => compare(a.name, b.name));
    }
    if (sort === 'nameDecrease') {
        return imageFiles.value.sort((a, b) => compare(b.name, a.name));
    }
    if (sort === 'dateIncrease') {
        return imageFiles.value.sort((a, b) => compare(a.updated, b.updated));
    }
    return imageFiles.value.sort((a, b) => compare(b.updated, a.updated));
})

const sortedVideoFiles = computed(() => {
    const sort = setting.value.sort;
    if (sort === 'nameIncrease') {
        return videoFiles.value.sort((a, b) => compare(a.name, b.name));
    }
    if (sort === 'nameDecrease') {
        return videoFiles.value.sort((a, b) => compare(b.name, a.name));
    }
    if (sort === 'dateIncrease') {
        return videoFiles.value.sort((a, b) => compare(a.updated, b.updated));
    }
    return videoFiles.value.sort((a, b) => compare(b.updated, a.updated));
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

const gridClass = computed(() => 'size_' + setting.value.size)

const mangaStyle = computed(() => ({
    width: `${setting.value.mangaSize}`,
}));

const ratioStyle = computed(() => {
    const size = setting.value.ratioSize;
    const [w, h] = setting.value.ratio.split(':').map(Number);
    return {
        width: `${size * w}px`,
        height: `${size * h}px`,
        objectFit: 'cover'
    };
});

const onUpload = () => {
    uploadStatus.value = '打开文件选择器…';
    try {
        uploadFile.value.click();
    } catch (e) {
        uploadStatus.value = '打不开文件选择器：' + ((e && e.message) || e);
    }
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
        getImagesAndVideos();
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
            getImagesAndVideos();
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

const prepareVideoEl = (el) => {
    if (!el) {
        return;
    }
    // 移动端点一下就会触发 mouseover，预览视频会在后台一直播，禁掉
    if (isMobileFrontend()) {
        try { el.pause(); } catch (e) { /* ignore */ }
        return;
    }
    el.removeEventListener('mouseover', onMouseOverVideo)
    el.removeEventListener('mouseleave', onMouseLeaveVideo)
    el.addEventListener('mouseover', onMouseOverVideo)
    el.addEventListener('mouseleave', onMouseLeaveVideo)
}

const onMouseOverVideo = (e) => {
    const video = e.target;
    if (!video) {
        return;
    }
    video.play()
}

const onMouseLeaveVideo = (e) => {
    const video = e.target;
    if (!video) {
        return;
    }
    if (video.timer) {
        clearTimeout(video.timer);
        return;
    }
    video.pause();
}

const onClickVideo = (f) => {
    if (isMobileFrontend()) {
        const name = f.split('/').pop() || f;
        let title = name;
        try { title = decodeURIComponent(name); } catch (e) { /* 保留原名 */ }
        openMobilePlayer(f, title);
        return;
    }
    console.log(plugin.eventBus)
    const u = f.slice(1).replace('.MP4', '.mp4');
    const player = window.siyuanMediaPlayer;
    if (typeof player?.playMediaItem === 'function') {
        player.playMediaItem({
            url: u,
            title: u.split('/').pop() || u,
            position: 'right',
        });
        return;
    }

/** 
// 播放控制
player.toggle()                 // 播放/暂停
player.pause()                  // 暂停
player.resume()                 // 继续

// 进度控制
player.seekTo(60)              // 跳转到指定时间（秒）
player.seek(10)                // 快进10秒 / seek(-10) 快退
player.getCurrentTime()        // 获取当前时间 -> number

// 速度控制
player.increaseSpeed()         // 加速
player.decreaseSpeed()         // 减速

// 获取状态
player.getCurrentMedia()       // 获取媒体信息 -> MediaItem
player.isPlaying()            // 是否播放中 -> boolean

// 功能操作
player.triggerAction('screenshot')   // 截图
player.triggerAction('timestamp')    // 创建时间戳
player.triggerAction('loopSegment')  // 循环片段
player.triggerAction('mediaNotes')   // 媒体笔记
player.triggerAction('prev')         // 上一曲
player.triggerAction('next')         // 下一曲
*/
    openTab({
        app: window.siyuan.ws.app,
        asset: {
            path: u,
        },
        position: 'right',
        keepCursor: false,
        removeCurrentTab: true,
    }).then((tab) => {
        const videoEl = tab.panelElement.querySelector('video');
        if (!videoEl) {
            return;
        }
        if (videoEl.readyState) {
            if (!videoEl.paused) {
                videoEl.pause();
            } else {
                videoEl.play();
            }
            return;
        }
        videoEl.oncanplay = () => {
            videoEl.play();
        };
    })
}

const refresh = () => getImagesAndVideos();

const SUPPORTED_EXT = FILE_EXT.concat(VIDEO_EXT);

// iOS 从相册选的视频可能叫 IMG_1234.MOV，甚至没有后缀，所以除了后缀再看 MIME
const extOf = (name) => {
    const lower = (name || '').toLowerCase();
    const idx = lower.lastIndexOf('.');
    return idx >= 0 ? lower.slice(idx) : '';
};

// iPhone 相册原图常是 HEIC，思源的图片组件渲染不了，传上去也是空白格，直接拦掉并提示
const UNSUPPORTED_EXT = ['.heic', '.heif'];

const isSupportedFile = (file) => {
    const ext = extOf(file.name);
    if (UNSUPPORTED_EXT.includes(ext)) {
        return false;
    }
    if (ext && SUPPORTED_EXT.includes(ext)) {
        return true;
    }
    const type = (file.type || '').toLowerCase();
    if (type === 'image/heic' || type === 'image/heif') {
        return false;
    }
    return type.startsWith('image/') || type.startsWith('video/');
};

// 没有后缀时按 MIME 补一个，否则写盘和预览都认不出来
const normalizeName = (file) => {
    const name = file.name || 'upload';
    if (extOf(name)) {
        return name;
    }
    const sub = ((file.type || '').split('/')[1] || 'bin').toLowerCase();
    return `${name}.${sub === 'quicktime' ? 'mov' : sub}`;
};

// 直接调 putFile 以便拿到 HTTP 状态：storage.addFiles 不检查响应，失败也是静默的
// 用 XHR 而不是 fetch：iOS Safari 上用 fetch 传大 multipart 偶尔直接 Load failed，
// 而且拿不到上传进度，出错也说不清是网络断了还是服务端拒绝。
const putFile = (target, file, onProgress) => new Promise((resolve) => {
    const fd = new FormData();
    fd.append('path', target);
    fd.append('isDir', 'false');
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/file/putFile');
    xhr.timeout = 180000;
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
            onProgress(Math.round((e.loaded / e.total) * 100));
        }
    };
    xhr.onload = () => {
        let body = null;
        try {
            body = JSON.parse(xhr.responseText);
        } catch (e) {
            // 空响应或非 JSON（例如反向代理的 413 页面）
        }
        const httpOk = xhr.status >= 200 && xhr.status < 300;
        resolve({
            status: xhr.status,
            ok: httpOk && (!body || body.code === 0),
            msg: (body && body.msg) || (httpOk ? '' : (xhr.responseText || '').slice(0, 80)),
        });
    };
    xhr.onerror = () => resolve({ status: 0, ok: false, msg: '网络错误，请求没有送达' });
    xhr.ontimeout = () => resolve({ status: 0, ok: false, msg: '上传超时（180s）' });
    xhr.onabort = () => resolve({ status: 0, ok: false, msg: '上传被中断' });
    xhr.send(fd);
});

const onFilesSelected = async (event) => {
    const input = event.target;
    const files = Array.from(input.files || []);
    if (!files.length) {
        uploadStatus.value = '没有拿到文件（选择可能被取消）';
        return;
    }

    const accepted = files.filter(isSupportedFile);
    const skipped = files.length - accepted.length;
    uploadStatus.value = `已选择 ${files.length} 个，可上传 ${accepted.length} 个，目录 ${path}`;

    if (!accepted.length) {
        const names = files.map((f) => f.name).join(', ');
        const hasHeic = files.some((f) => UNSUPPORTED_EXT.includes(extOf(f.name)) || /^image\/hei[cf]$/i.test(f.type || ''));
        uploadStatus.value = `不支持的类型：${names}`;
        showMessage(hasHeic
            ? 'HEIC 格式无法在图库预览：请在 设置 → 相机 → 格式 里选择「兼容性最佳」，或先转成 JPG 再上传'
            : `不支持的类型：${names}`);
        input.value = '';
        return;
    }

    let okCount = 0;
    const errors = [];
    for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        let name = normalizeName(file);
        if (!setting.value.overwrite && images.value.some((item) => item.endsWith(name))) {
            const id = window.Lute.NewNodeID();
            name = id + '.' + name.split('.').pop();
        }
        const target = `${path}/${name}`;
        const label = `${i + 1}/${accepted.length} ${name}`;
        uploadStatus.value = `上传中 ${label}`;
        const onProgress = (pct) => {
            uploadStatus.value = `上传中 ${label} ${pct}%`;
        };
        let result = await putFile(target, file, onProgress);
        // 网络类失败重试一次（真机上偶发隧道抖动）
        if (!result.ok && result.status === 0) {
            uploadStatus.value = `重试 ${label}`;
            result = await putFile(target, file, onProgress);
        }
        if (result.ok) {
            okCount++;
        } else {
            errors.push(`${name}: ${result.status ? 'HTTP ' + result.status + ' ' : ''}${result.msg}`.trim());
        }
    }

    if (errors.length) {
        uploadStatus.value = `成功 ${okCount}，失败 ${errors.length}：${errors[0]}`;
        showMessage(`上传失败：${errors[0]}`);
    } else {
        uploadStatus.value = `上传完成 ${okCount} 个 → ${path}`;
        showMessage(`已上传 ${okCount} 个 → ${path}`);
        if (skipped > 0) {
            showMessage(_('uploadSkipped').replace('%s', String(skipped)));
        }
    }

    input.value = '';
    getImagesAndVideos();
};

onMounted(() => {
    getImagesAndVideos();
    if (uploadFile.value && !uploadFile.value.__spplBound) {
        uploadFile.value.__spplBound = true;
        uploadFile.value.addEventListener('change', onFilesSelected);
    }
});

onUnmounted(() => {
    if (timerAutoClipboard.value) {
        clearInterval(timerAutoClipboard.value);
    }
})

const getImagesAndVideos = () => {
    // getFiles(path).then((list) => {
    //     files.value = list.filter(l => isPicture(l.name));
    // });
    return getFiles(path).then(list => {
        page.value = 1;
        infiniteTriggered.value = false;
        imageFiles.value = list.filter(l => l.isPicture);
        videoFiles.value = list.filter(l => l.isVideo);
        firstLoading.value = true;
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
        getImagesAndVideos();
    } else {
        const uri = e.dataTransfer?.getData('text/uri-list');
        if (uri) {
            await downloadUri(uri, path);
            getImagesAndVideos();
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
        getImagesAndVideos();
    });
}

const onContextClick = (f, e) => {
    console.log(f, e);
    const m = new Menu('sppl-menu');
    if (isPicture(f)) {
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
    } else {
        m.addItem({
            label: decodeURI(f.split('/').pop()),
            icon: 'iconVideo',
        });
        m.addSeparator();
        m.addItem({
            label: _('copyPath'),
            icon: 'iconCopy',
            click: () => copyUrl(f),
        })
    }
    m.addSeparator();
    m.addItem({
        label: _('deleteFile'),
        icon: 'iconTrashcan',
        click: () => deleteFileConfirm(f),
    });
    m.open({ x: e.pageX, y: e.pageY });
    console.log(m);
}


// watch clipboard
const timerAutoClipboard = ref(null);

let timerImage = '';

let initImage = false;

const toggleClipboardWatch = () => {
    if (timerAutoClipboard.value) {
        clearInterval(timerAutoClipboard.value);
        timerAutoClipboard.value = null;
        timerImage = '';
        initImage = false;
        return;
    }
    timerAutoClipboard.value = setInterval(() => {
        // @ts-ignore
        const { clipboard } = window.require('electron');
        const image = clipboard.readImage('clipboard');
        if (!image) {
            initImage = true;
            return;
        }
        const imageUrl = image.toDataURL();
        if (timerImage !== imageUrl) {
            timerImage = imageUrl;
            if (!initImage) {
                initImage = true;
            } else {
                onPaste();
            }
        }
    }, 500)
}

// const plugin = inject('plugin');
</script>
<style>
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
    object-fit: cover;
    width: 100%;
    height: 100%;
}

.video-preview {
    margin: 6px;
    position: relative;
    display: inline-block;
    cursor: pointer;
    vertical-align: top;
}

.video-preview .play-icon {
    position: absolute;
    right: 8px;
    bottom: 8px;
    background-color: rgba(0, 0, 0, .5);
    padding: 4px;
    border-radius: 4px;
    font-size: 12px;
    height: 12px;
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

.sppl-duration {
    line-height: 12px;
    font-size: 12px;
    margin-right: 4px;
    display: inline-block;
    position: relative;
    top: -1px;
}

.size_100 {
    width: 100px;
    height: 100px;
}
.size_200 {
    width: 200px;
    height: 200px;
}
.size_400 {
    width: 400px;
    height: 400px;
}
.size_600 {
    width: 600px;
    height: 600px;
}
.size_800 {
    width: 800px;
    height: 800px;
}
.size_1000 {
    width: 1000px;
    height: 1000px;
}
.size_1200 {
    width: 1200px;
    height: 1200px;
}
</style>