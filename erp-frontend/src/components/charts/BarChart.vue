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

interface BarChartData {
  name: string
  data: number[]
  stack?: string
  itemStyle?: any
  label?: any
  barWidth?: string | number
  barMaxWidth?: string | number
  barMinWidth?: string | number
  barGap?: string | number
  barCategoryGap?: string | number
}

interface Props {
  // 数据
  data: BarChartData[]
  // X轴数据
  xAxisData: string[]
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
  // 柱图特有配置
  horizontal?: boolean
  stack?: boolean
  barWidth?: string | number
  barMaxWidth?: string | number
  barMinWidth?: string | number
  barGap?: string | number
  barCategoryGap?: string | number
  // 网格配置
  gridTop?: string | number
  gridBottom?: string | number
  gridLeft?: string | number
  gridRight?: string | number
  // 图例配置
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  // 工具提示配置
  showTooltip?: boolean
  tooltipTrigger?: 'item' | 'axis' | 'none'
  // Y轴配置
  yAxisName?: string
  yAxisMin?: number | 'dataMin'
  yAxisMax?: number | 'dataMax'
  // X轴配置
  xAxisName?: string
  // 标签配置
  showLabel?: boolean
  labelPosition?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom'
  // 缩放配置
  enableZoom?: boolean
  // 自定义颜色
  colors?: string[]
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
  horizontal: false,
  stack: false,
  barGap: '20%',
  barCategoryGap: '20%',
  gridTop: '60',
  gridBottom: '60',
  gridLeft: '60',
  gridRight: '40',
  showLegend: true,
  legendPosition: 'top',
  showTooltip: true,
  tooltipTrigger: 'axis',
  showLabel: false,
  labelPosition: 'top',
  enableZoom: false
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
  '#79BBFF', '#95D475', '#EEBC69', '#F89898', '#B1B3B8'
]

// 计算图表配置
const chartOption = computed((): EChartsOption => {
  const isHorizontal = props.horizontal
  
  const option: EChartsOption = {
    color: props.colors || defaultColors,
    
    // 图例配置
    legend: props.showLegend ? {
      type: 'scroll',
      orient: ['left', 'right'].includes(props.legendPosition) ? 'vertical' : 'horizontal',
      [props.legendPosition]: 10,
      data: props.data.map(item => item.name),
      textStyle: {
        fontSize: 12
      }
    } : undefined,

    // 网格配置
    grid: {
      top: props.gridTop,
      bottom: props.gridBottom,
      left: props.gridLeft,
      right: props.gridRight,
      containLabel: true
    },

    // 工具提示配置
    tooltip: props.showTooltip ? {
      trigger: props.tooltipTrigger,
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        if (Array.isArray(params)) {
          let result = `${params[0].axisValue}<br/>`
          params.forEach((param: any) => {
            const marker = `<span style="display:inline-block;margin-right:4px;border-radius:2px;width:10px;height:10px;background-color:${param.color};"></span>`
            result += `${marker}${param.seriesName}: ${param.value}<br/>`
          })
          return result
        } else {
          const marker = `<span style="display:inline-block;margin-right:4px;border-radius:2px;width:10px;height:10px;background-color:${params.color};"></span>`
          return `${params.axisValue}<br/>${marker}${params.seriesName}: ${params.value}`
        }
      }
    } : undefined,

    // X轴配置
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : props.xAxisData,
      name: props.xAxisName,
      nameLocation: 'middle',
      nameGap: 30,
      min: isHorizontal ? props.yAxisMin : undefined,
      max: isHorizontal ? props.yAxisMax : undefined,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        rotate: !isHorizontal && props.xAxisData.some(item => item.length > 6) ? 45 : 0,
        interval: 'auto'
      },
      splitLine: isHorizontal ? {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      } : undefined
    },

    // Y轴配置
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? props.xAxisData : undefined,
      name: props.yAxisName,
      nameLocation: 'middle',
      nameGap: 50,
      min: !isHorizontal ? props.yAxisMin : undefined,
      max: !isHorizontal ? props.yAxisMax : undefined,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      splitLine: !isHorizontal ? {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      } : undefined
    },

    // 系列配置
    series: props.data.map((item, index) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      stack: props.stack ? (item.stack || 'total') : undefined,
      barWidth: item.barWidth ?? props.barWidth,
      barMaxWidth: item.barMaxWidth ?? props.barMaxWidth,
      barMinWidth: item.barMinWidth ?? props.barMinWidth,
      barGap: item.barGap ?? props.barGap,
      barCategoryGap: item.barCategoryGap ?? props.barCategoryGap,
      itemStyle: item.itemStyle || {
        borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
      },
      label: props.showLabel ? {
        show: true,
        position: props.labelPosition,
        formatter: '{c}',
        ...item.label
      } : undefined,
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    })),

    // 数据缩放配置
    dataZoom: props.enableZoom ? [
      {
        type: 'inside',
        start: 0,
        end: 100,
        orient: isHorizontal ? 'vertical' : 'horizontal'
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: isHorizontal ? undefined : 30,
        width: isHorizontal ? 30 : undefined,
        bottom: isHorizontal ? undefined : 10,
        right: isHorizontal ? 10 : undefined,
        orient: isHorizontal ? 'vertical' : 'horizontal'
      }
    ] : undefined,

    // 工具箱配置
    toolbox: {
      show: false
    }
  }

  return option
})
</script>