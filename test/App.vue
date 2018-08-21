<template>
    <div class="pdf-content">
        <vue-pdf-reader :url="url"/>
    </div>
</template>
<script>
import VuePdfReader from '../src/components/PdfPreview.vue'
export default {
    data() {
        return {
            url: 'http://static.xinrenxinshi.com/pdfpreview/web/compressed.tracemonkey-pldi-09.pdf'
        }
    },
    components: {
        'vue-pdf-reader': VuePdfReader
    }
}
</script>
<style>
body {
  padding: 0;
  margin: 0;
}
</style>

