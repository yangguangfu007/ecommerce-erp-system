<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑商品' : '新增商品'"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
    class="product-form-dialog"
  >
    <!-- 表单步骤指示器 -->
    <div class="form-steps">
      <div 
        v-for="(step, index) in formSteps" 
        :key="index"
        :class="['form-step', { 
          'active': currentStep === index + 1,
          'completed': currentStep > index + 1 
        }]"
      >
        <div class="step-indicator">{{ index + 1 }}</div>
        <div class="step-title">{{ step.title }}</div>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="product-form"
      @validate="handleFieldValidate"
    >
      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 1" class="form-section">
        <h4 class="section-title">
          <i class="fas fa-info-circle"></i>
          基本信息
        </h4>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品SKU" prop="sku" class="required-field">
              <el-input
                v-model="formData.sku"
                placeholder="请输入商品SKU，如：PHONE001"
                :disabled="isEditing"
                maxlength="50"
                show-word-limit
                clearable
              >
                <template #prefix>
                  <i class="fas fa-barcode"></i>
                </template>
              </el-input>
              <div class="field-help">SKU是商品的唯一标识，只能包含字母、数字和短横线</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name" class="required-field">
              <el-input
                v-model="formData.name"
                placeholder="请输入商品名称"
                maxlength="100"
                show-word-limit
                clearable
              >
                <template #prefix>
                  <i class="fas fa-tag"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId" class="required-field">
              <el-select
                v-model="formData.categoryId"
                placeholder="请选择商品分类"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="category in categories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                >
                  <span style="float: left">{{ category.label }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    {{ category.count || 0 }}个商品
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品品牌" prop="brand">
              <el-input
                v-model="formData.brand"
                placeholder="请输入商品品牌"
                clearable
              >
                <template #prefix>
                  <i class="fas fa-copyright"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price" class="required-field">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :max="999999.99"
                :precision="2"
                placeholder="0.00"
                style="width: 100%"
                controls-position="right"
              />
              <div class="field-help">建议零售价格，用于平台展示</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本价格" prop="costPrice">
              <el-input-number
                v-model="formData.costPrice"
                :min="0"
                :max="999999.99"
                :precision="2"
                placeholder="0.00"
                style="width: 100%"
                controls-position="right"
              />
              <div class="field-help">商品采购成本，用于利润计算</div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock" class="required-field">
              <el-input-number
                v-model="formData.stock"
                :min="0"
                :max="999999"
                placeholder="0"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品状态" prop="status" class="required-field">
              <el-select
                v-model="formData.status"
                placeholder="请选择商品状态"
                style="width: 100%"
              >
                <el-option label="上架销售" value="ACTIVE">
                  <span style="color: var(--el-color-success)">
                    <i class="fas fa-check-circle"></i> 上架销售
                  </span>
                </el-option>
                <el-option label="暂时下架" value="INACTIVE">
                  <span style="color: var(--el-color-warning)">
                    <i class="fas fa-pause-circle"></i> 暂时下架
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品详细描述，包括特点、规格、使用说明等"
            maxlength="1000"
            show-word-limit
            resize="vertical"
          />
        </el-form-item>
      </div>

      <!-- 步骤2: 商品图片 -->
      <div v-show="currentStep === 2" class="form-section">
        <h4 class="section-title">
          <i class="fas fa-images"></i>
          商品图片
        </h4>
        
        <el-form-item label="商品图片" prop="images" class="required-field">
          <el-upload
            v-model:file-list="uploadFileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="8"
            accept="image/*"
            multiple
            @change="handleImageChange"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            <p>上传说明：支持 JPG、PNG、WEBP 格式，单张图片不超过 10MB，最多上传8张图片</p>
          </div>
        </el-form-item>

        <!-- 图片预览和排序 -->
        <div v-if="formData.images && formData.images.length > 0" class="image-preview-section">
          <h5>图片预览与排序</h5>
          <div class="image-preview-list">
            <div
              v-for="(image, index) in formData.images"
              :key="index"
              class="image-preview-item"
              :class="{ 'is-main': index === 0 }"
            >
              <img :src="image" :alt="`商品图片${index + 1}`" />
              <div class="image-overlay">
                <div class="image-actions">
                  <el-button
                    v-if="index > 0"
                    size="small"
                    type="primary"
                    @click="moveImageUp(index)"
                  >
                    <i class="fas fa-arrow-up"></i>
                  </el-button>
                  <el-button
                    v-if="index < formData.images.length - 1"
                    size="small"
                    type="primary"
                    @click="moveImageDown(index)"
                  >
                    <i class="fas fa-arrow-down"></i>
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="removeImage(index)"
                  >
                    <i class="fas fa-trash"></i>
                  </el-button>
                </div>
              </div>
              <div v-if="index === 0" class="main-image-badge">主图</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: 商品属性 -->
      <div v-show="currentStep === 3" class="form-section">
        <h4 class="section-title">
          <i class="fas fa-list-ul"></i>
          商品属性
        </h4>
        
        <!-- 基础属性 -->
        <div class="basic-attributes">
          <h5>基础属性</h5>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="商品重量" prop="weight">
                <el-input-number
                  v-model="formData.weight"
                  :min="0"
                  :precision="2"
                  placeholder="0.00"
                  style="width: 100%"
                  controls-position="right"
                />
                <div class="field-help">单位：千克(kg)</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品尺寸" prop="dimensions">
                <el-input
                  v-model="formData.dimensions"
                  placeholder="长x宽x高，如：20x15x5"
                  clearable
                />
                <div class="field-help">单位：厘米(cm)</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品颜色" prop="color">
                <el-input
                  v-model="formData.color"
                  placeholder="请输入商品颜色"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 动态属性 -->
        <div class="dynamic-attributes">
          <div class="attributes-header">
            <h5>自定义属性</h5>
            <el-button
              type="primary"
              size="small"
              @click="addDynamicAttribute"
            >
              <i class="fas fa-plus"></i>
              添加属性
            </el-button>
          </div>
          
          <div v-if="dynamicAttributes.length === 0" class="empty-attributes">
            <i class="fas fa-info-circle"></i>
            <p>暂无自定义属性，点击"添加属性"按钮添加商品特有属性</p>
          </div>
          
          <div
            v-for="(attr, index) in dynamicAttributes"
            :key="index"
            class="dynamic-attribute-item"
          >
            <el-row :gutter="20" align="middle">
              <el-col :span="10">
                <el-input
                  v-model="attr.name"
                  placeholder="属性名称，如：材质、产地等"
                  clearable
                />
              </el-col>
              <el-col :span="10">
                <el-input
                  v-model="attr.value"
                  placeholder="属性值，如：不锈钢、中国等"
                  clearable
                />
              </el-col>
              <el-col :span="4">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeDynamicAttribute(index)"
                >
                  <i class="fas fa-trash"></i>
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 表单导航按钮 -->
    <template #footer>
      <div class="form-footer">
        <div class="footer-left">
          <el-button
            v-if="currentStep > 1"
            @click="previousStep"
            :disabled="submitting"
          >
            <i class="fas fa-arrow-left"></i>
            上一步
          </el-button>
        </div>
        
        <div class="footer-right">
          <el-button @click="handleClose" :disabled="submitting">
            取消
          </el-button>
          
          <el-button
            v-if="currentStep < formSteps.length"
            type="primary"
            @click="nextStep"
            :disabled="submitting"
          >
            下一步
            <i class="fas fa-arrow-right"></i>
          </el-button>
          
          <el-button
            v-else
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
          >
            <i class="fas fa-save"></i>
            {{ isEditing ? '更新商品' : '保存商品' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
// import FileUpload from '@/components/business/FileUpload.vue'
import type { Product, CreateProductForm, UpdateProductForm } from '@/types'

/**
 * 商品表单模态框组件
 * 参考HTML原型中的表单组件样式和交互模式
 * 支持分步骤表单、图片上传、动态属性配置等功能
 */

// Props 定义
interface Props {
  visible: boolean
  product?: Product | null
}

// Emits 定义
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  product: null
})

const emit = defineEmits<Emits>()

// 状态管理
const productStore = useProductStore()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentStep = ref(1)
const uploadFileList = ref<any[]>([])

// 表单步骤配置
const formSteps = [
  { title: '基本信息', icon: 'fas fa-info-circle' },
  { title: '商品图片', icon: 'fas fa-images' },
  { title: '商品属性', icon: 'fas fa-list-ul' }
]

// 商品分类选项
const categories = ref([
  { label: '手机数码', value: 1, count: 156 },
  { label: '电脑办公', value: 2, count: 89 },
  { label: '游戏娱乐', value: 3, count: 67 },
  { label: '摄影摄像', value: 4, count: 45 },
  { label: '家用电器', value: 5, count: 123 },
  { label: '服装鞋帽', value: 6, count: 234 },
  { label: '美妆护肤', value: 7, count: 178 },
  { label: '母婴用品', value: 8, count: 98 }
])

// 动态属性接口
interface DynamicAttribute {
  name: string
  value: string
}

const dynamicAttributes = ref<DynamicAttribute[]>([])

// 表单数据
const formData = reactive<CreateProductForm>({
  sku: '',
  name: '',
  description: '',
  categoryId: undefined,
  brand: '',
  price: 0,
  costPrice: 0,
  weight: 0,
  dimensions: '',
  stock: 0,
  status: 'ACTIVE',
  images: [],
  attributes: {}
})

// 表单验证规则 - 参考HTML原型的验证样式
const formRules: FormRules = {
  sku: [
    { required: true, message: 'SKU不能为空', trigger: 'blur' },
    { min: 3, max: 50, message: 'SKU长度应在3-50个字符之间', trigger: 'blur' },
    { pattern: /^[A-Z0-9\-_]+$/, message: 'SKU只能包含大写字母、数字、短横线和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '商品名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度应在2-100个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, max: 999999.99, message: '价格应在0.01-999999.99之间', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, max: 999999, message: '库存数量应在0-999999之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ],
  images: [
    { 
      required: true, 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少上传一张商品图片'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  weight: [
    { type: 'number', min: 0, max: 999.99, message: '重量应在0-999.99kg之间', trigger: 'blur' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEditing = computed(() => !!props.product)

// 监听器
watch(() => props.visible, (visible) => {
  if (visible) {
    initForm()
  } else {
    resetForm()
  }
})

watch(() => props.product, (product) => {
  if (product && props.visible) {
    initForm()
  }
})

// 方法定义

/**
 * 初始化表单
 */
const initForm = async () => {
  await nextTick()
  currentStep.value = 1
  
  if (props.product) {
    // 编辑模式，填充现有数据
    Object.assign(formData, {
      sku: props.product.sku,
      name: props.product.name,
      description: props.product.description || '',
      categoryId: props.product.categoryId,
      brand: props.product.brand || '',
      price: props.product.price,
      costPrice: props.product.costPrice || 0,
      weight: props.product.weight || 0,
      dimensions: props.product.dimensions || '',
      stock: props.product.stock || 0,
      status: props.product.status,
      images: props.product.images || [],
      attributes: {}
    })
    
    // 填充动态属性
    dynamicAttributes.value = []
    if (props.product.attributes) {
      Object.entries(props.product.attributes).forEach(([key, value]) => {
        if (key !== 'brand' && key !== 'color' && key !== 'weight' && key !== 'dimensions' && value) {
          dynamicAttributes.value.push({ name: key, value: String(value) })
        }
      })
    }
  } else {
    // 新增模式，重置表单
    resetForm()
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  currentStep.value = 1
  
  Object.assign(formData, {
    sku: '',
    name: '',
    description: '',
    categoryId: undefined,
    brand: '',
    price: 0,
    costPrice: 0,
    weight: 0,
    dimensions: '',
    stock: 0,
    status: 'ACTIVE',
    images: [],
    attributes: {}
  })
  
  dynamicAttributes.value = []
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

/**
 * 下一步
 */
const nextStep = async () => {
  if (!formRef.value) return
  
  try {
    // 根据当前步骤验证对应字段
    const fieldsToValidate = getStepFields(currentStep.value)
    await formRef.value.validateField(fieldsToValidate)
    
    if (currentStep.value < formSteps.length) {
      currentStep.value++
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请完善当前步骤的必填信息')
  }
}

/**
 * 上一步
 */
const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

/**
 * 获取步骤对应的验证字段
 */
const getStepFields = (step: number): string[] => {
  switch (step) {
    case 1:
      return ['sku', 'title', 'categoryId', 'price', 'stock', 'status']
    case 2:
      return ['images']
    case 3:
      return []
    default:
      return []
  }
}

/**
 * 处理字段验证
 */
const handleFieldValidate = (prop: string, isValid: boolean, message: string) => {
  // 可以在这里添加实时验证反馈逻辑
  if (!isValid && message) {
    console.log(`字段 ${prop} 验证失败: ${message}`)
  }
}

/**
 * 添加动态属性
 */
const addDynamicAttribute = () => {
  dynamicAttributes.value.push({ name: '', value: '' })
}

/**
 * 移除动态属性
 */
const removeDynamicAttribute = (index: number) => {
  dynamicAttributes.value.splice(index, 1)
}

/**
 * 移动图片位置 - 向上
 */
const moveImageUp = (index: number) => {
  if (index > 0) {
    const images = [...formData.images]
    const temp = images[index]
    images[index] = images[index - 1]
    images[index - 1] = temp
    formData.images = images
  }
}

/**
 * 移动图片位置 - 向下
 */
const moveImageDown = (index: number) => {
  if (index < formData.images.length - 1) {
    const images = [...formData.images]
    const temp = images[index]
    images[index] = images[index + 1]
    images[index + 1] = temp
    formData.images = images
  }
}

/**
 * 移除图片
 */
const removeImage = (index: number) => {
  formData.images.splice(index, 1)
}

/**
 * 处理图片上传变化
 */
const handleImageChange = (uploadFile: any, uploadFiles: any[]) => {
  formData.images = uploadFiles.map(file => {
    if (file.raw) {
      return URL.createObjectURL(file.raw)
    }
    return file.url || ''
  }).filter(Boolean)
}

/**
 * 处理关闭
 */
const handleClose = () => {
  if (!submitting.value) {
    dialogVisible.value = false
  }
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 完整表单验证
    await formRef.value.validate()
    
    // 验证动态属性
    for (const attr of dynamicAttributes.value) {
      if (attr.name.trim() && !attr.value.trim()) {
        ElMessage.warning(`属性"${attr.name}"的值不能为空`)
        return
      }
      if (!attr.name.trim() && attr.value.trim()) {
        ElMessage.warning('属性名称不能为空')
        return
      }
    }
    
    // 验证图片
    if (!formData.images || formData.images.length === 0) {
      ElMessage.warning('请至少上传一张商品图片')
      currentStep.value = 2
      return
    }
    
    submitting.value = true
    
    // 合并所有属性
    const attributes: Record<string, any> = {
      brand: formData.brand,
      weight: formData.weight,
      dimensions: formData.dimensions,
      color: formData.color || ''
    }
    
    // 添加动态属性
    dynamicAttributes.value.forEach(attr => {
      if (attr.name.trim() && attr.value.trim()) {
        attributes[attr.name.trim()] = attr.value.trim()
      }
    })
    
    if (isEditing.value && props.product) {
      // 更新商品
      const updateData: UpdateProductForm = {
        id: props.product.id,
        ...formData,
        attributes
      }
      
      await productStore.updateProduct(updateData)
      ElMessage.success('商品更新成功')
    } else {
      // 创建商品
      const createData: CreateProductForm = {
        ...formData,
        attributes
      }
      
      await productStore.createProduct(createData)
      ElMessage.success('商品创建成功')
    }
    
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存商品失败:', error)
    ElMessage.error('保存商品失败，请检查表单信息')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 参考HTML原型的表单组件样式 */
.product-form-dialog {
  --form-primary-color: #409EFF;
  --form-success-color: #67C23A;
  --form-warning-color: #E6A23C;
  --form-danger-color: #F56C6C;
  --form-text-primary: #303133;
  --form-text-regular: #606266;
  --form-text-secondary: #909399;
  --form-border-base: #DCDFE6;
  --form-border-light: #E4E7ED;
  --form-bg-primary: #FFFFFF;
  --form-bg-secondary: #F5F7FA;
}

/* 表单步骤指示器 - 参考HTML原型的步骤组件 */
.form-steps {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px;
  position: relative;
}

.form-step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.form-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 2px;
  background: var(--form-border-light);
  z-index: 1;
}

.form-step.completed::after {
  background: var(--form-success-color);
}

.form-step.active::after {
  background: linear-gradient(to right, var(--form-primary-color) 50%, var(--form-border-light) 50%);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--form-bg-secondary);
  border: 2px solid var(--form-border-base);
  color: var(--form-text-secondary);
  font-size: 14px;
  font-weight: 500;
  z-index: 2;
  position: relative;
  transition: all 0.3s ease;
}

.form-step.completed .step-indicator {
  background: var(--form-success-color);
  border-color: var(--form-success-color);
  color: white;
}

.form-step.active .step-indicator {
  background: var(--form-primary-color);
  border-color: var(--form-primary-color);
  color: white;
  transform: scale(1.1);
}

.step-title {
  margin-left: 12px;
  font-size: 14px;
  color: var(--form-text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.form-step.completed .step-title,
.form-step.active .step-title {
  color: var(--form-text-primary);
}

/* 表单主体 */
.product-form {
  max-height: 65vh;
  overflow-y: auto;
  padding: 0 4px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--form-text-primary);
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--form-border-light);
}

.section-title i {
  color: var(--form-primary-color);
}

/* 必填字段标识 */
.required-field :deep(.el-form-item__label)::before {
  content: '*';
  color: var(--form-danger-color);
  margin-right: 4px;
}

/* 字段帮助文本 */
.field-help {
  font-size: 12px;
  color: var(--form-text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

/* 图片上传组件 */
.product-image-upload {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 148px;
  height: 148px;
  border: 2px dashed var(--form-border-base);
  border-radius: 6px;
  background: var(--form-bg-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: var(--form-primary-color);
  background: rgba(64, 158, 255, 0.05);
}

.upload-placeholder i {
  font-size: 28px;
  color: var(--form-text-secondary);
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: var(--form-text-regular);
}

.upload-tip {
  margin-top: 16px;
  padding: 16px;
  background: var(--form-bg-secondary);
  border-radius: 6px;
  border-left: 4px solid var(--form-primary-color);
}

.upload-tip p {
  margin: 0 0 8px;
  font-weight: 500;
  color: var(--form-text-primary);
}

.upload-tip ul {
  margin: 0;
  padding-left: 20px;
}

.upload-tip li {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--form-text-regular);
  line-height: 1.4;
}

/* 图片预览和排序 */
.image-preview-section {
  margin-top: 24px;
}

.image-preview-section h5 {
  font-size: 16px;
  font-weight: 500;
  color: var(--form-text-primary);
  margin: 0 0 16px;
}

.image-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--form-border-light);
  transition: all 0.3s ease;
}

.image-preview-item.is-main {
  border-color: var(--form-primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.image-actions .el-button {
  padding: 4px 8px;
  min-height: auto;
}

.main-image-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--form-primary-color);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

/* 商品属性部分 */
.basic-attributes {
  margin-bottom: 32px;
}

.basic-attributes h5 {
  font-size: 16px;
  font-weight: 500;
  color: var(--form-text-primary);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--form-border-light);
}

.dynamic-attributes {
  margin-top: 24px;
}

.attributes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.attributes-header h5 {
  font-size: 16px;
  font-weight: 500;
  color: var(--form-text-primary);
  margin: 0;
}

.empty-attributes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--form-bg-secondary);
  border-radius: 8px;
  border: 2px dashed var(--form-border-base);
}

.empty-attributes i {
  font-size: 32px;
  color: var(--form-text-secondary);
  margin-bottom: 12px;
}

.empty-attributes p {
  margin: 0;
  color: var(--form-text-secondary);
  text-align: center;
  line-height: 1.5;
}

.dynamic-attribute-item {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--form-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--form-border-light);
  transition: all 0.3s ease;
}

.dynamic-attribute-item:hover {
  border-color: var(--form-primary-color);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 表单底部 */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 0;
  border-top: 1px solid var(--form-border-light);
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表单验证样式增强 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--form-danger-color) inset;
}

:deep(.el-form-item.is-error .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--form-danger-color) inset;
}

:deep(.el-form-item.is-error .el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--form-danger-color) inset;
}

:deep(.el-form-item__error) {
  font-size: 12px;
  color: var(--form-danger-color);
  padding-top: 4px;
}

/* 成功状态样式 */
:deep(.el-form-item.is-success .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--form-success-color) inset;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .product-form {
    max-height: 70vh;
  }
  
  .form-steps {
    padding: 0 12px;
    margin-bottom: 24px;
  }
  
  .step-title {
    display: none;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .image-preview-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .image-preview-item {
    width: 100px;
    height: 100px;
  }
  
  .dynamic-attribute-item .el-col {
    margin-bottom: 12px;
  }
  
  .form-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .form-steps {
    padding: 0 8px;
  }
  
  .step-indicator {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .image-preview-list {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
  
  .image-preview-item {
    width: 80px;
    height: 80px;
  }
}

/* 滚动条样式 */
.product-form::-webkit-scrollbar {
  width: 6px;
}

.product-form::-webkit-scrollbar-track {
  background: var(--form-bg-secondary);
  border-radius: 3px;
}

.product-form::-webkit-scrollbar-thumb {
  background: var(--form-border-base);
  border-radius: 3px;
}

.product-form::-webkit-scrollbar-thumb:hover {
  background: var(--form-text-secondary);
}

/* 动画效果 */
.form-section {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载状态 */
.product-form.loading {
  pointer-events: none;
  opacity: 0.7;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .product-form-dialog {
    --form-text-primary: #E4E7ED;
    --form-text-regular: #CFD3DC;
    --form-text-secondary: #A4A9B0;
    --form-border-base: #4C4D4F;
    --form-border-light: #414243;
    --form-bg-primary: #1D1E1F;
    --form-bg-secondary: #25262B;
  }
}
</style>