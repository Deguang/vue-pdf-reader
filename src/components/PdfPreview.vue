<template>
    <div class="pdf-wrap">
    </div>
</template>
<script>
import pdfJsLib from 'pdfjs-dist/build/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js'
import { buildSVG, pageLoaded, roundToDivide, getOutputScale, approximateFraction } from '../assets/pdf_utils.js'

export default {
    props: {
        url: {
            required: true,
            type: String,
            default: ''
        }
    },
    data() {
        return {
            loadingTask: null,
            canvas: null
        }
    },
    mounted() {
        const t = this;
        this.loadingTask = pdfJsLib.getDocument(this.url);
        this.loadingTask.promise.then(async function(pdf) {
            console.log('PDF loaded');

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
                    pageDom.style.display = 'block';
                    pageDom.style.width = '100%';
                    pageDom.className = `page-container page-${pageNum}`
                    var pageNumDom = document.createElement('p');
                    pageNumDom.className = 'page-num';
                    pageNumDom.innerHTML = `-${pageNum}/${pdf.numPages}-`
                    pageDom.appendChild(pageNumDom)
                    container.appendChild(pageDom);


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
                    console.log(canvasWrapper.offsetWidth, page.getViewport(1).width, window.devicePixelRatio);
                    var scale = canvasWrapper.offsetWidth / page.getViewport(1).width * (window.devicePixelRatio || 1);
                    // var scale = canvasWrapper.offsetWidth / page.getViewport(1).width;

                    console.log('scale: ', scale)
                    var viewport = page.getViewport(scale);

                    console.log(canvasWrapper.clientWidth + 'px')

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.style.width = canvasWrapper.clientWidth + 'px';
                    canvas.style.height = (canvasWrapper.clientWidth) * (viewport.height / viewport.width) + 'px';


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
    display: block;
    width: 600px;
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
