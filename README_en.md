# Gallery

Siyuan Gallery plugin for image management and browsing.

Suggestions are welcome to the Github repository.

## Instructions

1. After the plug-in is installed, it is recommended to refresh. In the gallery in the Dock in the upper right corner, click to expand the gallery document tree.
2. Hover the mouse to the upper right corner of the dock and click the Add button to create a folder.
3. Click the folder, and the tab page will open on the left, just drag the file in.
4. Support dragging directly from the browser into the tab, and the pictures will be downloaded automatically. **⚠️The picture will be re-downloaded instead of the cached content of the browser**
5. Support to get the picture in the clipboard in the tab and save it automatically (PNG or JPEG)

### Preview Mode
1. Support two modes of "grid" and "caricature"
2. Support resizing pictures
3. Support ascending or descending sorting by file name, support ascending or descending sorting by file update time
4. Support pasting pictures from the clipboard
5. Support opening the location of the current directory in the file browser (Finder)
6. Support upload images by click 'upload image' button

### Display panel
1. Click the first button of the folder in the Dock "Copy Display Panel"
2. Paste in the document to generate a display panel and scroll to display the content
3. Click the menu of the display panel block (HTML block): Plugins / Gallery: Modify the height of the display panel to modify the height of the display panel block.
4. Click the menu of the display panel block (HTML block): Plugins / Gallery: Modify the size of the display panel image to switch the display mode of the image: include (display the entire image), cover (automatically cover the entire block according to the width and height calculation)

Tips:
1. The current fixed location of the storage directory is /data/public/siyuan-plugin-picture-library/, you can directly put your picture folder into this directory, and click the refresh button in the dock to update
2. Click the copy button to copy the link of the current folder, which can be pasted directly into the document, click to expand the tab
3. Support right-click on the image, copy the URL and block of the image, and paste it into the document for use

## Changelog
+ v0.3.2
   - Support change sort in display panel.

+ v0.3.1
   - Support upload images by click 'upload image' button

+ v0.3.0
   - Support sorting by time
   - Support more functions in the tab page
   - Support image size configuration of the display panel

+ v0.2.3
   - Support to get the pictures in the clipboard in the tab and save them automatically (PNG or JPEG)

+ v0.2.2
   - Support dragging and dropping pictures directly from the browser to the folder to the tab, and automatically download and save them

+ v0.2.1
   - Change icons
   - The name of "marquee" is unified as "display panel"

+ v0.2.0
   - Support generating scrolling display panels from folders:

+ v0.1.2
   - Support right-click on the image, copy the URL and block of the image, and paste it into the document for use. (For example, URL as a header image link, etc.)

+ v0.1.1
   - Fix the problem caused by the case of the file extension
   - Add support for formats '.png', '.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp', '.webp', '.apng', '.avif', ' .gif', '.svg', '.tif', '.tiff'

+ v0.1.0
   - First commit