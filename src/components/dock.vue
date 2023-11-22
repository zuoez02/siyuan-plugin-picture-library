<template>
<div class="fn__flex-1 fn__flex-column sppl-dock">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconEmoji"></use></svg>
            {{ _('title') }}
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span data-type="add" class="block__icon b3-tooltips b3-tooltips__sw" :aria-label="_('refresh')" @click="refresh"><svg><use xlink:href="#iconRefresh"></use></svg></span>
        <span data-type="add" class="block__icon b3-tooltips b3-tooltips__sw" :aria-label="_('add')" @click="add"><svg><use xlink:href="#iconAdd"></use></svg></span>
        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" :aria-label="_('min')"><svg><use xlink:href="#iconMin"></use></svg></span>
    </div>
    <div class="fn__flex-1">
       <Filetree></Filetree>
    </div>
</div>
</template>
<script setup>
import Filetree from './filetree.vue';
import { inject } from 'vue';
import { createFolder } from '../util/dialog';
import { _ } from '../util/i18n';

const plugin = inject('plugin');
const storage = plugin.storage;

const add = () => {
    createFolder().then((v) => {
        storage.addRootFolder(v);
    })
}

const refresh = () => {
    storage.refresh();
}

</script>