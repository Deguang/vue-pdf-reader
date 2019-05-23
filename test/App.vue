<template>
    <div class="pdf-content">
        <button @click="changeUrl">change url</button>
        <vue-pdf-reader :url="url2" loading-text="简历加载中"/>
    </div>
</template>
<script>
import VuePdfReader from '../src/components/PdfPreview.vue'

export default {
    data() {
        return {
            url: '../static/demo.pdf',
            url2: '../static/demo1.pdf',
            url1:'http://f6.saaspaihangbang.com:8886/site/download?token=e6b59eb40f646b3ee0c30450067f0950.pdf'
        }
    },
    components: {
        'vue-pdf-reader': VuePdfReader
    },
    methods: {
      changeUrl () {
        this.url = ''
      }
    }
}
</script>
<style>
body {
  padding: 0;
  margin: 0;
}
</style>

