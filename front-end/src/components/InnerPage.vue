<template>
  <div class="ma-5">
    <h1 class="text-h3 mb-5">{{ props.title }}</h1>
    <div><slot></slot></div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    title: string
  }>()
</script>
