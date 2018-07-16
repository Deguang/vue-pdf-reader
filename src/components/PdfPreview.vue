<template>
    <div class="pdf-wrap">
        <!-- <div class="textLayer"></div> -->
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
            canvas: null
        }
    },
    mounted() {
        const t = this;
        this.loadingTask = pdfJsLib.getDocument(this.pdfUrl);
        this.loadingTask.promise.then(function(pdf) {
            console.log('PDF loaded');
            var pageNumber = 1;
            var container = document.querySelector('.pdf-wrap');

            Array.from({length: pdf.numPages}).map(function(item, index) {
                t.renderPage(pdf, ++index, container)
            })
        })
    },
    methods: {
        /**
         * render a page of pdf
         * @param {file} pdf
         * @param {number} page
         */
        renderPage(pdf, pageNum, container) {
            pdf.getPage(pageNum).then(function(page) {
                var pageDom = document.createElement('div');
                pageDom.className = `page-container page-${pageNum}`
                var pageNumDom = document.createElement('p');
                pageNumDom.className = 'page-num';
                pageNumDom.innerHTML = `<p class="page-num">-${pageNum}/${pdf.numPages}-</p>`
                pageDom.appendChild(pageNumDom)

                console.log('Page loaded');
                var scale = 1.5;
                var viewport = page.getViewport(scale);

                var canvasWrapper = document.createElement('div');
                // canvasWrapper.style.width =  container.style.width * 0.9;
                // canvasWrapper.style.height =  container.style.height;
                canvasWrapper.classList.add('canvasWrapper');
                pageDom.appendChild(canvasWrapper)

                let canvas = document.createElement('canvas');
                canvas.className = 'page-body';

                var context = canvas.getContext('2d', {alpha: false});
                canvas.height = viewport.height;
                // canvas.width = viewport.width;
                canvas.width = container.clientWidth * 0.9;
                canvasWrapper.appendChild(canvas);

                let textContentStream = page.streamTextContent({
                    normalizeWhitespace: true,
                });
                // var renderCapability = (0, pdfJsLib.createPromiseCapability)();
                page.getTextContent().then(function (textContent) {
                    const textLayerDiv = document.createElement('div');
                    textLayerDiv.className = 'textLayer'
                    console.log(viewport, textContent, buildSVG)
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
                })
            }, function(error) {
                console.log('error', error);
            })
        }
    }
}
</script>
<style>
@import '../assets/annotation_layer_builder.css';
* {
    box-sizing: border-box;
}
.pdf-wrap {
    min-width: 600px;
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
    width: 90%;
    margin: 0 auto;
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
