import { Plugin } from "siyuan";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Dock from './components/dock.vue';
import Tab from './components/tab.vue';
import { createApp } from 'vue';
import { Storage } from "./storage";
import { reactive } from 'vue';
import { _, setI18n } from './util/i18n';
import { icon, carousel } from './assets/icon';
import { registerIcon } from './util/registerIcon';
import './style.css';
import { TAB_TYPE, ICON, CAROUSEL } from "./util/constants";
import { updateRenderer } from './util/renderer';
import { changeHeight, changeSize, changeSort } from './util/update-block';
import { changelog } from 'sy-plugin-changelog';

export default class PictureLibraryPlugin extends Plugin {
  folders = [];

  storage = reactive(new Storage({ plugin: this }));

  setting = {
    size: 400,
    sizes: [100, 200, 400, 600, 800],
    mangaSize: '50%',
    mangaSizes: ['100%', '90%', '85%', '80%', '70%', '60%', '50%', '40%', '30%'],
    modes: ['grid', 'manga'],
    mode: 'grid',
    overwrite: false,
    sort: 'nameIncrease',
    sorts: ['nameIncrease', 'nameDescrease', 'dateIncrease', 'dateDecreases'],
    showImage: true,
    showVideo: true,
  }

  onload() {
    changelog(this);
    const plugin = this;
    setI18n(this.i18n);
    registerIcon(ICON, "200", icon);
    registerIcon(CAROUSEL, "200", carousel);
    this.loadConfig();

    // support custom block edit
    this.addPluginBlockMenu();

    try {
      require('@electron/remote').app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    } catch {
      console.warn("not allow in electron")
    }

    // support custom block
    this.eventBus.on("ws-main", updateRenderer);

    this.tabFn = this.addTab({
      type: TAB_TYPE,
      init() {
        this.element.classList.add("fn__flex");
        const tab = createApp(Tab);
        tab.use(ElementPlus);
        tab.provide('plugin', plugin);
        tab.provide('folder', this.data);
        tab.mount(this.element);
      }
    })

    this.addDock({
      config: {
        position: "RightTop",
        size: { width: 200, height: 0 },
        icon: ICON,
        title: this.i18n.title,
      },
      data: {
        plugin: this.name,
      },
      type: ICON,
      init() {
        const dock = createApp(Dock);
        dock.use(ElementPlus);
        dock.provide('plugin', plugin);
        dock.mount(this.element);
      }
    })
  }


  addPluginBlockMenu() {
    this.eventBus.on("click-blockicon", ({ detail }) => {
      const elements = detail.blockElements;
      if (elements.length !== 1) {
        return;
      }
      const el = elements[0].querySelector('protyle-html');
      if (!el) {
        return;
      }
      const id = elements[0].getAttribute('data-node-id');
      const index = el
        .getAttribute("data-content")
        .indexOf('data-plugin="siyuan-plugin-picture-library"');
      if (index < 0) {
        return;
      }
      const content = el.getAttribute("data-content");
      const path = /data-path="(.*)"/.exec(content);
      if (!path || !path[1]) {
        return;
      }
      const height = /data-height="(\w+)"/.exec(content);
      detail.menu.addItem({
        icon: ICON,
        label: this.i18n.changeHeight,
        click: () => changeHeight(id, height && height[1] || '400px'),
      })
      const size = /data-size="(\w+)"/.exec(content);
      detail.menu.addItem({
        icon: ICON,
        label: this.i18n.changeSize,
        click: () => changeSize(id, size && size[1] || 'contain'),
      })
      const sort = /data-sort="(\w+)"/.exec(content);
      detail.menu.addItem({
        icon: ICON,
        label: this.i18n.changeSort,
        click: () => changeSort(id, sort && sort[1] || 'random'),
      })
    });
  }

  async loadConfig() {
    const d = await this.loadData('files.json');
    const s = await this.loadData('setting.json');
    if (!d) {
      this.saveData('files.json', []);
    } else {
      this.folders = d;
    }
    if (!s) {
      this.saveData('setting.json', this.setting);
    } else {
      Object.assign(this.setting, s);
    }
    this.storage.init(this.folders);
  }

  async saveFiles() {
    this.saveData('files.json', this.storage.getNodes());
  }

  async saveSetting(setting) {
    this.setting = Object.assign({}, setting);
    this.saveData('setting.json', this.setting);
  }
}
