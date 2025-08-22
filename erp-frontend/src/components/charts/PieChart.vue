<template>
  <BaseChart
    :option="chartOption"
    :theme="theme"
    :height="height"
    :title="title"
    :subtitle="subtitle"
    :show-toolbar="showToolbar"
    :show-refresh="showRefresh"
    :show-fullscreen="showFullscreen"
    :show-download="showDownload"
    :loading="loading"
    :loading-text="loadingText"
    :error="error"
    :empty-text="emptyText"
    :auto-resize="autoResize"
    :animation="animation"
    @refresh="$emit('refresh')"
    @fullscreen="$emit('fullscreen')"
    @download="$emit('download', $event)"
    @retry="$emit('retry')"
    @chart-ready="$emit('chartReady', $event)"
    @chart-click="$emit('chartClick', $event)"
    @chart-hover="$emit('chartHover', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

interface PieChartDataItem {
  name: string
  value: number
  itemStyle?: any
  label?: any
  labelLine?: any
  emphasis?: any
}

interface Props {
  // 数据
  data: PieChartDataItem[]
  // 图表配置
  title?: string
  subtitle?: string
  theme?: 'light' | 'dark' | 'auto'
  height?: string
  showToolbar?: boolean
  showRefresh?: boolean
  showFullscreen?: boolean
  showDownload?: boolean
  loading?: boolean
  loadingText?: string
  error?: string | null
  emptyText?: string
  autoResize?: boolean
  animation?: boolean
  // 饼图特有配置
  isDoughnut?: boolean
  radius?: string | [string, string]
  innerRadius?: string
  outerRadius?: string
  center?: [string, string]
  roseType?: false | 'radius' | 'area'
  // 标签配置
  showLabel?: boolean
  labelPosition?: 'outside' | 'inside' | 'inner' | 'center'
  showLabelLine?: boolean
  // 图例配置
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendOrient?: 'horizontal' | 'vertical'
  // 工具提示配置
  showTooltip?: boolean
  tooltipTrigger?: 'item' | 'axis' | 'none'
  // 自定义颜色
  colors?: string[]
  // 选中模式
  selectedMode?: boolean | 'single' | 'multiple'
  // 最小角度
  minAngle?: number
  // 起始角度
  startAngle?: number
  // 顺时针方向
  clockwise?: boolean
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
  animation: true,
  isDoughnut: false,
  radius: '70%',
  center: ['50%', '50%'],
  roseType: false,
  showLabel: true,
  labelPosition: 'outside',
  showLabelLine: true,
  showLegend: true,
  legendPosition: 'right',
  legendOrient: 'vertical',
  showTooltip: true,
  tooltipTrigger: 'item',
  selectedMode: false,
  minAngle: 0,
  startAngle: 90,
  clockwise: true
})

const emit = defineEmits<{
  refresh: []
  fullscreen: []
  download: [chart: any]
  retry: []
  chartReady: [chart: any]
  chartClick: [params: any]
  chartHover: [params: any]
}>()

// 默认颜色配置
const defaultColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#79BBFF', '#95D475', '#EEBC69', '#F89898', '#B1B3B8',
  '#A0CFFF', '#B3E19D', '#F3D19E', '#FAB6B6', '#C8C9CC'
]

// 计算半径
const computedRadius = computed(() => {
  if (props.isDoughnut) {
    if (typeof props.radius === 'string') {
      const outerRadius = props.outerRadius || props.radius
      const innerRadius = props.innerRadius || '40%'
      return [innerRadius, outerRadius]
    }
    return props.radius
  }
  return props.radius
})

// 计算图表配置
const chartOption = computed((): EChartsOption => {
  const option: EChartsOption = {
    color: props.colors || defaultColors,
    
    // 图例配置
    legend: props.showLegend ? {
      type: 'scroll',
      orient: props.legendOrient,
      [props.legendPosition]: props.legendPosition === 'top' || props.legendPosition === 'bottom' ? 10 : 20,
      data: props.data.map(item => item.name),
      textStyle: {
        fontSize: 12
      },
      formatter: (name: string) => {
        const item = props.data.find(d => d.name === name)
        if (item) {
          const total = props.data.reduce((sum, d) => sum + d.value, 0)
          const percentage = ((item.value / total) * 100).toFixed(1)
          return `${name} (${percentage}%)`
        }
        return name
      }
    } : undefined,

    // 工具提示配置
    tooltip: props.showTooltip ? {
      trigger: props.tooltipTrigger,
      formatter: (params: any) => {
        const total = props.data.reduce((sum, item) => sum + item.value, 0)
        const percentage = ((params.value / total) * 100).toFixed(1)
        const marker = `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:${params.color};"></span>`
        return `${marker}${params.name}<br/>数值: ${params.value}<br/>占比: ${percentage}%`
      }
    } : undefined,

    // 系列配置
    series: [
      {
        type: 'pie',
        data: props.data,
        radius: computedRadius.value,
        center: props.center,
        roseType: props.roseType,
        selectedMode: props.selectedMode,
        minAngle: props.minAngle,
        startAngle: props.startAngle,
        clockwise: props.clockwise,
        
        // 标签配置
        label: props.showLabel ? {
          show: true,
          position: props.labelPosition,
          formatter: (params: any) => {
            const total = props.data.reduce((sum, item) => sum + item.value, 0)
            const percentage = ((params.value / total) * 100).toFixed(1)
            
            if (props.labelPosition === 'center') {
              return `{a|${params.name}}\n{b|${percentage}%}`
            } else if (props.labelPosition === 'inside') {
              return `${percentage}%`
            } else {
              return `${params.name}\n${percentage}%`
            }
          },
          rich: props.labelPosition === 'center' ? {
            a: {
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: 20
            },
            b: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#409EFF'
            }
          } : undefined
        } : {
          show: false
        },

        // 标签引导线配置
        labelLine: props.showLabelLine && props.labelPosition === 'outside' ? {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        } : {
          show: false
        },

        // 高亮样式
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },

        // 动画配置
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => Math.random() * 200
      }
    ]
  }

  return option
})
</script>