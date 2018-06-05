<template>
  <div id="app">
    <div class="pdf-wrap">
      <pdf-preview/>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import PdfPreview from './components/PdfPreview'
export default {
  name: 'App',
  components: {
    HelloWorld,
    PdfPreview
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.pdf-wrap {
  min-width: 600px;
  border: 1px solid #999;
  height: auto;
  min-height: 300px;
}
</style>
