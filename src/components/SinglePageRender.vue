<template>
  <div class="single-pdf-wrap">
    <pagination v-if="mode === 'single-page' && fileLoading === false" :total="totalPage" @page-change="pageChange"/>
    single pdf render
  </div>
</template>
<script>
import Pagination from './Pagination.vue'

export default {
  components: {
    Pagination
  }
}
</script>
