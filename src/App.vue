<template>
  <div id="app">
      <pdf-preview :url="pdfUrl"/>
      <!-- <embed width="100%" height="100%" name="plugin" id="plugin" src="https://blog.mozilla.org/security/files/2015/05/HTTPS-FAQ.pdf" type="application/pdf" internalinstanceid="6"> -->
  </div>
</template>

<script>
import PdfPreview from './components/PdfPreview'
export default {
  name: 'App',
  components: {
    PdfPreview
  },
  data() {
    return {
      pdfUrl: 'https://blog.mozilla.org/security/files/2015/05/HTTPS-FAQ.pdf',
    }
  }
}
</script>

<style>
* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
