**项目概览**
- 插件名称：`siyuan-plugin-picture-library`，为思源笔记提供图片/视频的管理、浏览与轮播展示能力。
- 运行环境：思源桌面端与浏览器桌面端（参见 `plugin.json:7-10`）。最低支持版本 `3.0.17`（`plugin.json:6`）。
- 技术栈：Vue 3、Element Plus、Vite 打包，集成思源插件 API。

**目录结构**
- 根目录关键文件：
  - `plugin.json` 插件元信息与兼容范围。
  - `index.js` 构建产物（CommonJS），供思源加载；`index.css` 为聚合样式。
  - `package.json` 构建脚本与依赖定义（`package.json:37-41`）。
- 源码目录 `src/`：
  - `src/index.js` 插件入口与生命周期、UI 挂载、事件集成。
  - `src/components/` 交互与视图组件（`dock.vue`、`tab.vue`、`carousel.vue`、`filetree.vue`、`view.vue`）。
  - `src/storage/` 存储抽象与文件 API（与思源后端交互）。
  - `src/util/` 通用工具（国际化、渲染器、请求、对话框、常量、MD5 等）。
  - `src/assets/` 插件图标定义。
- 国际化目录 `i18n/`：多语言 JSON 与增量更新日志。

**运行与构建**
- 构建：`npm run build`（`vite build`，输出到根目录 `index.js`/`index.css`，参见 `vite.config.js:21-51`）。
- 开发：`npm run dev`（`vite build --watch`，持续编译，`package.json:39-41`）。
- 打包格式：CommonJS，入口 `src/index.js`，外部依赖排除 `siyuan`（`vite.config.js:22-47`）。

**核心架构**
- 插件入口：`PictureLibraryPlugin` 继承自思源 `Plugin`（`src/index.js:18`）。
  - 生命周期 `onload()`：
    - 注册更新日志、国际化、图标（`src/index.js:39-53`）。
    - 自定义块支持：
      - 编辑菜单注入（`addPluginBlockMenu`，`src/index.js:95-136`）。
      - 渲染监听 `ws-main` 事件并更新自定义块内容（`util/renderer.js:29-76`）。
    - UI：注册 Tab 与 Dock（`src/index.js:58-92`）。
  - 配置持久化：
    - 加载与合并 `files.json`、`setting.json`（`src/index.js:138-152`）。
    - 保存文件结构与设置（`src/index.js:154-161`）。
- 视图组件：
  - `dock.vue`：左侧目录树与操作入口（刷新、新建根目录）（`src/components/dock.vue:24-35`）。
  - `filetree.vue`：文件夹树渲染、节点操作（复制自定义块标记、复制链接、新建/删除、打开 Tab）（`src/components/filetree.vue:67-77`，`src/components/filetree.vue:79-136`）。
  - `tab.vue`：主浏览页，支持模式选择（网格、漫画、比例）、排序、上传/粘贴/拖拽导入、视频预览、无限滚动（`src/components/tab.vue:1-133`，`src/components/tab.vue:192-200`，`src/components/tab.vue:297-312`，`src/components/tab.vue:533-563`）。
  - `carousel.vue`：自定义块轮播组件，按路径读取图片并支持多种排序（`src/components/carousel.vue:38-73`）。
  - `view.vue`：带图片缓存的懒加载视图（`src/components/view.vue:21-35`）。

**存储与数据**
- 存储层 `Storage`：管理根目录与子目录、文件的增删改，以及本地设置。
  - 基础路径：`/data/public/siyuan-plugin-picture-library`（`src/storage/index.js:17`）。
  - 根目录增删（`src/storage/index.js:47-62`），子目录增删（`src/storage/index.js:64-94`）。
  - 刷新：从后端目录树拉取并重建内存树（`src/storage/index.js:100-124`）。
  - 文件导入：批量过滤扩展名并写入（`src/storage/index.js:126-131`）。
  - 直传 Blob：`addFileBlob`（`src/storage/index.js:133-135`）。
  - 删除文件：`deleteFile`（`src/storage/index.js:137-139`）。
  - 图片缓存：基于路径 MD5 存取，命中返回 Base64，未命中生成缩略图并缓存于 `/data/storage/petal/.../.cache/`（`src/storage/index.js:141-163`）。
- 文件 API：与思源后端交互的 HTTP 封装（`src/storage/file.js`）。
  - 读取文件：`getFile`（`src/storage/file.js:3-13`）。
  - 新建文件/文件夹：`addFile`、`addFolder`（`src/storage/file.js:15-33`）。
  - 删除/重命名：`removeFile`、`removeFolder`、`renameFile`（`src/storage/file.js:35-54`，`src/storage/file.js:42-47`，`src/storage/file.js:49-54`）。
  - 列目录：`getFiles` 并返回规范化节点（含 `isPicture`/`isVideo` 标记与 `url`）（`src/storage/file.js:56-78`）。

