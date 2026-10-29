<script setup lang="ts">
// Если используется vue-router:
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app-layout">
    <!-- Если есть роутинг, рендерим текущий маршрут -->
    <RouterView />
    
    <!-- Если роутинга нет, импортируй и подставь нужный компонент, например: -->
    <!-- <MainComponent /> -->
  </div>
</template>

<style scoped>
#app-layout {
  min-height: 100vh;
  width: 100%;
}
</style>