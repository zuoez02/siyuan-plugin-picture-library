# Picture Library 图库

思源图库插件，用于图片管理和浏览。

欢迎提供建议到 Github 仓库。

## 使用方法

1. 插件安装完成后建议刷新，右上角Dock中的图库，点击展开图库文档树。
2. 鼠标悬浮到dock的右上角，点击添加按钮，即可创建文件夹。
3. 点击文件夹，左侧会打开tab页面，将文件拖入即可。

### 预览模式
1. 支持“方格”和“漫画”两种模式
2. 支持调整图片大小
3. 支持按文件名递增或递减排序，由于api原因暂不支持按时间排序

小贴士：
1. 存储目录目前固定位置为/data/public/siyuan-plugin-picture-library/，你可以直接将你的图片文件夹放入到这个目录下，点击dock中的刷新按钮即可更新
2. 点击复制按钮，即可复制出当前文件夹的链接，可以直接粘贴到文档中，点击展开tab
3. 支持右键点击图片，复制图片的URL和块，可以粘贴到文档中使用

## Changelog

+ v0.1.2
  - 支持右键点击图片，复制图片的URL和块，可以粘贴到文档中使用。（例如URL作为题头图链接等）

+ v0.1.1
  - 修复文件扩展名大小写导致的问题
  - 增加支持格式'.png', '.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp', '.webp', '.apng', '.avif', '.gif', '.svg', '.tif', '.tiff'

+ v0.1.0
  - First commit