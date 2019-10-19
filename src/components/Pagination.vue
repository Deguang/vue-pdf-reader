<template>
  <div class="pdf-pagination">
    <div class="pre" :class="{'disabled': currentPage <= 1}">&lt;</div>
    <input class="current-page" v-model="currentPage" />
    <div class="next" :class="{'disabled': currentPage >= total + 1}">&gt;</div>
  </div>
</template>
<script>
export default {
  props: {
    total: {
      required: true,
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      currentPage: 1
    }
  },
  watch: {
    // currentPage
  }
}
</script>
<style scoped>
  .pdf-pagination {
    font-size: 0;
    text-align: center;
  }
  .pre,
  .current-page,
  .next {
    display: inline-block;
    font-size: 16px;
    margin: 4px;
    color: #333;
    outline: none;
  }
  .current-page {
    width: 60px;
    text-align: center;
    border: none;
    border-bottom: 1px solid #ccc;
  }
  .pre.disabled,
  .next.disabled {
    color: #ccc;
  }
</style>
