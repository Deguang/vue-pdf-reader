import pdfPreview from './components/PdfPreview.vue';

const VuePdfReader = {
  install: function (vue) {
    if(typeof window !== 'undefined' && window.Vue) {
      Vue = window.Vue;
    }
    Vue.component('VuePdfReader', pdfPreview);
  }
}

export default VuePdfReader