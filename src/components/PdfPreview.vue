<template>
    <div class="pdf-wrap">
        <div class="textLayer"></div>
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
            // pdf.getPage(pageNumber).then(function(page) {
            //     console.log('Page loaded');
            //     var scale = 1.5;
            //     var viewport = page.getViewport(scale);

            //     var canvasWrapper = document.createElement('div');
            //     canvasWrapper.style.width =  container.style.width;
            //     canvasWrapper.style.height =  container.style.height;
            //     canvasWrapper.classList.add('canvasWrapper');
            //     container.insertBefore(canvasWrapper, textLayerDiv)

            //     let canvas = document.createElement('canvas');

            //     var context = canvas.getContext('2d', {alpha: false});
            //     canvas.height = viewport.height;
            //     // canvas.width = viewport.width;
            //     canvas.width = container.clientWidth;
            //     canvasWrapper.appendChild(canvas);

            //     const textLayerDiv = document.querySelector('.textLayer');
            //     let textContentStream = page.streamTextContent({
            //         normalizeWhitespace: true,
            //     });
            //     // var renderCapability = (0, pdfJsLib.createPromiseCapability)();
            //     page.getTextContent().then(function (textContent) {
            //         console.log(viewport, textContent, buildSVG)
            //         // building SVG and adding that to the DOM
            //         // var svg = buildSVG(viewport, textContent);
            //         // textWrap.appendChild(svg);

            //         let textLayerFrag = document.createDocumentFragment();

            //         var textDivs = [],
            //             textContentItemsStr = [];
            //         var textLayerRenderTask = pdfJsLib.renderTextLayer({
            //             textContent: textContent,
            //             textContentStream: textContentStream,
            //             container: textLayerFrag,
            //             viewport: viewport,
            //             textDivs: textDivs,
            //             textContentItemsStr: textContentItemsStr,
            //             timeout: 300,
            //             enhanceTextSelection: false,
            //         });
            //         textLayerRenderTask.promise.then(() => {
            //             textLayerDiv.appendChild(textLayerFrag);
            //         }, function (reason) {
            //             // Cancelled or failed to render text layer; skipping errors.
            //             console.log('error: ', reason)
            //         });

            //     });

            //     // annotation layer start
            //     page.getAnnotations({ indent: 'disaplay', }).then((annotations) => {
            //         if(annotations.length === 0) {
            //             return;
            //         }
            //         var annotationDiv = document.createElement('div');
            //         annotationDiv.className = 'annotationLayer';
            //         container.appendChild(annotationDiv);
            //         let annotationParam = {
            //             viewport: viewport.clone({ dontFlip: true}),
            //             div: annotationDiv,
            //             annotations,
            //             page,
            //             imageResourcesPath: './images/',
            //             renderInteractiveForms: true,
            //             linkService: {
            //                 externalLinkTarget: null,
            //                 externalLinkRel: null
            //             },
            //             // downloadManager:
            //         }
            //         pdfJsLib.AnnotationLayer.render(annotationParam)
            //     });
            //     // annotation layer end



            //     var renderContext = {
            //         canvasContext: context,
            //         viewport: viewport
            //     };
            //     console.log("renderContent: ",renderContext)
            //     console.log('page: ', page);
            //     var renderTask = page.render(renderContext);
            //     renderTask.then(function() {
            //         console.log('page rendered');
            //     })
            // }, function(error) {
            //     console.log('error', error);
            // })
        })
    },
    methods: {
        /**
         * render a page of pdf
         * @param {file} pdf
         * @param {number} page
         */
        renderPage(pdf, page, container) {
            pdf.getPage(page).then(function(page) {
                console.log('Page loaded');
                var scale = 1.5;
                var viewport = page.getViewport(scale);

                var canvasWrapper = document.createElement('div');
                canvasWrapper.style.width =  container.style.width;
                canvasWrapper.style.height =  container.style.height;
                canvasWrapper.classList.add('canvasWrapper');
                container.insertBefore(canvasWrapper, textLayerDiv)

                let canvas = document.createElement('canvas');

                var context = canvas.getContext('2d', {alpha: false});
                canvas.height = viewport.height;
                // canvas.width = viewport.width;
                canvas.width = container.clientWidth;
                canvasWrapper.appendChild(canvas);

                const textLayerDiv = document.querySelector('.textLayer');
                let textContentStream = page.streamTextContent({
                    normalizeWhitespace: true,
                });
                // var renderCapability = (0, pdfJsLib.createPromiseCapability)();
                page.getTextContent().then(function (textContent) {
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
                    container.appendChild(annotationDiv);
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
.pdf-wrap {
  min-width: 600px;
  border: 1px solid #999;
  height: auto;
  min-height: 300px;
  position: relative;
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
