
解剖 Mozilla 官方的 pdf demo：

DOM 结构：
```HTML
<div id="viewer">
    <div class="page">
        <div class="canvasWrapper">..</div>
        <div class="textLayer">..</div>
        <div class="annotatinLayer">..</div>
    </div>
    ..
</div>
```
* `.canvasWrapper` 内插入 canvas 图层，完美展示 PDF；
* `.textLayer` 文本图层，文字颜色 `transparent`，提供文档选中内容的能力；
* `.annotatinLayer` 注解层，特殊标记、超链接、图片交互操作；

三个图层结合覆盖



### 感谢
> 感谢 Mozilla 各位大佬带来的 pdf.js