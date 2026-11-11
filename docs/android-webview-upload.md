# Android WebView 壳子上传适配说明

适用：自建 WebView 套壳应用，加载远程 SiYuan 服务（含「图库」插件）。

现象对照：

| 页面表现 | 说明 |
|---|---|
| 点「上传图片」后系统选择器弹出，选完**没有任何提示** | `change` 事件没到网页 —— 本文第一~三条 |
| 选完提示「读取到 0 字节（声明 X 字节）」 | URI 没授予读权限 —— 第二条 |
| 页面能看能滚，上传静默失败 | 壳子拦了 POST —— 第四条 |
| 上传到 100% 后失败 / 网络错误 | 正常上报，看 toast 里的 HTTP 码 |

---

## 一、`onShowFileChooser` 必须实现完整

最常见三个漏点：**忘了 `return true`**、**取消时没回调**、**没给读权限**。

```kotlin
private var filePathCallback: ValueCallback<Array<Uri>>? = null
private val REQ_PICK = 1001

webView.webChromeClient = object : WebChromeClient() {
    override fun onShowFileChooser(
        webView: WebView?,
        callback: ValueCallback<Array<Uri>>?,
        params: WebChromeClient.FileChooserParams?
    ): Boolean {
        // 上一次没回调的先清掉，否则 WebView 内部状态会残留
        filePathCallback?.onReceiveValue(null)
        filePathCallback = callback

        val accept = params?.acceptTypes.orEmpty().filter { it.isNotBlank() }
        val mimeTypes = accept.mapNotNull {
            when {
                it.startsWith(".") ->
                    MimeTypeMap.getSingleton()
                        .getMimeTypeFromExtension(it.removePrefix(".").lowercase())
                it.contains("/") -> it
                else -> null
            }
        }.distinct()

        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = if (mimeTypes.size == 1) mimeTypes.first() else "*/*"
            if (mimeTypes.size > 1) putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes.toTypedArray())
            addCategory(Intent.CATEGORY_OPENABLE)
            putExtra(
                Intent.EXTRA_ALLOW_MULTIPLE,
                params?.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE
            )
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivityForResult(Intent.createChooser(intent, "选择文件"), REQ_PICK)
        return true                       // ← 漏这个，WebView 不会等你的结果
    }
}

override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != REQ_PICK) {
        super.onActivityResult(requestCode, resultCode, data)
        return
    }
    val cb = filePathCallback ?: return
    filePathCallback = null

    if (resultCode != Activity.RESULT_OK || data == null) {
        cb.onReceiveValue(null)           // ← 取消也必须回调，否则下次选文件不响应
        return
    }

    val uris: Array<Uri> = when {
        data.clipData != null ->
            (0 until data.clipData!!.itemCount).map { data.clipData!!.getItemAt(it).uri }.toTypedArray()
        data.data != null -> arrayOf(data.data!!)
        else -> emptyArray()
    }
    cb.onReceiveValue(if (uris.isEmpty()) null else uris)
}
```

要求：

- `onReceiveValue` 必须在**主线程**调用，值必须是 `Array<Uri>`
- 单选返回 `arrayOf(uri)`，多选返回多个；**不要**只传第一个了事
- 多选时结果可能只在 `clipData` 里，`data.data` 为 null

## 二、URI 必须可读

- 用 `ACTION_GET_CONTENT` / `ACTION_OPEN_DOCUMENT` 时，系统会自动临时授权；但**自己拼 Intent 时别漏 `FLAG_GRANT_READ_URI_PERMISSION`**
- 如果用的是**自研选择器 Activity**，必须在返回前给调用方授权：

```kotlin
intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
// 或自研选择器把文件拷到 App 私有目录，再用 FileProvider 生成 content:// 返回
```

- 不要用 `ACTION_PICK`（MediaStore）当通用文件选择器，权限模型不同，WebView 常常读不到

## 三、WebSettings 需要的能力

```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    allowContentAccess = true        // content:// 必须
    allowFileAccess = true           // file:// 需要；不用可关
    databaseEnabled = true
    // 生产环境建议关掉：
    // allowUniversalAccessFromFileURLs = false
}
```

`android:usesCleartextTraffic` 若服务是 http，需要在 manifest 里放行（或 network_security_config）。

## 四、不要拦请求体 / 不要伪造响应

- **`shouldInterceptRequest` 拿不到 POST body**。如果用它给 `/api/` 加鉴权头，GET 会成功、上传会无声失败 —— 这是本文最隐蔽的一个坑
- 鉴权请走 Cookie：

```kotlin
CookieManager.getInstance().apply {
    setAcceptCookie(true)
    setAcceptThirdPartyCookies(webView, true)
    flush()
}
```

- 不要在 `shouldInterceptRequest` 里对 `/api/file/putFile` 返回本地缓存或自定义响应

## 五、验收步骤

1. 壳子里打开图库 → 进任意目录 → 点「上传图片」
2. 状态行出现「已打开文件选择器，等待选择…」→ 属于正常
3. 选中一张相册里的 JPG：
   - 状态行应变成「已选择 1 个，可上传 1 个，目录 /data/public/…」
   - 随后「上传中 1/1 xxx 45%」→ toast「已上传 1 个 → /data/public/…」
   - 图库立即出现该图
