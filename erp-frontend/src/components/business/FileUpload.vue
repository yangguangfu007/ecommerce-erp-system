<!-- 文件上传组件 - 支持单文件和多文件上传 -->
<template>
  <div class="file-upload">
    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{
        'upload-area-dragover': isDragOver,
        'upload-area-disabled': disabled,
        'upload-area-error': hasError
      }"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <div class="upload-icon">
          <el-icon :size="48" color="#c0c4cc">
            <UploadFilled />
          </el-icon>
        </div>
        <div class="upload-text">
          <h4>{{ uploadText }}</h4>
          <p class="upload-hint">{{ hintText }}</p>
        </div>
        <el-button v-if="showButton" type="primary" :disabled="disabled">
          选择文件
        </el-button>
      </div>
      
      <!-- 隐藏的文件输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div
        v-for="(file, index) in fileList"
        :key="file.uid"
        class="file-item"
        :class="{
          'file-item-success': file.status === 'success',
          'file-item-error': file.status === 'error',
          'file-item-uploading': file.status === 'uploading'
        }"
      >
        <div class="file-info">
          <div class="file-icon">
            <el-icon>
              <Document v-if="isDocument(file)" />
              <Picture v-else-if="isImage(file)" />
              <VideoPlay v-else-if="isVideo(file)" />
              <Headset v-else-if="isAudio(file)" />
              <Files v-else />
            </el-icon>
          </div>
          <div class="file-details">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>

        <!-- 上传进度 -->
        <div v-if="file.status === 'uploading'" class="file-progress">
          <el-progress
            :percentage="file.progress || 0"
            :stroke-width="4"
            :show-text="false"
          />
          <span class="progress-text">{{ file.progress || 0 }}%</span>
        </div>

        <!-- 状态图标 -->
        <div class="file-status">
          <el-icon
            v-if="file.status === 'success'"
            color="#67c23a"
            :size="16"
          >
            <CircleCheckFilled />
          </el-icon>
          <el-icon
            v-else-if="file.status === 'error'"
            color="#f56c6c"
            :size="16"
          >
            <CircleCloseFilled />
          </el-icon>
          <el-icon
            v-else-if="file.status === 'uploading'"
            color="#409eff"
            :size="16"
            class="rotating"
          >
            <Loading />
          </el-icon>
        </div>

        <!-- 操作按钮 -->
        <div class="file-actions">
          <el-button
            v-if="file.status !== 'uploading'"
            type="text"
            size="small"
            @click="handlePreview(file)"
          >
            预览
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="handleRemove(index)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 上传提示信息 -->
    <div v-if="errorMessage" class="upload-error">
      <el-icon color="#f56c6c"><WarningFilled /></el-icon>
      {{ errorMessage }}
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文件预览"
      width="80%"
      :close-on-click-modal="true"
    >
      <div class="preview-content">
        <img
          v-if="previewFile && isImage(previewFile)"
          :src="previewFile.url"
          :alt="previewFile.name"
          class="preview-image"
        />
        <div v-else class="preview-placeholder">
          <el-icon :size="64" color="#c0c4cc">
            <Document />
          </el-icon>
          <p>{{ previewFile?.name }}</p>
          <p class="preview-hint">此文件类型不支持预览</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  Document,
  Picture,
  VideoPlay,
  Headset,
  Files,
  CircleCheckFilled,
  CircleCloseFilled,
  Loading,
  WarningFilled
} from '@element-plus/icons-vue'

interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
  url?: string
  raw?: File
  response?: any
  error?: string
}

interface Props {
  /** 是否支持多文件上传 */
  multiple?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 最大文件数量 */
  maxCount?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 上传提示文本 */
  uploadText?: string
  /** 提示文本 */
  hintText?: string
  /** 是否显示上传按钮 */
  showButton?: boolean
  /** 自动上传 */
  autoUpload?: boolean
  /** 文件列表 */
  fileList?: UploadFile[]
}

