// full page mode
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
import pdfRender from './pdfRender'


pdfJsLib.workerSrc = pdfWorker

export default {
  mixins: [pdfRender],
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
          timestamp: new Date().getTime()
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
