<template>
    <div>
        <canvas id="pdf-page"/>
        <div id="text-wrap"></div>
    </div>
</template>
<script>
import pdfJsLib from 'pdfjs-dist/build/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js'
import { buildSVG, pageLoaded } from '../assets/pdf_utils.js'

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
            pdf.getPage(pageNumber).then(function(page) {
                console.log('Page loaded');
                var scale = 1;
                var viewport = page.getViewport(scale);

                var canvas = document.getElementById('pdf-page');
                console.log(canvas)
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const textWrap = document.getElementById('text-wrap');
                page.getTextContent().then(function (textContent) {
                    console.log(viewport, textContent, buildSVG)
                    // building SVG and adding that to the DOM
                    var svg = buildSVG(viewport, textContent);
                    textWrap.appendChild(svg);
                });

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                var renderTask = page.render(renderContext);
                renderTask.then(function() {
                    console.log('page rendered');
                })
            }, function(error) {
                console.log('error', error);
            })
        })
    }
}
</script>
