import pdfPreview from './components/PdfPreview.vue';

const VuePdfReader = {
  install: function (vue) {
    if(typeof window !== 'undefined' && window.Vue) {
      Vue = window.Vue;
    }
    Vue.component('VuePdfReader', pdfPreview);
  }
}

if(!Promise.map) {
    Promise.map = function(vals, cb) {
        return Promise.all(
            vals.map(function(val, index) {
                return new PromisePromise(function(resolve) {
                    cb(val, index, resolve);
                })
            })
        )
    }
}

export default VuePdfReader