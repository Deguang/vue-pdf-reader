<template>
    <div class="pdf-content">
        <vue-pdf-reader :url="url" loading-text="简历加载中"/>
    </div>
</template>
<script>
import VuePdfReader from '../src/components/PdfPreview.vue'
export default {
    data() {
        return {
            url: '../static/resume.pdf'
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

