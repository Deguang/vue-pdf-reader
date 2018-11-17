<template>
    <div class="pdf-content">
        <button @click="changeUrl">change url</button>
        <vue-pdf-reader :url="url" loading-text="简历加载中"/>
    </div>
</template>
<script>
import VuePdfReader from '../src/components/PdfPreview.vue'
export default {
    data() {
        return {
            url: '../static/demo.pdf'
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

