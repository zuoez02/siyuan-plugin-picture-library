## 未发布

### 新增

- 新增**瀑布流布局**（第 4 种模式）：CSS 多列按每张图的原始宽高比自然排布；列数 = 容器宽度 ÷「尺寸」设置，手机 2–6 列、桌面 1–8 列，面板宽度变化用 ResizeObserver 跟随；视频以 16:9 卡片混排；老配置会自动补上该模式
- 移动端大图预览支持**长按菜单**：保存到相册 / 下载、复制图片链接、复制 Markdown、在新标签打开、删除这张（删完自动刷新图库）；下载优先走系统分享面板，退化为 `a[download]`，再退化为新标签打开
- 下载改为同源**直链 + `download` 属性**（不再用 `blob:`，WebView 的下载监听不认 blob，宿主会提示「暂不支持」）；顺序为 系统分享 → 直链 → Blob → 新标签
- 长按菜单新增**「复制图片」**：优先壳子原生接口 `SpplShell.copyImageBase64`（传原图字节），其次标准 `ClipboardItem`（超大图缩到最长边 2560），都不行则自动退回复制链接
- 浏览器/移动端不再依赖 Electron：
  - 「在文件资源管理器中打开」在非桌面端换成「复制文件夹路径」
  - 「自动粘贴（剪贴板监视）」只在 Electron 桌面端显示，浏览器端改为在页面里直接 Ctrl+V / 长按粘贴即可上传
  - 所有复制操作增加 `execCommand` 兜底，修掉 http（非安全上下文）下 `navigator.clipboard` 不存在导致的静默失败
  - 复制图片在缺少 `ClipboardItem` 时给出明确提示，不再抛错
- 上传入口改为 label 包裹输入框（不依赖 id），点击即给出状态反馈；document 捕获层兜底监听任意 file input 的 change；新增 `window.spplReceiveUpload(名, MIME, base64)` 供自建 WebView 壳子在原生侧回传文件
- 移动端上传改为 XHR、结果用 toast 直接弹出并带落盘路径；一次选择只发一次请求（change 之前被绑了两遍）；HEIC 直接拦掉并提示改格式
- 上传前先把文件读进内存再发送，并在失败时报告「声明大小 vs 实际读到字节」（自建 WebView 套壳常回传不可读的 content:// 文件，导致请求根本没发出去）
- 移动端顶部工具栏的下拉框改为**底部选择面板**：原生 `<select>` 在手机 WebView / iOS 上点它既不弹系统选择器也不派发 click，现在换成按钮 + 每项 52px 的面板，当前项高亮；桌面端仍用原生下拉框
- 移动端图库浮层支持**右滑关闭**（不做跟手动画）：横向位移 ≥80px 且以向右为主才触发；左滑、纵向滚动、短滑、斜滑都不会误触，大图预览 / 播放器打开时把手势让给它们
- 右滑关闭时不再把 touch 事件冒泡给思源的全局手势（否则会连带触发思源自己的侧滑动作）；纵向滑动与点按不受影响

## v0.10.1（2026-11-11）

### 修复

- 手机端上传视频没反应：
  - 文件选择框原来是 `display:none`，iOS Safari 会忽略它（系统选择器弹出了但选完没有回调）；改为「占位 1px + opacity:0」的隐藏方式
  - 视频后缀白名单补上 `.mov`（iPhone 默认）、`.m4v`、`.3gp`、`.mkv`、`.avi` 等；同时按 MIME 兜底，iOS 相册导出的无后缀/非常规命名文件也能识别
  - 选中不支持的文件不再静默失败：给出提示，并列出支持的类型
  - 上传异常会弹错误信息，不再毫无反馈
- 输入框加 `accept="image/*,video/*"`，手机选择器直接进入图片/视频
- 选择后清空 input.value，重复选择同一文件也能再次触发

## v0.10.0（2026-11-11）

### 新增

- 移动端支持（手机 App / 手机浏览器）：图库以全屏浮层展示，两列网格 + 滚动加载
- 移动端顶栏：返回 / 设置 / 关闭，设置项收进齿轮面板，默认收起
- 移动端自建大图预览：左右滑动切换、上滑关闭、双指缩放 1x–4x、双击 1x/2.5x、放大后单指拖动
- 移动端原生全屏视频播放器：上滑退出、左右拖动调进度（HUD 显示 ±秒数与目标时间）
- 移动端侧边栏适配触屏：行高 48px、字号 15px，每行操作收进「⋯」底部面板
- 新协议链接 `siyuan://plugins/<插件名>?type=folderDetail&...`：桌面打开页签，移动端打开全屏图库

### 变更

- `plugin.json` 的 `frontends` 增加 `mobile` / `browser-mobile`
- 「复制链接」改为生成新协议格式，`title` / `data` 做 URL 编码

### 修复

- 手机端看不到图库：插件未被下发到移动端；移动端没有自定义页签导致点文件夹无响应
- 视频缩略图在 iOS Safari 显示白块（用 media fragment `#t=0.1` 取首帧）
- 移动端设置条被弹性布局压成 13px，视觉上等于消失
- 移动端点视频打不开播放器（思播在手机上开在不可见面板、移动端也没有页签可用）
- 移动端点图片会触发预览视频在后台播放

### 注意

- 旧格式链接 `siyuan://plugins/<插件名><页签类型>?…` 在桌面端仍可使用；**移动端无法打开**（思源不会把这类 URL 交给插件），需要在插件里重新复制链接

## v0.3.2

- Add change sort in display panel

## v0.3.1

- Fix bugs.

## v0.3.0

- React full refactor
- Support library persistent.

## v0.2.6

- Support Chinese handwritting font

## v0.2.5

- Render excalidraw directly, instead of iframe.

## v0.2.2

- Support link copy to document.
- Change edit draw name to button.

## v0.2.1

Fix: open link cause error on Windows.