**自定义块渲染**
- 渲染入口：扫描 `protyle-html` 并对含 `data-plugin="siyuan-plugin-picture-library"` 的块进行挂载（`util/renderer.js:29-41`）。
- 解析参数：`data-path`、`data-height`、`data-size`、`data-sort`（`util/renderer.js:41-57`）。
- 视图挂载：在块容器中创建并挂载 `carousel.vue`，注入依赖与样式（`util/renderer.js:64-74`）。
- 菜单操作：块图标右键菜单支持高度、大小、排序修改，直接更新 Markdown（`src/index.js:95-136`，`src/util/update-block.js:5-33`，`src/util/update-block.js:35-73`，`src/util/update-block.js:75-116`）。

**组件与交互要点**
- 图片墙（网格/漫画/比例）：
  - 排序规则：名称升降序、时间升降序（`src/components/tab.vue:243-269`）。
  - 比例模式尺寸计算：由 `ratio` 与 `ratioSize` 共同决定（`src/components/tab.vue:287-295`）。
  - 无限滚动：`page * pageSize` 控制渲染范围（`src/components/tab.vue:170-171`，`src/components/tab.vue:192-200`）。
- 视频预览：悬停播放、标注时长、点击打开媒体 Tab（兼容 `siyuan-media-player`）（`src/components/tab.vue:197-241`，`src/components/tab.vue:355-383`，`src/components/tab.vue:385-448`）。
- 导入能力：剪贴板读取、拖拽文件/URI、手动上传，均支持重名覆盖策略（`src/components/tab.vue:301-346`，`src/components/tab.vue:533-563`，`src/components/tab.vue:452-464`）。
- 右键菜单：复制路径、复制图片块、复制为 PNG、删除（`src/components/tab.vue:592-636`）。

**国际化**
- 使用思源的 `this.i18n` 注入并合并到本地 `i18n` 状态（`src/index.js:41`，`src/util/i18n.js:1-5`）。
- 组件内通过 `_('key')` 读取（如 `dock.vue:6`、`tab.vue:4-75`）。
- 文案来源：`i18n/en_US.json`、`i18n/zh_CN.json`。

**依赖与技术栈**
- 前端框架：`vue@^3`（组合式 API）。
- UI 组件库：`element-plus`（自动按需导入，`vite.config.js:11-17`）。
- 构建工具：`vite@^4`，插件 `@vitejs/plugin-vue`。
- 其他：`lodash`（如 `shuffle`）、`lrz`（图片压缩与 Base64）、`v3-infinite-loading`（无限滚动）、`sy-plugin-changelog`（变更日志）。

**开发约定**
- 路径规范：
  - 资源根路径统一置于 `/data/public/siyuan-plugin-picture-library` 下（`src/storage/index.js:17`）。
  - 自定义块缓存存放于 `/data/storage/petal/siyuan-plugin-picture-library/.cache/`（`src/storage/index.js:145-158`）。
- 设置项：集中定义于 `PictureLibraryPlugin.setting`（`src/index.js:23-36`），组件内以注入方式共享与持久化（`src/components/tab.vue:176-186`）。
- 事件集成：
  - 思源事件总线 `eventBus`：监听 `ws-main` 驱动自定义块刷新（`src/index.js:56-57`）。
  - 块图标点击：注入菜单项（`src/index.js:95-136`）。
- 安全与兼容：
  - Electron 环境操作需 `try/catch`（如自动播放策略、剪贴板读取，`src/index.js:49-53`，`src/components/tab.vue:313-347`）。
  - 浏览器剪贴板 API 与 Electron 双路径兜底（`src/components/tab.vue:301-347`）。

**常见扩展点**
- 新增浏览模式：
  - 在 `setting.modes` 中追加模式名（`src/components/tab.vue:179`）。
  - 为该模式编写渲染分支与样式（参考 `grid`/`manga`/`ratio`）。
- 新增排序方式：
  - 在设置 `sorts` 中追加枚举（`src/index.js:31-36`）。
  - 在 `sortedImageFiles`/`sortedVideoFiles` 中实现比较逻辑（`src/components/tab.vue:243-269`，`src/components/tab.vue:257-269`）。
- 文件操作增强：
  - 在 `src/storage/file.js` 中新增 API 包装方法，并于 `Storage` 中调用。
- 自定义块参数：
  - 通过 `data-*` 属性扩展（在 `util/renderer.js` 中解析并传给组件）。

**发布与兼容性**
- 版本号与描述在 `plugin.json` 与 `package.json` 中保持一致（`plugin.json:5`，`package.json:3`）。
- 变更日志：参考 `CHANGELOG.md` 与 `i18n/CHANGELOG-zh_CN-*.md`。
- 打包后产物位于仓库根目录，确保被思源插件加载识别（`vite.config.js:31-46`）。

