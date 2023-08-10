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

const plugin = inject('plugin');
const storage = plugin.storage;

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

const copy = (node, e) => {
  e.stopPropagation();
  const pluginName = "siyuan-plugin-picture-library";
  const tabType = TAB_TYPE;
  const link = `siyuan://plugins/${pluginName}${tabType}?icon=${ICON}&title=${node.name}&data=${JSON.stringify(
    { name: node.name, path: node.path }
  )}`;
  navigator.clipboard.writeText(`[${node.name}](${encodeURI(link)})`);
};

dataSource.value = storage.getNodes();

watch(storage.folders, () => {
  updateDatasource(storage.getNodes());
  dataSource.value = storage.folders;
});

const append = (node, e) => {
  e.stopPropagation();
  createFolder().then((v) => {
    storage.addFolder(node.path, v).then(() => dataSource.value = [...dataSource.value]);
  })
}

const remove = (node, e) => {
  e.stopPropagation();
  confirm('⚠️', '确认删除' + node.name + '?', () => {
    if (node.isRoot) {
      storage.removeRootFolder(node.name).then(() => dataSource.value = [...dataSource.value]);
    } else {
      storage.removeFolder(node.path, node.name).then(() => dataSource.value = [...dataSource.value]);
    }
  })

}

const handleNodeClick = (data) => {
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
            const randomId = window.Lute.NewNodeID();
            const content = `<div id="${randomId}" data-plugin="siyuan-plugin-picture-library" data-height="400px" data-path="${data.path}">请使用Siyuan Plugin Picture Library插件已使用此自定义块内容</div>`;
            navigator.clipboard.writeText(content);
          },
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('copyCarousel') }, h('svg', null, h('use', { 'xlink:href': `#iconDock` })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => copy(data, e),
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('copyLink') }, h('svg', null, h('use', { 'xlink:href': '#iconCopy' })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => append(data, e),
        },
        h('span', { 'class': 'sppl-icon b3-tooltips b3-tooltips__w', 'aria-label': _('add') }, h('svg', null, h('use', { 'xlink:href': '#iconAdd' })))
      ),
      h(
        'a',
        {
          style: 'margin-left: 8px',
          onClick: (e) => remove(data, e),
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
  