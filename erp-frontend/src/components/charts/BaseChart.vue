<template>
  <div 
    class="base-chart" 
    :class="{ 
      'chart-loading': loading,
      'chart-error': hasError,
      [`theme-${theme}`]: theme 
    }"
    :style="{ height }"
  >
    <!-- 图表工具栏 -->
    <div v-if="showToolbar" class="chart-toolbar">
      <div class="chart-title">
        <h4 v-if="title">{{ title }}</h4>
        <span v-if="subtitle" class="chart-subtitle">{{ subtitle }}</span>
      </div>
      <div class="chart-actions">
        <button 
          v-if="showRefresh"
          class="chart-action-btn"
          @click="handleRefresh"
          :disabled="loading"
          title="刷新数据"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
        <button 
          v-if="showFullscreen"
          class="chart-action-btn"
          @click="toggleFullscreen"
          title="全屏显示"
        >
          <i class="fas fa-expand"></i>
        </button>
        <button 
          v-if="showDownload"
          class="chart-action-btn"
          @click="downloadChart"
          title="下载图表"
        >
          <i class="fas fa-download"></i>
        </button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div 
      ref="chartContainer" 
      class="chart-content"
      :style="{ height: contentHeight }"
    ></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="chart-loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>{{ loadingText }}</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="chart-error-overlay">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ errorMessage }}</span>
        <button class="btn btn-primary btn-small" @click="handleRetry">
          重试
        </button>
      </div>
    </div>

    <!-- 空数据状态 -->
    <div v-if="isEmpty" class="chart-empty-overlay">
      <div class="empty-content">
        <i class="fas fa-chart-bar"></i>
        <span>{{ emptyText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface Props {
  // 图表配置
  option: EChartsOption
  // 图表主题
  theme?: 'light' | 'dark' | 'auto'
  // 图表高度
  height?: string
  // 标题
  title?: string
  // 副标题
  subtitle?: string
  // 是否显示工具栏
  showToolbar?: boolean
  // 是否显示刷新按钮
  showRefresh?: boolean
  // 是否显示全屏按钮
  showFullscreen?: boolean
  // 是否显示下载按钮
  showDownload?: boolean
  // 加载状态
  loading?: boolean
  // 加载文本
  loadingText?: string
  // 错误状态
  error?: string | null
  // 空数据文本
  emptyText?: string
  // 是否自动调整大小
  autoResize?: boolean
  // 动画配置
  animation?: boolean
  // 自定义样式类
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'auto',
  height: '400px',
  showToolbar: true,
  showRefresh: true,
  showFullscreen: false,
  showDownload: false,
  loading: false,
  loadingText: '加载中...',
  error: null,
  emptyText: '暂无数据',
  autoResize: true,
  animation: true
})

const emit = defineEmits<{
  refresh: []
  fullscreen: []
  download: [chart: ECharts]
  retry: []
  chartReady: [chart: ECharts]
  chartClick: [params: any]
  chartHover: [params: any]
}>()

const chartContainer = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// 计算属性
const hasError = computed(() => !!props.error)
const isEmpty = computed(() => {
  if (props.loading || hasError.value) return false
  if (!props.option || !props.option.series) return true
  
  const series = Array.isArray(props.option.series) ? props.option.series : [props.option.series]
  return series.every(s => !s.data || (Array.isArray(s.data) && s.data.length === 0))
})

const errorMessage = computed(() => props.error || '图表加载失败')

const contentHeight = computed(() => {
  if (!props.showToolbar) return props.height
  return `calc(${props.height} - 50px)`
})

// 获取当前主题
const getCurrentTheme = () => {
  if (props.theme === 'auto') {
    // 检测系统主题或从HTML属性获取
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    return htmlTheme === 'dark' ? 'dark' : 'light'
  }
  return props.theme
}

// 获取主题配置
const getThemeOption = (theme: string): Partial<EChartsOption> => {
  const isDark = theme === 'dark'
  
  return {
    backgroundColor: isDark ? '#1D1E1F' : '#FFFFFF',
    textStyle: {
      color: isDark ? '#E4E7ED' : '#303133'
    },
    grid: {
      borderColor: isDark ? '#4C4D4F' : '#DCDFE6'
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: isDark ? '#4C4D4F' : '#DCDFE6'
        }
      },
      axisLabel: {
        color: isDark ? '#CFD3DC' : '#606266'
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#414243' : '#E4E7ED'
        }
      }
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: isDark ? '#4C4D4F' : '#DCDFE6'
        }
      },
      axisLabel: {
        color: isDark ? '#CFD3DC' : '#606266'
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#414243' : '#E4E7ED'
        }
      }
    },
    legend: {
      textStyle: {
        color: isDark ? '#CFD3DC' : '#606266'
      }
    },
    tooltip: {
      backgroundColor: isDark ? '#25262B' : '#FFFFFF',
      borderColor: isDark ? '#4C4D4F' : '#DCDFE6',
      textStyle: {
        color: isDark ? '#E4E7ED' : '#303133'
      }
    }
  }
}

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value) return

  await nextTick()

  // 销毁现有实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新实例
  const theme = getCurrentTheme()
  chartInstance = echarts.init(chartContainer.value, theme)

  // 设置图表配置
  updateChart()

  // 绑定事件
  chartInstance.on('click', (params) => {
    emit('chartClick', params)
  })

  chartInstance.on('mouseover', (params) => {
    emit('chartHover', params)
  })

  // 发出图表就绪事件
  emit('chartReady', chartInstance)

  // 设置自动调整大小
  if (props.autoResize) {
    setupResize()
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.option) return

  const theme = getCurrentTheme()
  const themeOption = getThemeOption(theme)
  
  const finalOption: EChartsOption = {
    ...themeOption,
    ...props.option,
    animation: props.animation
  }

  chartInstance.setOption(finalOption, true)
}

