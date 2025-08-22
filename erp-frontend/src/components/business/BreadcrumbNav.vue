<!-- 面包屑导航组件 - 自动生成导航路径 -->
<template>
  <nav class="breadcrumb-nav" :class="{ 'breadcrumb-nav-compact': compact }">
    <ol class="breadcrumb-list">
      <!-- 首页链接 -->
      <li v-if="showHome" class="breadcrumb-item">
        <router-link 
          :to="homeRoute" 
          class="breadcrumb-link"
          :class="{ 'breadcrumb-link-active': isHomePage }"
        >
          <el-icon class="breadcrumb-icon">
            <HomeFilled />
          </el-icon>
          <span v-if="!compact">{{ homeText }}</span>
        </router-link>
      </li>
      
      <!-- 动态面包屑项 -->
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="item.path || index"
        class="breadcrumb-item"
      >
        <!-- 分隔符 -->
        <span v-if="showHome || index > 0" class="breadcrumb-separator">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </span>
        
        <!-- 可点击的链接 -->
        <router-link
          v-if="item.path && !item.disabled && index < breadcrumbItems.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          <el-icon v-if="item.icon" class="breadcrumb-icon">
            <component :is="item.icon" />
          </el-icon>
          {{ item.title }}
        </router-link>
        
        <!-- 当前页面（不可点击） -->
        <span
          v-else
          class="breadcrumb-text"
          :class="{ 'breadcrumb-text-active': index === breadcrumbItems.length - 1 }"
        >
          <el-icon v-if="item.icon" class="breadcrumb-icon">
            <component :is="item.icon" />
          </el-icon>
          {{ item.title }}
        </span>
      </li>
    </ol>
    
    <!-- 额外操作 -->
    <div v-if="$slots.actions" class="breadcrumb-actions">
      <slot name="actions" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, ArrowRight } from '@element-plus/icons-vue'

interface BreadcrumbItem {
  title: string
  path?: string
  icon?: any
  disabled?: boolean
  meta?: any
}

interface Props {
  /** 自定义面包屑项 */
  items?: BreadcrumbItem[]
  /** 是否显示首页 */
  showHome?: boolean
  /** 首页文本 */
  homeText?: string
  /** 首页路由 */
  homeRoute?: string
  /** 紧凑模式 */
  compact?: boolean
  /** 是否自动生成 */
  autoGenerate?: boolean
  /** 最大显示层级 */
  maxLevel?: number
  /** 路由元信息字段映射 */
  metaFields?: {
    title?: string
    icon?: string
    breadcrumb?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  showHome: true,
  homeText: '首页',
  homeRoute: '/dashboard',
  compact: false,
  autoGenerate: true,
  maxLevel: 10,
  metaFields: () => ({
    title: 'title',
    icon: 'icon',
    breadcrumb: 'breadcrumb'
  })
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const customItems = ref<BreadcrumbItem[]>(props.items || [])

// 计算属性
const isHomePage = computed(() => {
  return route?.path === props.homeRoute
})

// 自动生成面包屑项
const generateBreadcrumbs = (): BreadcrumbItem[] => {
  if (!props.autoGenerate) return customItems.value

  const matched = route?.matched?.filter(record => {
    // 过滤掉重定向路由和没有组件的路由
    return record.components && record.meta?.breadcrumb !== false
  })

  const breadcrumbs: BreadcrumbItem[] = []

  matched.forEach((record, index) => {
    const meta = record.meta || {}
    
    // 获取标题
    let title = meta[props.metaFields.title!] || 
                meta.title || 
                record.name?.toString() || 
                '未命名页面'
    
    // 如果有自定义面包屑文本，使用自定义文本
    if (meta[props.metaFields.breadcrumb!]) {
      title = meta[props.metaFields.breadcrumb!]
    }
    
    // 获取图标
    const icon = meta[props.metaFields.icon!] || meta.icon
    
    // 构建路径
    let path = record.path
    
    // 如果是参数化路由，使用当前路由的实际路径
    if (path.includes(':')) {
      if (index === matched.length - 1) {
        path = route.path
      } else {
        // 对于中间的参数化路由，尝试构建路径
        path = record.path
        Object.keys(route.params).forEach(key => {
          path = path.replace(`:${key}`, route.params[key] as string)
        })
      }
    }
    
    breadcrumbs.push({
      title,
      path: index === matched.length - 1 ? undefined : path, // 最后一项不可点击
      icon,
      meta
    })
  })

  return breadcrumbs.slice(0, props.maxLevel)
}

// 计算最终的面包屑项
const breadcrumbItems = computed(() => {
  if (props.items && props.items.length > 0) {
    return props.items.slice(0, props.maxLevel)
  }
  
  return generateBreadcrumbs()
})

// 监听路由变化
watch(() => route?.path, () => {
  if (props.autoGenerate && route?.path) {
    // 路由变化时重新生成面包屑
  }
}, { immediate: true })

// 监听自定义项变化
watch(() => props.items, (newItems) => {
  if (newItems) {
    customItems.value = [...newItems]
  }
}, { deep: true })

// 暴露方法
const updateItems = (items: BreadcrumbItem[]) => {
  customItems.value = items
}

const addItem = (item: BreadcrumbItem, index?: number) => {
  if (typeof index === 'number') {
    customItems.value.splice(index, 0, item)
  } else {
    customItems.value.push(item)
  }
}

const removeItem = (index: number) => {
  customItems.value.splice(index, 1)
}

const clearItems = () => {
  customItems.value = []
}

defineExpose({
  updateItems,
  addItem,
  removeItem,
  clearItems
})
</script>

<style scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 16px;
  background: transparent;
}

.breadcrumb-nav-compact {
  padding: 8px 0;
  margin-bottom: 12px;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
  gap: 4px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 1.5;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  margin: 0 8px;
  color: #c0c4cc;
  font-size: 12px;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.breadcrumb-link:hover {
  color: #409eff;
  background: #f0f9ff;
}

.breadcrumb-link-active {
  color: #409eff;
  font-weight: 500;
}

.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  padding: 4px 8px;
  white-space: nowrap;
}

.breadcrumb-text-active {
  color: #303133;
  font-weight: 500;
}

.breadcrumb-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb-nav {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .breadcrumb-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .breadcrumb-list::-webkit-scrollbar {
    display: none;
  }
  
  .breadcrumb-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .breadcrumb-separator {
    margin: 0 4px;
  }
  
  .breadcrumb-link,
  .breadcrumb-text {
    padding: 4px 6px;
    font-size: 13px;
  }
}

/* 紧凑模式样式 */
.breadcrumb-nav-compact .breadcrumb-link,
.breadcrumb-nav-compact .breadcrumb-text {
  padding: 2px 6px;
  font-size: 13px;
}

.breadcrumb-nav-compact .breadcrumb-separator {
  margin: 0 6px;
}

.breadcrumb-nav-compact .breadcrumb-icon {
  font-size: 13px;
}

/* 动画效果 */
.breadcrumb-item {
  animation: fadeInRight 0.3s ease;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 长文本处理 */
.breadcrumb-link,
.breadcrumb-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .breadcrumb-link,
  .breadcrumb-text {
    max-width: 120px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    color: #000;
  }
  
  .breadcrumb-link:hover {
    color: #0066cc;
    background: #e6f3ff;
  }
  
  .breadcrumb-text {
    color: #666;
  }
  
  .breadcrumb-text-active {
    color: #000;
  }
}
</style>