interface Emits {
  (e: 'change', fileList: UploadFile[]): void
  (e: 'upload', file: UploadFile): Promise<any>
  (e: 'remove', file: UploadFile, index: number): void
  (e: 'preview', file: UploadFile): void
  (e: 'error', error: string, file?: File): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: '*',
  maxSize: 10,
  maxCount: 1,
  disabled: false,
  uploadText: '拖拽文件到此处或点击上传',
  showButton: true,
  autoUpload: true,
  fileList: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const fileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const errorMessage = ref('')
const previewVisible = ref(false)
const previewFile = ref<UploadFile | null>(null)
const internalFileList = ref<UploadFile[]>([...props.fileList])

// 计算属性
const fileList = computed(() => internalFileList.value)

const hasError = computed(() => !!errorMessage.value)

const hintText = computed(() => {
  if (props.hintText) return props.hintText
  
  const acceptText = props.accept === '*' ? '所有格式' : props.accept
  const sizeText = `最大 ${props.maxSize}MB`
  const countText = props.multiple ? `最多 ${props.maxCount} 个文件` : '单个文件'
  
  return `支持 ${acceptText}，${sizeText}，${countText}`
})

// 文件类型判断
const isImage = (file: UploadFile) => {
  return file.type.startsWith('image/')
}

const isDocument = (file: UploadFile) => {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
  return docTypes.includes(file.type)
}

const isVideo = (file: UploadFile) => {
  return file.type.startsWith('video/')
}

const isAudio = (file: UploadFile) => {
  return file.type.startsWith('audio/')
}

// 工具函数
const formatFileSize = (size: number): string => {
  if (size === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  
  return `${parseFloat((size / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const generateUID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 文件验证
const validateFile = (file: File): string | null => {
  // 检查文件类型
  if (props.accept !== '*') {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const isAccepted = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      } else {
        return file.type.match(type.replace('*', '.*'))
      }
    })
    
    if (!isAccepted) {
      return `不支持的文件类型: ${file.type}`
    }
  }
  
  // 检查文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    return `文件大小不能超过 ${props.maxSize}MB`
  }
  
  // 检查文件数量
  if (!props.multiple && internalFileList.value.length >= 1) {
    return '只能上传一个文件'
  }
  
  if (props.multiple && internalFileList.value.length >= props.maxCount) {
    return `最多只能上传 ${props.maxCount} 个文件`
  }
  
  return null
}

// 事件处理
const handleClick = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

const handleDragOver = (e: DragEvent) => {
  if (props.disabled) return
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  if (props.disabled) return
  
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
  
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

const processFiles = (files: File[]) => {
  errorMessage.value = ''
  
  if (!props.multiple && files.length > 1) {
    errorMessage.value = '只能选择一个文件'
    emit('error', errorMessage.value)
    return
  }
  
  const validFiles: File[] = []
  
  for (const file of files) {
    const error = validateFile(file)
    if (error) {
      errorMessage.value = error
      emit('error', error, file)
      return
    }
    validFiles.push(file)
  }
  
  // 如果是单文件上传，清空现有文件
  if (!props.multiple) {
    internalFileList.value = []
  }
  
  // 添加文件到列表
  for (const file of validFiles) {
    const uploadFile: UploadFile = {
      uid: generateUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      raw: file
    }
    
    // 如果是图片，生成预览URL
    if (isImage(uploadFile)) {
      uploadFile.url = URL.createObjectURL(file)
    }
    
    internalFileList.value.push(uploadFile)
    
    // 自动上传
    if (props.autoUpload) {
      uploadFile.status = 'uploading'
      uploadFile.progress = 0
      handleUpload(uploadFile)
    }
  }
  
  emit('change', [...internalFileList.value])
}

const handleUpload = async (file: UploadFile) => {
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (file.progress! < 90) {
        file.progress = (file.progress || 0) + Math.random() * 30
      }
    }, 200)
    
    // 调用上传方法
    const response = await emit('upload', file)
    
    clearInterval(progressInterval)
    file.progress = 100
    file.status = 'success'
    file.response = response
    
    ElMessage.success(`${file.name} 上传成功`)
    
  } catch (error) {
    file.status = 'error'
    file.error = error.message || '上传失败'
    ElMessage.error(`${file.name} 上传失败: ${file.error}`)
  }
}

const handleRemove = (index: number) => {
  const file = internalFileList.value[index]
  
  // 释放预览URL
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
  
  internalFileList.value.splice(index, 1)
  emit('remove', file, index)
  emit('change', [...internalFileList.value])
  
  // 清空错误信息
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const handlePreview = (file: UploadFile) => {
  previewFile.value = file
  previewVisible.value = true
  emit('preview', file)
}

// 监听外部文件列表变化
watch(() => props.fileList, (newFileList) => {
  internalFileList.value = [...newFileList]
}, { deep: true })

// 暴露方法
const clearFiles = () => {
  internalFileList.value.forEach(file => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
  internalFileList.value = []
  errorMessage.value = ''
  emit('change', [])
}

const uploadFiles = () => {
  const readyFiles = internalFileList.value.filter(file => file.status === 'ready')
  readyFiles.forEach(file => {
    file.status = 'uploading'
    file.progress = 0
    handleUpload(file)
  })
}

defineExpose({
  clearFiles,
  uploadFiles
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.upload-area:hover:not(.upload-area-disabled) {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-area-dragover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-area-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-area-error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text h4 {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.file-list {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f5f7fa;
}

.file-item-success {
  background: #f0f9ff;
}

.file-item-error {
  background: #fef0f0;
}

.file-item-uploading {
  background: #f0f9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  flex-shrink: 0;
  color: #909399;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px;
  min-width: 120px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.file-status {
  margin: 0 16px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.upload-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-content {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.preview-placeholder {
  padding: 40px;
  color: #909399;
}

.preview-placeholder p {
  margin: 8px 0;
}

.preview-hint {
  font-size: 14px;
  color: #c0c4cc;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-area {
    padding: 20px 16px;
  }
  
  .file-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .file-info {
    order: 1;
  }
  
  .file-progress {
    order: 2;
    margin: 0;
  }
  
  .file-status {
    order: 3;
    margin: 0;
    align-self: center;
  }
  
  .file-actions {
    order: 4;
    justify-content: center;
  }
}
</style>