// 设置自动调整大小
const setupResize = () => {
  if (!chartContainer.value || !chartInstance) return

  // 使用 ResizeObserver 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })

  resizeObserver.observe(chartContainer.value)

  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize)
}

// 处理窗口大小变化
const handleWindowResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
}

const toggleFullscreen = () => {
  emit('fullscreen')
}

const downloadChart = () => {
  if (chartInstance) {
    emit('download', chartInstance)
  }
}

const handleRetry = () => {
  emit('retry')
}

// 监听配置变化
watch(() => props.option, () => {
  updateChart()
}, { deep: true })

// 监听主题变化
watch(() => props.theme, () => {
  initChart()
})

// 监听系统主题变化
watch(() => document.documentElement.getAttribute('data-theme'), () => {
  if (props.theme === 'auto') {
    initChart()
  }
})

// 生命周期
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  
  window.removeEventListener('resize', handleWindowResize)
})

// 暴露方法
defineExpose({
  getChart: () => chartInstance,
  resize: () => chartInstance?.resize(),
  refresh: () => updateChart()
})
</script>

<style scoped lang="scss">
.base-chart {
  position: relative;
  width: 100%;
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: var(--transition-base);

  &:hover {
    box-shadow: var(--box-shadow-dark);
  }

  &.chart-loading {
    pointer-events: none;
  }
}

.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
}

.chart-title {
  h4 {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-medium);
    color: var(--text-color-primary);
  }
}

.chart-subtitle {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chart-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  background: var(--bg-color-primary);
  color: var(--text-color-regular);
  cursor: pointer;
  transition: var(--transition-base);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-color-lighter);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  i {
    font-size: var(--font-size-small);
  }
}

.chart-content {
  position: relative;
  width: 100%;
}

// 覆盖层样式
.chart-loading-overlay,
.chart-error-overlay,
.chart-empty-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.loading-spinner,
.error-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
}

.loading-spinner {
  i {
    font-size: 24px;
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }

  span {
    font-size: var(--font-size-base);
    color: var(--text-color-secondary);
  }
}

.error-content {
  i {
    font-size: 32px;
    color: var(--danger-color);
    margin-bottom: var(--spacing-sm);
  }

  span {
    font-size: var(--font-size-base);
    color: var(--text-color-regular);
    margin-bottom: var(--spacing-md);
  }
}

.empty-content {
  i {
    font-size: 48px;
    color: var(--text-color-placeholder);
    margin-bottom: var(--spacing-md);
  }

  span {
    font-size: var(--font-size-base);
    color: var(--text-color-secondary);
  }
}

// 主题样式
.theme-dark {
  .chart-loading-overlay,
  .chart-error-overlay,
  .chart-empty-overlay {
    background: rgba(29, 30, 31, 0.9);
  }
}

// 全屏样式
.chart-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: var(--z-index-modal) !important;
  border-radius: 0 !important;
}

// 响应式设计
@media (max-width: 768px) {
  .chart-toolbar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .chart-actions {
    justify-content: center;
  }
}
</style>