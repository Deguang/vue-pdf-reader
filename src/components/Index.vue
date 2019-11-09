<template>
  <component
    v-bind="$attrs"
    :is="mode == 'full-page' ? fullPage : singlePage"
  />
</template>
<script>
import fullPage from './FullPageRender'
import singlePage from './SinglePageRender'

export default {
  data() {
    return {
      fullPage,
      singlePage
    }
  },
  props: {
    mode: {
      required: true,
      type: String,
      default: 'full-page',
      validator: function (value) {
        return ['full-page', 'single-page'].indexOf(value) !== -1
      }
    }
  }
}
</script>
