<template>
    <div class="pdf-content">
        <button @click="changeUrl">change url</button>
        <vue-pdf-reader :url="url6" loading-text="简历加载中"/>
    </div>
</template>
<script>
import VuePdfReader from '../src/components/PdfPreview.vue'
export default {
    data() {
        return {
            url: '../static/demo.pdf',
            url1: '../static/demo1.pdf',
            url2: '../static/demo2.pdf',
            url3: '../static/demo3.pdf',
            url4: '../static/demo4.pdf',
            url5: '../static/demo5.pdf',
            url6: '../static/demo6.pdf'
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

