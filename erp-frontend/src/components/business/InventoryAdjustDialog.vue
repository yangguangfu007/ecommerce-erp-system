<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '库存调整' : '批量库存调整'"
    :width="isEdit ? '600px' : '800px'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 单个商品调整 -->
    <div v-if="isEdit" class="adjust-content">
      <div class="product-info-section">
        <h4 class="section-title">商品信息</h4>
        <div class="product-card">
          <div class="product-image">
            <img 
              :src="currentInventory?.productImage || placeholderImage" 
              :alt="currentInventory?.productName"
              @error="handleImageError"
            />
          </div>
          <div class="product-details">
            <div class="product-name">{{ currentInventory?.productName }}</div>
            <div class="product-sku">SKU: {{ currentInventory?.sku }}</div>
            <div class="product-location" v-if="currentInventory?.warehouseLocation">
              位置: {{ currentInventory.warehouseLocation }}
            </div>
          </div>
          <div class="current-stock">
            <div class="stock-label">当前库存</div>
            <div class="stock-value">{{ currentInventory?.availableQuantity || 0 }}</div>
          </div>
        </div>
      </div>

      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="120px"
        class="adjust-form"
      >
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="adjustForm.type" @change="handleTypeChange">
            <el-radio-button value="IN">
              <i class="fas fa-plus"></i> 入库
            </el-radio-button>
            <el-radio-button value="OUT">
              <i class="fas fa-minus"></i> 出库
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="调整数量" prop="quantity">
          <el-input-number
            v-model="adjustForm.quantity"
            :min="1"
            :max="getMaxQuantity()"
            :precision="0"
            controls-position="right"
            placeholder="请输入调整数量"
            style="width: 200px"
          />
          <span class="quantity-hint">
            {{ adjustForm.type === 'OUT' ? `最多可出库 ${currentInventory?.availableQuantity || 0}` : '' }}
          </span>
        </el-form-item>

        <el-form-item label="调整原因" prop="reason">
          <el-select 
            v-model="adjustForm.reason" 
            placeholder="请选择调整原因"
            style="width: 300px"
          >
            <el-option-group
              v-for="group in reasonOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="option in group.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="参考单号" prop="referenceNumber">
          <el-input
            v-model="adjustForm.referenceNumber"
            placeholder="请输入相关单据号（可选）"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="调整说明" prop="note">
          <el-input
            v-model="adjustForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入调整说明（必填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 调整预览 -->
        <el-form-item label="调整预览">
          <div class="adjustment-preview">
            <div class="preview-item">
              <span class="preview-label">调整前库存:</span>
              <span class="preview-value">{{ currentInventory?.availableQuantity || 0 }}</span>
            </div>
            <div class="preview-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="preview-item">
              <span class="preview-label">调整后库存:</span>
              <span class="preview-value" :class="getPreviewClass()">
                {{ getAdjustedQuantity() }}
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批量调整 -->
    <div v-else class="batch-adjust-content">
      <div class="selected-items-section">
        <h4 class="section-title">
          已选择商品 ({{ selectedItems.length }})
          <el-button 
            type="text" 
            size="small" 
            @click="showItemDetails = !showItemDetails"
          >
            {{ showItemDetails ? '收起' : '展开' }}
            <i :class="showItemDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </el-button>
        </h4>
        
        <div v-show="showItemDetails" class="items-list">
          <div class="items-header">
            <span class="header-name">商品名称</span>
            <span class="header-sku">SKU</span>
            <span class="header-stock">当前库存</span>
            <span class="header-preview">调整后</span>
          </div>
          <div class="items-body">
            <div 
              v-for="item in selectedItems" 
              :key="item.id"
              class="item-row"
            >
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-sku">{{ item.sku }}</span>
              <span class="item-stock">{{ item.availableQuantity }}</span>
              <span class="item-preview" :class="getBatchPreviewClass(item)">
                {{ getBatchAdjustedQuantity(item) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <el-form
        ref="batchAdjustFormRef"
        :model="batchAdjustForm"
        :rules="batchAdjustRules"
        label-width="120px"
        class="batch-adjust-form"
      >
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="batchAdjustForm.type">
            <el-radio-button value="IN">
              <i class="fas fa-plus"></i> 批量入库
            </el-radio-button>
            <el-radio-button value="OUT">
              <i class="fas fa-minus"></i> 批量出库
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="调整数量" prop="quantity">
          <el-input-number
            v-model="batchAdjustForm.quantity"
            :min="1"
            :max="9999"
            :precision="0"
            controls-position="right"
            placeholder="请输入调整数量"
            style="width: 200px"
          />
          <span class="quantity-hint">
            此数量将应用于所有选中商品
          </span>
        </el-form-item>

        <el-form-item label="调整原因" prop="reason">
          <el-select 
            v-model="batchAdjustForm.reason" 
            placeholder="请选择调整原因"
            style="width: 300px"
          >
            <el-option-group
              v-for="group in reasonOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="option in group.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="参考单号" prop="referenceNumber">
          <el-input
            v-model="batchAdjustForm.referenceNumber"
            placeholder="请输入相关单据号（可选）"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="调整说明" prop="note">
          <el-input
            v-model="batchAdjustForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入调整说明（必填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="loading"
        >
          确认调整
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Inventory, InventoryAdjustment } from '@/types/inventory'

// Props
interface Props {
  modelValue: boolean
  currentInventory?: Inventory | null
  selectedItems?: Inventory[]
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentInventory: null,
  selectedItems: () => [],
  isEdit: true
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: InventoryAdjustment | { items: Array<{ id: string; adjustment: InventoryAdjustment }> }): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const showItemDetails = ref(false)
const adjustFormRef = ref<FormInstance>()
const batchAdjustFormRef = ref<FormInstance>()

// 单个调整表单
const adjustForm = reactive<InventoryAdjustment & { referenceNumber?: string }>({
  type: 'IN',
  quantity: 1,
  reason: 'OTHER',
  note: '',
  referenceNumber: ''
})

// 批量调整表单
const batchAdjustForm = reactive<InventoryAdjustment & { referenceNumber?: string }>({
  type: 'IN',
  quantity: 1,
  reason: 'OTHER',
  note: '',
  referenceNumber: ''
})

// 调整原因选项
const reasonOptions = [
  {
    label: '入库原因',
    options: [
      { label: '采购入库', value: 'PURCHASE' },
      { label: '退货入库', value: 'RETURN' },
      { label: '调拨入库', value: 'TRANSFER' },
      { label: '盘点调整', value: 'STOCKTAKING' }
    ]
  },
  {
    label: '出库原因',
    options: [
      { label: '销售出库', value: 'SALE' },
      { label: '损坏出库', value: 'DAMAGE' },
      { label: '调拨出库', value: 'TRANSFER' },
      { label: '盘点调整', value: 'STOCKTAKING' }
    ]
  },
  {
    label: '其他原因',
    options: [
      { label: '其他', value: 'OTHER' }
    ]
  }
]

// 表单验证规则
const adjustRules: FormRules = {
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数量必须大于0', trigger: 'blur' }
  ],
  reason: [{ required: true, message: '请选择调整原因', trigger: 'change' }],
  note: [{ required: true, message: '请输入调整说明', trigger: 'blur' }]
}

