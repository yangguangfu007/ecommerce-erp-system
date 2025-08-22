<template>
  <div class="chart-container" :style="{ height }">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

// 注册 Chart.js 组件
Chart.register(...registerables)

interface Props {
  data: any
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  height?: string
  options?: any
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  options: () => ({})
})

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

// 默认配置
const getDefaultOptions = () => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  if (props.type === 'line' || props.type === 'bar') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }
  }

  return baseOptions
}

// 创建图表
const createChart = async () => {
  if (!chartRef.value || !props.data) return

  await nextTick()

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // 销毁现有图表
  if (chartInstance) {
    chartInstance.destroy()
  }

  // 创建新图表
  chartInstance = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: {
      ...getDefaultOptions(),
      ...props.options,
    },
  })
}

// 更新图表数据
const updateChart = () => {
  if (chartInstance && props.data) {
    chartInstance.data = props.data
    chartInstance.update()
  }
}

// 监听数据变化
watch(() => props.data, () => {
  if (chartInstance) {
    updateChart()
  } else {
    createChart()
  }
}, { deep: true })

// 监听类型变化
watch(() => props.type, () => {
  createChart()
})

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped lang="scss">
.chart-container {
  position: relative;
  width: 100%;
}
</style>