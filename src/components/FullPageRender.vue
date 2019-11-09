<template>
    <div class="pdf-wrap" :class="`pdf-wrap-${timestamp}`">
        <p style="width: 100%;text-align: center;height: 500%" v-if="needLoadingText && fileLoading">{{loadingText}}</p>
        <p v-if="error">{{error}}</p>
    </div>
</template>
<script>
import pdfJsLib from 'pdfjs-dist/build/pdf'
var pdfWorker = require('pdfjs-dist/build/pdf.worker.entry.js')

import { buildSVG, pageLoaded, roundToDivide, getOutputScale, approximateFraction } from '../assets/pdf_utils.js'


pdfJsLib.workerSrc = pdfWorker

export default {
    props: {
        url: {
            required: true,
            type: String,
            default: ''
        },
        loadingText: {
            type: String,
            default: 'File loading...'
        },
        needLoadingText: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loadingTask: null,
            canvas: null,
            error: null,
            fileLoading: true,
            timestamp: new Date().getTime(),
            totalPage: 0
        }
    },
    mounted() {
        this.init(this.timestamp);
    },
    methods: {
        /**
         * init
         */
        init (timestamp) {
            const t = this;
            this.loadingTask = pdfJsLib.getDocument({
              url: this.url,
              cMapUrl: '../../node_modules/pdfjs-dist/cmaps/',
              cMapPacked: true
            });
            this.loadingTask.promise.then(async function(pdf) {
                console.time('PDF_Render')
                console.log('PDF loaded');
                t.totalPage = pdf.numPages;

                var container = document.querySelector(`.pdf-wrap`);
                // for(var i = 0, len = pdf.numPages; i < len; i++) {
                //     await t.renderPage(pdf, i + 1, container)
                // }
                console.log(pdf.numPages);
                var pages = await Promise.all(
                    Array.apply(null, Array(pdf.numPages)).map((item, index) => {
                        console.log(item, index)
                        return t.renderPage(pdf, index + 1, container);
                    })
                )
                var curContainer = document.querySelector(`.pdf-wrap-${timestamp}`)
                if (curContainer) {
                    pages.map(item => curContainer.appendChild(item));
                    t.$emit('loaded');
                } else {
                    console.log('timestamp has changed.')
                }
                console.timeEnd('PDF_Render')
            }).catch(function (reason) {
                t.$emit('loaded');
                console.error('Error: ', reason);
                t.fileLoading = false;
                t.error = "PDF load failed :(";
            });
        },
        /**
         * render a page of pdf
         * @param {file} pdf
         * @param {number} page
         */
        renderPage(pdf, pageNum, container) {
            const t = this;
            return new Promise(function (resolve, reject) {
                pdf.getPage(pageNum).then(function(page) {
                    var pageDom = document.createElement('div');
                    pageDom.style.display = 'block';
                    pageDom.style.width = '100%';
                    pageDom.className = `page-container page-${pageNum}`
                    var pageNumDom = document.createElement('p');
                    pageNumDom.className = 'page-num';
                    pageNumDom.innerHTML = `-${pageNum}/${pdf.numPages}-`
                    pageDom.appendChild(pageNumDom)

                    var canvasWrapper = document.createElement('div');
                    canvasWrapper.classList.add('canvasWrapper');
                    canvasWrapper.style.display = 'block';
                    canvasWrapper.style.width = '100%';
                    pageDom.appendChild(canvasWrapper)

                    let canvas = document.createElement('canvas');
                    canvas.className = 'page-body';
                    // canvas.style.display = 'block';
                    // canvas.style.width = '100%';
                    // canvas.style.height = 'auto';

                    var context = canvas.getContext('2d', {alpha: false});
                    console.log(container.offsetWidth, page.getViewport(1).width, window.devicePixelRatio);
                    var scale = container.offsetWidth / page.getViewport(1).width * (window.devicePixelRatio || 1);
                    // var scale = canvasWrapper.offsetWidth / page.getViewport(1).width;

                    console.log('scale: ', scale)
                    var viewport = page.getViewport(scale);

                    console.log(canvasWrapper.clientWidth + 'px')

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.style.width = container.clientWidth + 'px';
                    canvas.style.height = (container.clientWidth) * (viewport.height / viewport.width) + 'px';


                    canvasWrapper.appendChild(canvas);

                    let textContentStream = page.streamTextContent({
                        normalizeWhitespace: true,
                    });

                    page.getTextContent().then(function (textContent) {
                        const textLayerDiv = document.createElement('div');
                        textLayerDiv.className = 'textLayer';
                        textLayerDiv.style.transform = `scale(${viewport.width / (viewport.width * (window.devicePixelRatio || 1))})`;

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
                            timeout: 100,
                            enhanceTextSelection: false,
                        });
                        textLayerRenderTask.promise.then(() => {
                            textLayerDiv.appendChild(textLayerFrag);
                            if (pageDom.querySelector('.annotationLayer')) {
                                pageDom.insertBefore(textLayerDiv, pageDom.querySelector('.annotationLayer'))
                            } else {
                                pageDom.appendChild(textLayerDiv);
                            }
                        }, function (reason) {
                            // Cancelled or failed to render text layer; skipping errors.
                            console.log('error: ', reason)
                        });

                    }).catch(function (reason) {
                        console.error('Error: ' + reason);
                    });

                    // annotation layer start
                    page.getAnnotations({ indent: 'disaplay', }).then((annotations) => {
                        if(annotations.length === 0) {
                            return;
                        }
                        var annotationDiv = document.createElement('div');
                        annotationDiv.className = 'annotationLayer';
                        // annotationDiv.style.transform = `scale(${viewport.width / (viewport.width * (window.devicePixelRatio || 1))})`;
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
                    }).catch(function (reason) {
                        console.error('Error: ' + reason);
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
                        console.log('page rendered');
                        t.fileLoading = false;
                        console.log('pageDom: ', pageDom);
                        resolve(pageDom);
                    })
                }, function(error) {
                    t.fileLoading = false;
                    console.log('error', error);
                    reject(error)
                })
            })
        },
        pageChange(pageNum) {
          console.log(pageNum)
        }
    },
    watch: {
      url: function (val, oldVal) {
          let pa = document.querySelector('.pdf-wrap'),
              pageList = document.querySelectorAll('.page-container');
          Array.prototype.forEach.call(pageList, item => {
              pa.removeChild(item);
          })
          this.timestamp = new Date().getTime()
          this.loadingTask = null;
          this.canvas = null;
          this.error = null;
          this.fileLoading = true;
          this.init(this.timestamp);
      }
    }
}
</script>
<style>
@import '../assets/annotation_layer_builder.css';
.pdf-wrap {
    display: block;
    /* border: 1px solid #999; */
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
    text-align: center;
}

.textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transform-origin: top left;
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
