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

interface LineChartData {
  name: string
  data: (number | null)[]
  type?: 'line' | 'bar'
  smooth?: boolean
  areaStyle?: any
  lineStyle?: any
  itemStyle?: any
  symbol?: string
  symbolSize?: number
  stack?: string
}

interface Props {
  // 数据
  data: LineChartData[]
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
  // 线图特有配置
  smooth?: boolean
  showArea?: boolean
  showSymbol?: boolean
  symbolSize?: number
  stack?: boolean
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
  // 缩放配置
  enableZoom?: boolean
  // 标记线
  markLines?: any[]
  // 标记点
  markPoints?: any[]
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
  smooth: false,
  showArea: false,
  showSymbol: true,
  symbolSize: 6,
  stack: false,
  gridTop: '60',
  gridBottom: '60',
  gridLeft: '60',
  gridRight: '40',
  showLegend: true,
  legendPosition: 'top',
  showTooltip: true,
  tooltipTrigger: 'axis',
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
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any) => {
        if (Array.isArray(params)) {
          let result = `${params[0].axisValue}<br/>`
          params.forEach((param: any) => {
            const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
            result += `${marker}${param.seriesName}: ${param.value}<br/>`
          })
          return result
        } else {
          const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>`
          return `${params.axisValue}<br/>${marker}${params.seriesName}: ${params.value}`
        }
      }
    } : undefined,

    // X轴配置
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      name: props.xAxisName,
      nameLocation: 'middle',
      nameGap: 30,
      boundaryGap: false,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        rotate: props.xAxisData.some(item => item.length > 6) ? 45 : 0,
        interval: 'auto'
      }
    },

    // Y轴配置
    yAxis: {
      type: 'value',
      name: props.yAxisName,
      nameLocation: 'middle',
      nameGap: 50,
      min: props.yAxisMin,
      max: props.yAxisMax,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },

    // 系列配置
    series: props.data.map((item, index) => ({
      name: item.name,
      type: item.type || 'line',
      data: item.data,
      smooth: item.smooth ?? props.smooth,
      symbol: props.showSymbol ? (item.symbol || 'circle') : 'none',
      symbolSize: item.symbolSize ?? props.symbolSize,
      stack: props.stack ? (item.stack || 'total') : undefined,
      areaStyle: props.showArea ? (item.areaStyle || {}) : undefined,
      lineStyle: item.lineStyle || {
        width: 2
      },
      itemStyle: item.itemStyle || {},
      emphasis: {
        focus: 'series'
      },
      // 标记线
      markLine: props.markLines && props.markLines.length > 0 ? {
        data: props.markLines
      } : undefined,
      // 标记点
      markPoint: props.markPoints && props.markPoints.length > 0 ? {
        data: props.markPoints
      } : undefined
    })),

    // 数据缩放配置
    dataZoom: props.enableZoom ? [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 30,
        bottom: 10
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