const batchAdjustRules: FormRules = {
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数量必须大于0', trigger: 'blur' }
  ],
  reason: [{ required: true, message: '请选择调整原因', trigger: 'change' }],
  note: [{ required: true, message: '请输入调整说明', trigger: 'blur' }]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 方法
const getMaxQuantity = () => {
  if (adjustForm.type === 'OUT') {
    return props.currentInventory?.availableQuantity || 0
  }
  return 9999
}

const getAdjustedQuantity = () => {
  const current = props.currentInventory?.availableQuantity || 0
  const quantity = adjustForm.quantity || 0
  
  if (adjustForm.type === 'IN') {
    return current + quantity
  } else {
    return Math.max(0, current - quantity)
  }
}

const getBatchAdjustedQuantity = (item: Inventory) => {
  const current = item.availableQuantity
  const quantity = batchAdjustForm.quantity || 0
  
  if (batchAdjustForm.type === 'IN') {
    return current + quantity
  } else {
    return Math.max(0, current - quantity)
  }
}

const getPreviewClass = () => {
  const adjusted = getAdjustedQuantity()
  const current = props.currentInventory?.availableQuantity || 0
  
  if (adjusted > current) {
    return 'preview-increase'
  } else if (adjusted < current) {
    return 'preview-decrease'
  }
  return ''
}

const getBatchPreviewClass = (item: Inventory) => {
  const adjusted = getBatchAdjustedQuantity(item)
  const current = item.availableQuantity
  
  if (adjusted > current) {
    return 'preview-increase'
  } else if (adjusted < current) {
    return 'preview-decrease'
  }
  return ''
}

const handleTypeChange = () => {
  // 当调整类型改变时，重置数量
  adjustForm.quantity = 1
}

// 创建一个简单的占位符图片 data URL
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjUiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTMwIDYwTDQ1IDQ1TDU1IDU1TDcwIDQwVjcwSDMwVjYwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K'

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = placeholderImage
}

const handleClose = () => {
  visible.value = false
  resetForms()
}

