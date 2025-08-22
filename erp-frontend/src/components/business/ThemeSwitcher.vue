<template>
  <div class="theme-switcher" ref="themeSwitcherRef">
    <!-- 主题切换按钮 -->
    <el-tooltip 
      :content="currentThemeConfig.name" 
      placement="bottom"
      :show-after="500"
    >
      <button 
        class="theme-toggle" 
        @click="toggleDropdown"
        :class="{ active: showDropdown }"
      >
        <el-icon>
          <Sunny v-if="!themeStore.isDarkMode" />
          <Moon v-else />
        </el-icon>
      </button>
    </el-tooltip>

    <!-- 主题选择下拉菜单 -->
    <transition name="theme-dropdown">
      <div 
        v-show="showDropdown" 
        class="theme-dropdown"
        @click.stop
      >
        <div class="theme-dropdown-header">
          <h4>选择主题</h4>
          <button class="close-btn" @click="closeDropdown">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        
        <div class="theme-options">
          <div
            v-for="theme in themeList"
            :key="theme.value"
            class="theme-option"
            :class="{ 
              active: themeStore.currentTheme === theme.value,
              preview: previewTheme === theme.value 
            }"
            @click="selectTheme(theme.value)"
            @mouseenter="handlePreview(theme.value)"
            @mouseleave="handleCancelPreview"
          >
            <div class="theme-color" :class="theme.value">
              <div class="theme-color-inner" :style="{ background: theme.primaryColor }"></div>
            </div>
            <div class="theme-info">
              <div class="theme-name">{{ theme.label }}</div>
              <div class="theme-description">{{ theme.description }}</div>
            </div>
            <div class="theme-check" v-if="themeStore.currentTheme === theme.value">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>

        <div class="theme-dropdown-footer">
          <div class="theme-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>主题设置会自动保存</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 遮罩层 -->
    <div 
      v-show="showDropdown" 
      class="theme-overlay"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { 
  Sunny, 
  Moon, 
  Close, 
  Check, 
  InfoFilled 
} from '@element-plus/icons-vue'

// Props
interface Props {
  placement?: 'bottom' | 'top' | 'left' | 'right'
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  showPreview: true
})

// 状态
const themeStore = useThemeStore()
const showDropdown = ref(false)
const previewTheme = ref<ThemeMode | null>(null)
const themeSwitcherRef = ref<HTMLElement>()

// 计算属性
const currentThemeConfig = computed(() => themeStore.themeConfig)
const themeList = computed(() => themeStore.getThemeList())

// 方法
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
  handleCancelPreview()
}

const selectTheme = (theme: ThemeMode) => {
  themeStore.setTheme(theme)
  previewTheme.value = null
  closeDropdown()
}

const handlePreview = (theme: ThemeMode) => {
  if (!props.showPreview || theme === themeStore.currentTheme) return
  
  previewTheme.value = theme
  themeStore.previewTheme(theme)
}

const handleCancelPreview = () => {
  if (!previewTheme.value) return
  
  previewTheme.value = null
  themeStore.cancelPreview()
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  if (!themeSwitcherRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  handleCancelPreview()
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-color-regular);
  cursor: pointer;
  transition: var(--transition-base);
}

.theme-toggle:hover,
.theme-toggle.active {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-light);
  z-index: var(--z-index-popper);
  overflow: hidden;
}

.theme-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-lighter);
  background: var(--bg-color-secondary);
}

.theme-dropdown-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.close-btn:hover {
  background: var(--bg-color-tertiary);
  color: var(--text-color-primary);
}

.theme-options {
  padding: var(--spacing-md);
  max-height: 320px;
  overflow-y: auto;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
}

.theme-option:hover {
  background: var(--bg-color-secondary);
}

.theme-option.active {
  background: var(--primary-color-lighter);
  color: var(--primary-color-dark);
}

.theme-option.preview {
  background: var(--warning-color-lighter);
  transform: scale(1.02);
}

.theme-color {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-circle);
  border: 2px solid var(--border-color-light);
  overflow: hidden;
  flex-shrink: 0;
}

.theme-color-inner {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

/* 特殊主题颜色 */
.theme-color.light .theme-color-inner {
  background: linear-gradient(45deg, #409EFF, #79BBFF) !important;
}

.theme-color.dark .theme-color-inner {
  background: linear-gradient(45deg, #1D1E1F, #25262B) !important;
}

.theme-color.auto .theme-color-inner {
  background: conic-gradient(from 0deg, #409EFF, #1D1E1F, #409EFF) !important;
}

.theme-color.high-contrast .theme-color-inner {
  background: linear-gradient(45deg, #000000, #333333) !important;
}

.theme-info {
  flex: 1;
  min-width: 0;
}

.theme-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin-bottom: 2px;
}

.theme-description {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.theme-check {
  color: var(--primary-color);
  font-size: var(--font-size-large);
  flex-shrink: 0;
}

.theme-dropdown-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color-lighter);
  background: var(--bg-color-secondary);
}

.theme-tips {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-index-popper) - 1);
  background: transparent;
}

/* 动画 */
.theme-dropdown-enter-active,
.theme-dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.theme-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.theme-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .theme-dropdown {
    position: fixed;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 90vw;
  }
  
  .theme-options {
    max-height: 60vh;
  }
}

/* 高对比度模式适配 */
[data-theme="high-contrast"] .theme-option {
  border: 2px solid transparent;
}

[data-theme="high-contrast"] .theme-option:hover,
[data-theme="high-contrast"] .theme-option.active {
  border-color: var(--primary-color);
}

[data-theme="high-contrast"] .theme-color {
  border-width: 3px;
}
</style>