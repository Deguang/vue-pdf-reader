<template>
  <div class="demo-wrap">
    <nav>
      <li><a href="#demo1">demo1: show all pages</a></li>
      <li><a href="#demo2">demo2: show one page with pagination</a></li>
    </nav>
    <div class="split-line"/>
    <h2 id="demo1">demo1: show all pages</h2>
    <div class="pdf-content">
      <button @click="changeUrl">change url</button>
      <!-- <vue-pdf-reader
        :url="url"
        loading-text="简历加载中"
      /> -->
    </div>
    <div class="split-line"/>
    <h2 id="demo2">demo2: show one page with pagination</h2>
    <div class="pdf-content-2">
      <vue-pdf-reader
        :url="url"
        mode="single-page"
        loading-text="简历加载中"
      />
    </div>
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
        this.url = '../static/demo1.pdf'
      }
    }
}
</script>
<style>
body {
  padding: 0;
  margin: 0;
}
nav {
  margin: 10px;
}
.split-line {
  height: 1px;
  border-bottom: 1px solid #ccc;
}
</style>