const resetForms = () => {
  Object.assign(adjustForm, {
    type: 'IN',
    quantity: 1,
    reason: 'OTHER',
    note: '',
    referenceNumber: ''
  })
  
  Object.assign(batchAdjustForm, {
    type: 'IN',
    quantity: 1,
    reason: 'OTHER',
    note: '',
    referenceNumber: ''
  })
  
  showItemDetails.value = false
  
  // 清除表单验证
  adjustFormRef.value?.clearValidate()
  batchAdjustFormRef.value?.clearValidate()
}

const handleConfirm = async () => {
  try {
    if (props.isEdit) {
      await handleSingleAdjust()
    } else {
      await handleBatchAdjust()
    }
  } catch (error) {
    // 验证失败或用户取消，不做处理
  }
}

const handleSingleAdjust = async () => {
  if (!adjustFormRef.value) return
  
  await adjustFormRef.value.validate()
  
  // 检查出库数量
  if (adjustForm.type === 'OUT') {
    const available = props.currentInventory?.availableQuantity || 0
    if (adjustForm.quantity > available) {
      ElMessage.error(`出库数量不能超过可用库存 ${available}`)
      return
    }
  }
  
  const confirmText = `确认${adjustForm.type === 'IN' ? '入库' : '出库'} ${adjustForm.quantity} 件商品吗？`
  
  await ElMessageBox.confirm(confirmText, '确认库存调整', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  
  try {
    const adjustmentData: InventoryAdjustment = {
      type: adjustForm.type,
      quantity: adjustForm.quantity,
      reason: adjustForm.reason,
      note: adjustForm.note
    }
    
    if (adjustForm.referenceNumber) {
      adjustmentData.referenceNumber = adjustForm.referenceNumber
    }
    
    emit('confirm', adjustmentData)
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleBatchAdjust = async () => {
  if (!batchAdjustFormRef.value) return
  
  await batchAdjustFormRef.value.validate()
  
  // 检查批量出库
  if (batchAdjustForm.type === 'OUT') {
    const insufficientItems = props.selectedItems.filter(
      item => item.availableQuantity < batchAdjustForm.quantity
    )
    
    if (insufficientItems.length > 0) {
      const itemNames = insufficientItems.map(item => item.productName).join('、')
      ElMessage.error(`以下商品库存不足：${itemNames}`)
      return
    }
  }
  
  const confirmText = `确认对 ${props.selectedItems.length} 个商品进行批量${batchAdjustForm.type === 'IN' ? '入库' : '出库'}吗？`
  
  await ElMessageBox.confirm(confirmText, '确认批量调整', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  
  try {
    const adjustmentData: InventoryAdjustment = {
      type: batchAdjustForm.type,
      quantity: batchAdjustForm.quantity,
      reason: batchAdjustForm.reason,
      note: batchAdjustForm.note
    }
    
    if (batchAdjustForm.referenceNumber) {
      adjustmentData.referenceNumber = batchAdjustForm.referenceNumber
    }
    
    const batchData = {
      items: props.selectedItems.map(item => ({
        id: item.id,
        adjustment: adjustmentData
      }))
    }
    
    emit('confirm', batchData)
    visible.value = false
  } finally {
    loading.value = false
  }
}

// 监听对话框打开，重置表单
watch(visible, (newVal) => {
  if (newVal) {
    resetForms()
  }
})
</script>

<style scoped>
.adjust-content {
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.product-info-section {
  margin-bottom: 24px;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  gap: 16px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  border: 1px solid var(--el-border-color-light);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.product-sku {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 2px;
}

.product-location {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.current-stock {
  text-align: center;
}

.stock-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.stock-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.adjust-form {
  margin-top: 8px;
}

.quantity-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.adjustment-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.preview-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.preview-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.preview-value.preview-increase {
  color: var(--el-color-success);
}

.preview-value.preview-decrease {
  color: var(--el-color-warning);
}

.preview-arrow {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.batch-adjust-content {
  padding: 0 4px;
}

.selected-items-section {
  margin-bottom: 24px;
}

.items-list {
  margin-top: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.items-body {
  max-height: 200px;
  overflow-y: auto;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 14px;
}

.item-row:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-sku {
  color: var(--el-text-color-regular);
}

.item-stock {
  color: var(--el-text-color-primary);
  text-align: center;
}

.item-preview {
  font-weight: 600;
  text-align: center;
}

.item-preview.preview-increase {
  color: var(--el-color-success);
}

.item-preview.preview-decrease {
  color: var(--el-color-warning);
}

.batch-adjust-form {
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    text-align: center;
  }
  
  .adjustment-preview {
    flex-direction: column;
    gap: 8px;
  }
  
  .items-header,
  .item-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .items-header {
    display: none;
  }
  
  .item-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>