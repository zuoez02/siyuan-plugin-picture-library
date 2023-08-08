import { Plugin } from "siyuan";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Dock from './components/dock.vue';
import Tab from './components/tab.vue';
import {createApp} from 'vue';
import { Storage } from "./storage";
import { reactive } from 'vue';
import { _, setI18n } from './util/i18n';
import { icon } from './assets/icon';
import { registerIcon } from './util/registerIcon';
import './style.css';
import { TAB_TYPE, ICON } from "./util/constants";

export default class PictureLibraryPlugin extends Plugin {
  folders = [];

  storage = reactive(new Storage({ plugin: this }));

  setting = {
    size: 400,
    sizes: [100, 200, 400, 600, 800],
    mangaSize: '50%',
    mangaSizes: ['100%','90%','85%','80%','70%','60%','50%','40%','30%'],
    modes: ['grid', 'manga'],
    mode: 'grid',
    sort: 'nameIncrease',
    sorts: ['nameIncrease', 'nameDescrease']
  }

  onload() {
    const plugin = this;
    setI18n(this.i18n);
    registerIcon(ICON, "200", icon);
    this.loadConfig();

    this.tabFn = this.addTab({
      type: TAB_TYPE,
      init() {
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
        size: {width: 200, height: 0},
        icon: ICON,
        title: this.i18n.title,
      },
      data: {},
      type: ICON,
      init() {
        const dock = createApp(Dock);
        dock.use(ElementPlus);
        dock.provide('plugin', plugin);
        dock.mount(this.element);
      }
    })
  }

  async loadConfig() {
    const d  = await this.loadData('files.json');
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
