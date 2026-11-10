<template>
  <div class="sppl-filetree">
    <el-tree :data="dataSource" :props="treeProps" node-key="path" :default-expand-all="true"
      :expand-on-click-node="false" :render-content="renderContent" @node-click="handleNodeClick" />
  </div>
</template>
  
<script setup>
import { inject, watch, ref } from 'vue'
import { createFolder } from '../util/dialog';
import { openTab, confirm } from 'siyuan';
import { _ } from '../util/i18n';
import { TAB_TYPE, ICON } from '../util/constants'
import { buildGalleryMarkdown } from '../util/gallery-link';
import { openMobileGallery } from '../util/mobile-gallery';
import { isMobileFrontend } from '../util/mobile';
import { openMobileActionSheet } from '../util/mobile-actions';

const plugin = inject('plugin');
const storage = plugin.storage;
const mobile = isMobileFrontend();

const treeProps = {
  children: 'folders'
}

const dataSource = ref([]);

const updateDatasource = (s) => {
  (s.folders || []).forEach(ss => {
    ss.parent = s;
    updateDatasource(ss);
  });
}

const copyLink = (node) => {
  navigator.clipboard.writeText(buildGalleryMarkdown(node));
};

const copyCarousel = (node) => {
  const randomId = window.Lute.NewNodeID();
  const content = `<div><div id="${randomId}" data-plugin="siyuan-plugin-picture-library" data-height="400px" data-path="${node.path}">请使用Siyuan Plugin Picture Library插件已使用此自定义块内容</div></div>
{: custom-plugin-id="siyuan-plugin-picture-library" id="${randomId}"}`;
  navigator.clipboard.writeText(content);
};

const addFolder = (node) => {
  createFolder().then((v) => {
    storage.addFolder(node.path, v).then(() => dataSource.value = [...dataSource.value]);
  })
}

const removeFolder = (node) => {
  confirm('⚠️', '确认删除' + node.name + '?', () => {
    if (node.isRoot) {
      storage.removeRootFolder(node.name).then(() => dataSource.value = [...dataSource.value]);
    } else {
      storage.removeFolder(node.path, node.name).then(() => dataSource.value = [...dataSource.value]);
    }
  })
}

const openNodeActions = (data) => {
  openMobileActionSheet(data.name, [
    { icon: 'iconCopy', label: _('copyLink'), onClick: () => copyLink(data) },
    { icon: 'iconDock', label: _('copyCarousel'), onClick: () => copyCarousel(data) },
    { icon: 'iconAdd', label: _('add'), onClick: () => addFolder(data) },
    { icon: 'iconTrashcan', label: _('delete'), onClick: () => removeFolder(data) },
  ]);
};

dataSource.value = storage.getNodes();

watch(storage.folders, () => {
  updateDatasource(storage.getNodes());
  dataSource.value = storage.folders;
});

const handleNodeClick = (data) => {
  // 移动端 addTab 是空实现，plugin.tabFn 为 undefined，只能用全屏浮层
  if (!plugin.tabFn || isMobileFrontend()) {
    openMobileGallery(plugin, { path: data.path, name: data.name });
    return;
  }
  openTab({
    app: plugin.app,
    custom: {
      title: data.name,
      fn: plugin.tabFn,
      icon: 'iconPictureLibrary',
      data: { path: data.path, name: data.name }
    }
  })
}

const renderContent = (
  h,
  {
    // node,
    data,
  }
) => {
  // 移动端一行只放「名称 + ⋯」，操作收进底部面板，点击区域才够大
  if (mobile) {
    return h(
      'span',
      { class: 'sppl-tree-node sppl-tree-node--mobile' },
      h('span', { class: 'sppl-tree-node__name' }, data.name),
      h(
        'span',
        {
          class: 'sppl-node-more',
          role: 'button',
          'aria-label': _('more'),
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            openNodeActions(data);
          },
        },
        '⋯'
      )
    );
  }

  return h(
    'span',
    {
      class: 'sppl-tree-node',
    },
    h('span', null, data.name),
    h(
      'span',
      null,
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyCarousel(data);
          },
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('copyCarousel') }, h('svg', null, h('use', { 'xlink:href': `#iconDock` })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => {
            e.stopPropagation();
            copyLink(data);
          },
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('copyLink') }, h('svg', null, h('use', { 'xlink:href': '#iconCopy' })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => {
            e.stopPropagation();
            addFolder(data);
          },
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('add') }, h('svg', null, h('use', { 'xlink:href': '#iconAdd' })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => {
            e.stopPropagation();
            removeFolder(data);
          },
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('delete') }, h('svg', null, h('use', { 'xlink:href': '#iconTrashcan' })))
      ),
    )
  )
}

</script>
  
<style>
.sppl-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  color: var(--b3-theme-on-background);
}

.sppl-dock .el-tree-node__content:hover .sppl-tree-node,
.sppl-dock .el-tree-node__content:active .sppl-tree-node,
.sppl-dock .el-tree-node__content:focus .sppl-tree-node {
  color: var(--b3-theme-primary);
}

.sppl-icon>svg {
  font-size: 14px;
  height: 14px;
  width: 14px;
}
</style>
