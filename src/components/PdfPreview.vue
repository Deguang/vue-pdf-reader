<template>
    <div class="pdf-wrap">
    </div>
</template>
<script>
import pdfJsLib from 'pdfjs-dist/build/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js'
import { buildSVG, pageLoaded, roundToDivide, getOutputScale, approximateFraction } from '../assets/pdf_utils.js'

export default {
    data() {
        return {
            pdfUrl: 'https://blog.mozilla.org/security/files/2015/05/HTTPS-FAQ.pdf',
            loadingTask: null,
            canvas: null,
            devicePixelRatio: 1,
        }
    },
    mounted() {
        const t = this;
        // 屏幕的设备像素比
        t.devicePixelRatio = window.devicePixelRatio || 1;

        this.loadingTask = pdfJsLib.getDocument(this.pdfUrl);
        this.loadingTask.promise.then(async function(pdf) {
            console.log('PDF loaded');
            var pageNumber = 1;
            var container = document.querySelector('.pdf-wrap');
            for(var i = 0, len = pdf.numPages; i < len; i++) {
                await t.renderPage(pdf, i + 1, container)
            }
        })
    },
    methods: {
        /**
         * render a page of pdf
         * @param {file} pdf
         * @param {number} page
         */
        renderPage(pdf, pageNum, container) {
            return new Promise(function (resolve, reject) {
                pdf.getPage(pageNum).then(function(page) {
                    var pageDom = document.createElement('div');
                    pageDom.className = `page-container page-${pageNum}`
                    var pageNumDom = document.createElement('p');
                    pageNumDom.className = 'page-num';
                    pageNumDom.innerHTML = `<p class="page-num">-${pageNum}/${pdf.numPages}-</p>`
                    pageDom.appendChild(pageNumDom)

                    var scale = 1.5;
                    var viewport = page.getViewport(scale);

                    var canvasWrapper = document.createElement('div');
                    canvasWrapper.classList.add('canvasWrapper');
                    pageDom.appendChild(canvasWrapper)

                    let canvas = document.createElement('canvas');
                    canvas.className = 'page-body';

                    var context = canvas.getContext('2d', {alpha: false});

                    // 浏览器在渲染canvas之前存储画布信息的像素比
                    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                            context.mozBackingStorePixelRatio ||
                                            context.msBackingStorePixelRatio ||
                                            context.oBackingStorePixelRatio ||
                                            context.backingStorePixelRatio || 1;
    console.log('backingStoreRatio: ',backingStoreRatio)
                    // canvas的实际渲染倍率
                    var ratio = devicePixelRatio / backingStoreRatio;
    console.log('ratio:', ratio)
    console.log('viewport:', viewport)
                    canvas.height = viewport.height * ratio;
                    canvas.width = viewport.width * ratio;
                    canvas.style.width = container.clientWidth + 'px';
                    canvas.style.height = 'auto';

                    canvasWrapper.appendChild(canvas);

                    let textContentStream = page.streamTextContent({
                        normalizeWhitespace: true,
                    });

                    page.getTextContent().then(function (textContent) {
                        const textLayerDiv = document.createElement('div');
                        textLayerDiv.className = 'textLayer'

                        // building SVG and adding that to the DOM
                        // var svg = buildSVG(viewport, textContent);
                        // textWrap.appendChild(svg);

                        let textLayerFrag = document.createDocumentFragment();

                        var textDivs = [],
                            textContentItemsStr = [];
                        var textLayerRenderTask = pdfJsLib.renderTextLayer({
                            textContent: textContent,
                            textContentStream: textContentStream,
                            container: textLayerFrag,
                            viewport: viewport,
                            textDivs: textDivs,
                            textContentItemsStr: textContentItemsStr,
                            timeout: 300,
                            enhanceTextSelection: false,
                        });
                        textLayerRenderTask.promise.then(() => {
                            textLayerDiv.appendChild(textLayerFrag);
                            pageDom.appendChild(textLayerDiv);
                        }, function (reason) {
                            // Cancelled or failed to render text layer; skipping errors.
                            console.log('error: ', reason)
                        });

                    });

                    // annotation layer start
                    page.getAnnotations({ indent: 'disaplay', }).then((annotations) => {
                        if(annotations.length === 0) {
                            return;
                        }
                        var annotationDiv = document.createElement('div');
                        annotationDiv.className = 'annotationLayer';
                        pageDom.appendChild(annotationDiv);
                        let annotationParam = {
                            viewport: viewport.clone({ dontFlip: true}),
                            div: annotationDiv,
                            annotations,
                            page,
                            imageResourcesPath: './images/',
                            renderInteractiveForms: true,
                            linkService: {
                                externalLinkTarget: null,
                                externalLinkRel: null
                            },
                            // downloadManager:
                        }
                        pdfJsLib.AnnotationLayer.render(annotationParam)
                    });
                    // annotation layer end



                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    console.log("renderContent: ",renderContext)
                    console.log('page: ', page);
                    var renderTask = page.render(renderContext);
                    renderTask.then(function() {
                        container.appendChild(pageDom);
                        console.log('page rendered');
                        resolve();
                    })
                }, function(error) {
                    console.log('error', error);
                    reject(error)
                })
            })
        }
    }
}
</script>
<style>
@import '../assets/annotation_layer_builder.css';
.pdf-wrap {
    min-width: 600px;
    width: 100%;
    border: 1px solid #999;
    height: auto;
    min-height: 300px;
    position: relative;
}
.page-container {
    position: relative;
}
.page-num {
    position: absolute;
    bottom: 0;
    width: 100%;
}

.textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
}
.textLayer > div {
    position: absolute;
    white-space: pre;
    -webkit-transform-origin: 0% 0%;
    -moz-transform-origin: 0% 0%;
    -o-transform-origin: 0% 0%;
    -ms-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    /* border: solid 1px rgba(255, 0, 0, 0.5); */
    /* background-color: rgba(255, 255, 32, 0.1); */
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    color: transparent;
}

</style>
