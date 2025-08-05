<script setup lang="ts">
// App.vue - 应用根组件
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 14px;
  line-height: 1.5;
}

html, body {
  height: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background-color: #f0f2f5;
  color: #2c3e50;
  overflow-x: hidden;
}

#app {
  height: 100%;
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* 确保容器正确显示 */
.el-container {
  height: 100%;
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 样式覆盖 */
.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-button {
  border-radius: 6px;
}

.el-input__wrapper {
  border-radius: 6px;
}

.el-select .el-input__wrapper {
  border-radius: 6px;
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  html {
    font-size: 13px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 14px;
  }
}

@media (min-width: 1600px) {
  html {
    font-size: 15px;
  }
}

/* 防止页面缩放问题 */
@media screen and (max-width: 320px) {
  html {
    font-size: 12px;
  }
}
</style>
