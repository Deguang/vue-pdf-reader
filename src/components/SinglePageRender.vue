// single page mode
<template>
  <div class="single-page-wrap">
    <div class="pdf-wrap" :class="`pdf-wrap-${timestamp}`">
      <p style="width: 100%;text-align: center;height: 500%" v-if="needLoadingText && fileLoading">{{loadingText}}</p>
      <p v-if="error">{{error}}</p>
    </div>
    <pagination :total="totalPage" @pageChange="pageChange"/>
  </div>
</template>
<script>
import pagination from './Pagination'
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
      pdf: null,
      canvas: null,
      error: null,
      fileLoading: true,
      timestamp: new Date().getTime(),
      totalPage: 0,
      pageRes: null
    }
  },
  mounted() {
      this.init();
  },
  methods: {
    /**
     * init
     */
    init () {
      const t = this;
      this.loadingTask = pdfJsLib.getDocument({
        url: this.url,
        cMapUrl: '../../node_modules/pdfjs-dist/cmaps/',
        cMapPacked: true
      });

      this.loadingTask.promise.then(async function(pdf) {
          console.time('PDF_Render')
          console.log('PDF loaded');
          t.pdf = pdf
          t.totalPage = pdf.numPages;
          t.renderOnePage(1);
      }).catch(function (reason) {
          t.$emit('loaded');
          console.error('Error: ', reason);
          t.fileLoading = false;
          t.error = "PDF load failed :(";
      });
    },
    /**
     * render one page of pdf
     * @param {page} number
     */
    async renderOnePage(page) {
      var t = this;
      var container = document.querySelector(`.pdf-wrap`);
      // for(var i = 0, len = pdf.numPages; i < len; i++) {
      //     await t.renderPage(pdf, i + 1, container)
      // }

      var pageRes = await t.renderPage(this.pdf, page, container);

      var curContainer = document.querySelector(`.pdf-wrap-${t.timestamp}`)
      if (curContainer) {
        console.log(pageRes)
          curContainer.innerHTML = ''
          curContainer.append(pageRes)
          t.pageRes = pageRes
          t.$emit('loaded');
      } else {
          console.log('timestamp has changed.')
      }
      console.timeEnd('PDF_Render')
    },
    pageChange(pageNum) {
      console.log(pageNum)
      this.renderOnePage(pageNum)
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
  },
  components: {
    pagination
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
