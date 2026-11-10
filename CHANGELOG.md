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
