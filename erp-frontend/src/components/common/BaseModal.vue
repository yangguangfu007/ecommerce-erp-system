<!--
  基础模态框组件
  参考 HTML 原型中的模态框设计，支持不同尺寸和类型
-->
<template>
  <div v-if="visible">
    <div
      v-if="visible"
      class="modal-overlay"
      :class="overlayClasses"
      @click="handleOverlayClick"
    >
      <div
        ref="modalRef"
        class="modal-container"
        :class="containerClasses"
        @click.stop
      >
        <!-- 模态框头部 -->
        <div v-if="showHeader" class="modal-header">
          <h3 class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h3>
          <button
            v-if="showClose"
            class="modal-close"
            @click="handleClose"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 模态框内容 -->
        <div class="modal-body" :class="bodyClasses">
          <slot></slot>
        </div>
        
        <!-- 模态框底部 -->
        <div v-if="showFooter" class="modal-footer">
          <slot name="footer">
            <base-button
              v-if="showCancelButton"
              type="secondary"
              @click="handleCancel"
            >
              {{ cancelButtonText }}
            </base-button>
            <base-button
              v-if="showConfirmButton"
              type="primary"
              :loading="confirmLoading"
              @click="handleConfirm"
            >
              {{ confirmButtonText }}
            </base-button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BaseButton from './BaseButton.vue'

interface Props {
  /** 是否显示模态框 */
  visible?: boolean
  /** 模态框标题 */
  title?: string
  /** 模态框尺寸 */
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否显示取消按钮 */
  showCancelButton?: boolean
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 点击遮罩层是否关闭 */
  closeOnClickOverlay?: boolean
  /** 按ESC键是否关闭 */
  closeOnPressEscape?: boolean
  /** 是否锁定滚动 */
  lockScroll?: boolean
  /** 是否居中显示 */
  centered?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 模态框层级 */
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  size: 'medium',
  showHeader: true,
  showClose: true,
  showFooter: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelButtonText: '取消',
  confirmButtonText: '确认',
  confirmLoading: false,
  closeOnClickOverlay: true,
  closeOnPressEscape: true,
  lockScroll: true,
  centered: true,
  draggable: false
})

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
  (e: 'opened'): void
  (e: 'closed'): void
}

const emit = defineEmits<Emits>()

const modalRef = ref<HTMLElement>()

// 计算遮罩层样式类
const overlayClasses = computed(() => {
  return [
    props.size,
    {
      show: props.visible,
      centered: props.centered
    },
    props.customClass
  ]
})

// 计算容器样式类
const containerClasses = computed(() => {
  return {
    centered: props.centered,
    draggable: props.draggable
  }
})

// 计算内容区样式类
const bodyClasses = computed(() => {
  return {
    'no-padding': !props.showHeader && !props.showFooter
  }
})

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnPressEscape && props.visible) {
    handleClose()
  }
}

// 锁定/解锁页面滚动
const toggleBodyScroll = (lock: boolean) => {
  if (!props.lockScroll) return
  
  if (lock) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
}

// 监听显示状态变化
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      nextTick(() => {
        emit('opened')
        toggleBodyScroll(true)
      })
    } else {
      emit('closed')
      toggleBodyScroll(false)
    }
  },
  { immediate: true }
)

// 组件挂载时添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听和解锁滚动
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  toggleBodyScroll(false)
})
</script>

<style scoped>
/* 模态框样式 - 参考 HTML 原型 components.css */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-fade);
  padding: var(--spacing-lg);
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: var(--box-shadow-dark);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  transform: scale(0.9);
  transition: var(--transition-md-fade);
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .modal-container {
  transform: scale(1);
}

/* 模态框尺寸 */
.modal-overlay.small .modal-container {
  max-width: 400px;
}

.modal-overlay.medium .modal-container {
  max-width: 600px;
}

.modal-overlay.large .modal-container {
  max-width: 800px;
}

.modal-overlay.fullscreen .modal-container {
  max-width: 95vw;
  max-height: 95vh;
}

/* 模态框居中 */
.modal-container.centered {
  margin: auto;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-color-placeholder);
  cursor: pointer;
  transition: var(--transition-base);
}

.modal-close:hover {
  background: var(--bg-color-secondary);
  color: var(--text-color-regular);
}

/* 模态框内容 */
.modal-body {
  padding: var(--card-padding);
  flex: 1;
  overflow-y: auto;
}

.modal-body.no-padding {
  padding: 0;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--card-padding);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
  flex-shrink: 0;
}

/* 可拖拽模态框 */
.modal-container.draggable .modal-header {
  cursor: move;
  user-select: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
  }
  
  .modal-overlay.small .modal-container,
  .modal-overlay.medium .modal-container,
  .modal-overlay.large .modal-container {
    max-width: 100%;
    width: 100%;
  }
  
  .modal-header {
    padding: var(--spacing-lg);
  }
  
  .modal-body {
    padding: var(--spacing-lg);
  }
  
  .modal-footer {
    padding: var(--spacing-lg);
    flex-direction: column-reverse;
    gap: var(--spacing-sm);
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>

<style>
/* 全局样式 - 防止页面滚动 */
body.modal-open {
  overflow: hidden;
}
</style>