4. 再次打开选择器后**直接返回（取消）**，再点一次上传：必须还能正常弹出并选择
5. 多选 3 张：应逐个上传，toast 报总数
6. 选一个 `.HEIC`：应提示「HEIC 格式无法在图库预览…」（这是预期行为，不是 bug）

调试通道（Debug 包）：

```kotlin
if (BuildConfig.DEBUG) WebView.setWebContentsDebuggingEnabled(true)
```

桌面 Chrome 打开 `chrome://inspect` 连上后，在 Console 里执行：

```js
document.querySelector('.sppl-upload-status')?.textContent
```

能直接看到上传链路停在哪一步。

## 六、兜底通道（可选，不改标准流程也能用）

如果 `onShowFileChooser` 一时改不好，可以让原生侧自己读文件、以 base64 回传给网页：

```kotlin
fun uploadFromShell(uri: Uri, name: String, mime: String) {
    val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return
    val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
    webView.post {
        webView.evaluateJavascript(
            "window.spplReceiveUpload(${JSONObject.quote(name)}, " +
            "${JSONObject.quote(mime)}, '$b64')", null
        )
    }
}
```

- 走的是网页同一条上传链路（进度、落盘、刷新都有）
- 适合图片（单文件建议 ≤ 10MB）；**视频不要走这条路**，base64 会放大 1/3，容易 OOM
- 大文件需要分片接口时再找插件方加 `spplUploadBegin/Chunk/End`

---

# 七、下载（保存图片）适配

网页端点「保存到相册 / 下载」时，插件会创建一个 `<a download href="http://<host>/public/.../xxx.jpg">` 并触发点击，
**不会再使用 `blob:` 地址**（WebView 的下载监听基本不认 `blob:`，多数壳子会直接提示「暂不支持」）。

壳子需要实现 `DownloadListener`，把请求交给系统 `DownloadManager`：

```kotlin
webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
    if (!url.startsWith("http")) return@setDownloadListener   // blob:/data: 交给网页自己处理

    val fileName = URLUtil.guessFileName(url, contentDisposition, mimetype)
    val request = DownloadManager.Request(Uri.parse(url)).apply {
        setMimeType(mimetype)
        setTitle(fileName)
        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
        // 关键：图库文件走 Cookie 鉴权，不带上会 401 / 跳登录页
        addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url) ?: "")
    }
    (getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
}
```

要点：

- **必须带 Cookie**，否则 `/public/...` 的下载请求会被鉴权拦掉
- 不要拦 `blob:` / `data:`（这些是网页内部对象，`DownloadManager` 无法处理）
- 若想直接存到相册，`DownloadManager` 下载完后再用 `MediaScannerConnection.scanFile()` 扫一次，
  或在 Android 10+ 用 `MediaStore.Images` 写入
- 更省事的替代方案：壳子暴露一个 JS 桥 `SpplShell.saveImage(url, name)`，
  原生侧自己下载 + 存相册，网页在 `isWebView()` 分支里优先调用它

验证：在壳子里打开图库 → 长按图片 → 「保存到相册 / 下载」→ 通知栏出现下载完成 →
文件出现在 `Downloads/`。失败时可看 logcat：

```
adb logcat | grep -iE "DownloadManager|DownloadListener"
```

---

# 八、复制图片到剪贴板

菜单里的「复制图片」按这个顺序尝试：

1. **壳子原生通道**：检测 `window.SpplShell.copyImageBase64(b64)`，存在就调用
2. **标准 ClipboardItem**：`navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`
   （只在这些条件同时满足时可用：**https 或 localhost** + Chrome 76+ / Safari 13.4+）
3. 都不行：自动退化为「复制图片链接」，并提示原因

所以 http://192.168.x.x 这种 WebView 场景想让「复制图片」真正可用，壳子加一个 JS 接口即可：

```kotlin
class ShellBridge(private val ctx: Context) {
    @JavascriptInterface
    fun copyImageBase64(base64: String) {
        val bytes = Base64.decode(base64, Base64.DEFAULT)
        // 写到缓存目录，再用 FileProvider 生成 content://（Android 剪贴板不支持直接塞字节）
        val file = File(ctx.cacheDir, "clip-${System.currentTimeMillis()}.png")
        file.writeBytes(bytes)
        val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.fileprovider", file)
        val clip = ClipData.newUri(ctx.contentResolver, "image", uri)
        val manager = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        manager.setPrimaryClip(clip)
    }
}

webView.addJavascriptInterface(ShellBridge(this), "SpplShell")
```

注意：`addJavascriptInterface` 在 API 17+ 需要 `@JavascriptInterface` 注解，且只在主线程调用 UI 相关 API
（`setPrimaryClip` 必须在主线程）。

验证：壳子里长按图片 → 「复制图片」→ 打开微信/相册的粘贴，能看到图片。

> 注：走壳子接口时传的是**原图字节**（JPEG 就传 JPEG），不再转 PNG。
> 实测一张 3964×3109 的 JPEG：原图 3.4MB / base64 4.8MB；若先转 PNG 会变成 26MB 的字符串，WebView 很容易卡死。
> 走标准 `ClipboardItem` 时才转 PNG，并先等比缩到最长边 2560（实测输出 2560×2008 / 8.2MB）。
