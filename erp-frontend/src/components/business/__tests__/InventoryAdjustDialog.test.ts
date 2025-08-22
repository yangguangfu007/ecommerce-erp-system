/**
 * 库存调整对话框组件测试
 * 测试库存调整表单、批量调整、确认流程等功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElDialog, ElForm, ElFormItem, ElRadioGroup, ElInputNumber, ElSelect, ElInput, ElButton } from 'element-plus'
import InventoryAdjustDialog from '../InventoryAdjustDialog.vue'
import type { Inventory } from '@/types/inventory'

// Mock Element Plus 组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

// 测试数据
const mockInventory: Inventory = {
  id: '1',
  sku: 'TEST-SKU-001',
  productId: 'prod-1',
  productName: 'iPhone 15 Pro',
  productImage: 'https://example.com/iphone15.jpg',
  storeId: 'store-1',
  storeName: '主仓库',
  availableQuantity: 100,
  reservedQuantity: 10,
  totalQuantity: 110,
  safetyStock: 20,
  maxStock: 500,
  status: 'NORMAL',
  warehouseLocation: 'A-01-001',
  cost: 999.99,
  totalValue: 109999.00,
  lastUpdated: '2024-01-15 10:30:00',
  createTime: '2024-01-01 00:00:00',
  updateTime: '2024-01-15 10:30:00'
}

const mockSelectedItems: Inventory[] = [
  mockInventory,
  {
    ...mockInventory,
    id: '2',
    sku: 'TEST-SKU-002',
    productName: 'Samsung Galaxy S24',
    availableQuantity: 50
  }
]

describe('InventoryAdjustDialog', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props = {}) => {
    return mount(InventoryAdjustDialog, {
      props: {
        modelValue: true,
        currentInventory: mockInventory,
        selectedItems: mockSelectedItems,
        isEdit: true,
        ...props
      },
      global: {
        components: {
          ElDialog,
          ElForm,
          ElFormItem,
          ElRadioGroup,
          ElInputNumber,
          ElSelect,
          ElInput,
          ElButton
        },
        stubs: {
          ElDialog: {
            template: '<div class="el-dialog"><slot /></div>',
            props: ['modelValue']
          },
          ElForm: {
            template: '<form class="el-form"><slot /></form>',
            props: ['model', 'rules'],
            methods: {
              validate: vi.fn().mockResolvedValue(true),
              clearValidate: vi.fn()
            }
          },
          ElFormItem: {
            template: '<div class="el-form-item"><slot /></div>',
            props: ['label', 'prop']
          },
          ElRadioGroup: {
            template: '<div class="el-radio-group"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue', 'change']
          },
          ElRadioButton: {
            template: '<button class="el-radio-button"><slot /></button>',
            props: ['value']
          },
          ElInputNumber: {
            template: '<input class="el-input-number" type="number" />',
            props: ['modelValue', 'min', 'max', 'precision']
          },
          ElSelect: {
            template: '<select class="el-select"><slot /></select>',
            props: ['modelValue', 'placeholder']
          },
          ElOption: {
            template: '<option class="el-option"><slot /></option>',
            props: ['label', 'value']
          },
          ElOptionGroup: {
            template: '<optgroup class="el-option-group"><slot /></optgroup>',
            props: ['label']
          },
          ElInput: {
            template: '<input class="el-input" />',
            props: ['modelValue', 'type', 'rows', 'placeholder', 'maxlength']
          },
          ElButton: {
            template: '<button class="el-button"><slot /></button>',
            props: ['type', 'loading']
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染单个库存调整对话框', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.product-card').exists()).toBe(true)
      expect(wrapper.find('.adjust-form').exists()).toBe(true)
      expect(wrapper.text()).toContain('iPhone 15 Pro')
      expect(wrapper.text()).toContain('TEST-SKU-001')
    })

    it('应该正确渲染批量调整对话框', () => {
      wrapper = createWrapper({ isEdit: false })
      
      expect(wrapper.find('.batch-adjust-content').exists()).toBe(true)
      expect(wrapper.find('.selected-items-section').exists()).toBe(true)
      expect(wrapper.text()).toContain('已选择商品 (2)')
    })

    it('应该显示商品信息', () => {
      wrapper = createWrapper()
      
      const productCard = wrapper.find('.product-card')
      expect(productCard.exists()).toBe(true)
      expect(productCard.text()).toContain('iPhone 15 Pro')
      expect(productCard.text()).toContain('TEST-SKU-001')
      expect(productCard.text()).toContain('A-01-001')
      expect(productCard.text()).toContain('100')
    })

    it('应该显示调整预览', () => {
      wrapper = createWrapper()
      
      const preview = wrapper.find('.adjustment-preview')
      expect(preview.exists()).toBe(true)
      expect(preview.text()).toContain('调整前库存')
      expect(preview.text()).toContain('调整后库存')
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      wrapper = createWrapper()
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      expect(form.exists()).toBe(true)
      
      // 模拟表单验证
      const validateSpy = vi.spyOn(form.vm, 'validate')
      
      await wrapper.find('.el-button[type="primary"]').trigger('click')
      
      expect(validateSpy).toHaveBeenCalled()
    })

    it('应该验证调整数量范围', () => {
      wrapper = createWrapper()
      
      // 测试出库数量不能超过可用库存
      const vm = wrapper.vm
      vm.adjustForm.type = 'OUT'
      vm.adjustForm.quantity = 150 // 超过可用库存100
      
      expect(vm.getMaxQuantity()).toBe(100)
    })

    it('应该验证入库数量上限', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.type = 'IN'
      
      expect(vm.getMaxQuantity()).toBe(9999)
    })
  })

  describe('调整类型切换', () => {
    it('应该在调整类型改变时重置数量', async () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.quantity = 50
      
      // 模拟类型改变
      vm.handleTypeChange()
      
      expect(vm.adjustForm.quantity).toBe(1)
    })

    it('应该根据调整类型显示不同的提示', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      
      // 测试出库提示
      vm.adjustForm.type = 'OUT'
      expect(wrapper.text()).toContain('最多可出库')
      
      // 测试入库（无特殊提示）
      vm.adjustForm.type = 'IN'
      expect(wrapper.text()).not.toContain('最多可出库')
    })
  })

  describe('调整预览计算', () => {
    it('应该正确计算入库后的库存', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.type = 'IN'
      vm.adjustForm.quantity = 50
      
      expect(vm.getAdjustedQuantity()).toBe(150) // 100 + 50
    })

    it('应该正确计算出库后的库存', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.type = 'OUT'
      vm.adjustForm.quantity = 30
      
      expect(vm.getAdjustedQuantity()).toBe(70) // 100 - 30
    })

    it('应该防止出库后库存为负数', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.type = 'OUT'
      vm.adjustForm.quantity = 150
      
      expect(vm.getAdjustedQuantity()).toBe(0) // Math.max(0, 100 - 150)
    })

    it('应该为预览值添加正确的CSS类', () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      
      // 测试入库（增加）
      vm.adjustForm.type = 'IN'
      vm.adjustForm.quantity = 50
      expect(vm.getPreviewClass()).toBe('preview-increase')
      
      // 测试出库（减少）
      vm.adjustForm.type = 'OUT'
      vm.adjustForm.quantity = 30
      expect(vm.getPreviewClass()).toBe('preview-decrease')
    })
  })

  describe('批量调整功能', () => {
    beforeEach(() => {
      wrapper = createWrapper({ isEdit: false })
    })

    it('应该显示选中商品列表', () => {
      const itemsList = wrapper.find('.items-list')
      expect(itemsList.exists()).toBe(true)
      
      const itemRows = wrapper.findAll('.item-row')
      expect(itemRows).toHaveLength(2)
    })

    it('应该正确计算批量调整预览', () => {
      const vm = wrapper.vm
      vm.batchAdjustForm.type = 'IN'
      vm.batchAdjustForm.quantity = 20
      
      expect(vm.getBatchAdjustedQuantity(mockInventory)).toBe(120) // 100 + 20
      expect(vm.getBatchAdjustedQuantity(mockSelectedItems[1])).toBe(70) // 50 + 20
    })

    it('应该支持展开/收起商品列表', async () => {
      const toggleButton = wrapper.find('.section-title .el-button')
      expect(toggleButton.exists()).toBe(true)
      
      // 初始状态应该是收起的
      expect(wrapper.vm.showItemDetails).toBe(false)
      
      // 点击展开
      await toggleButton.trigger('click')
      expect(wrapper.vm.showItemDetails).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该在确认时发出正确的事件', async () => {
      const { ElMessageBox } = await import('element-plus')
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm = {
        type: 'IN',
        quantity: 50,
        reason: 'PURCHASE',
        note: '采购入库',
        referenceNumber: 'PO-001'
      }
      
      await vm.handleSingleAdjust()
      
      expect(wrapper.emitted('confirm')).toBeTruthy()
      const emittedData = wrapper.emitted('confirm')?.[0]?.[0]
      expect(emittedData).toEqual({
        type: 'IN',
        quantity: 50,
        reason: 'PURCHASE',
        note: '采购入库',
        referenceNumber: 'PO-001'
      })
    })

    it('应该在批量确认时发出正确的事件', async () => {
      const { ElMessageBox } = await import('element-plus')
      vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
      
      wrapper = createWrapper({ isEdit: false })
      
      const vm = wrapper.vm
      vm.batchAdjustForm = {
        type: 'OUT',
        quantity: 10,
        reason: 'SALE',
        note: '销售出库'
      }
      
      await vm.handleBatchAdjust()
      
      expect(wrapper.emitted('confirm')).toBeTruthy()
      const emittedData = wrapper.emitted('confirm')?.[0]?.[0]
      expect(emittedData.items).toHaveLength(2)
      expect(emittedData.items[0].adjustment).toEqual({
        type: 'OUT',
        quantity: 10,
        reason: 'SALE',
        note: '销售出库'
      })
    })

    it('应该在关闭时重置表单', async () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.quantity = 50
      vm.adjustForm.note = '测试备注'
      
      vm.handleClose()
      
      expect(vm.adjustForm.quantity).toBe(1)
      expect(vm.adjustForm.note).toBe('')
    })

    it('应该处理图片加载错误', () => {
      wrapper = createWrapper()
      
      const img = wrapper.find('.product-image img')
      const mockEvent = {
        target: { src: '' }
      } as any
      
      wrapper.vm.handleImageError(mockEvent)
      
      expect(mockEvent.target.src).toContain('data:image/svg+xml')
    })
  })

  describe('表单重置', () => {
    it('应该在对话框打开时重置表单', async () => {
      wrapper = createWrapper({ modelValue: false })
      
      const vm = wrapper.vm
      vm.adjustForm.quantity = 50
      vm.adjustForm.note = '测试'
      
      // 模拟对话框打开
      await wrapper.setProps({ modelValue: true })
      
      expect(vm.adjustForm.quantity).toBe(1)
      expect(vm.adjustForm.note).toBe('')
    })

    it('应该清除表单验证状态', () => {
      wrapper = createWrapper()
      
      const form = wrapper.findComponent({ name: 'ElForm' })
      const clearValidateSpy = vi.spyOn(form.vm, 'clearValidate')
      
      wrapper.vm.resetForms()
      
      expect(clearValidateSpy).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理出库数量超限错误', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper = createWrapper()
      
      const vm = wrapper.vm
      vm.adjustForm.type = 'OUT'
      vm.adjustForm.quantity = 150 // 超过可用库存
      
      await vm.handleSingleAdjust()
      
      expect(ElMessage.error).toHaveBeenCalledWith('出库数量不能超过可用库存 100')
    })

    it('应该处理批量出库库存不足错误', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper = createWrapper({ isEdit: false })
      
      const vm = wrapper.vm
      vm.batchAdjustForm.type = 'OUT'
      vm.batchAdjustForm.quantity = 60 // 第二个商品只有50库存
      
      await vm.handleBatchAdjust()
      
      expect(ElMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('以下商品库存不足：Samsung Galaxy S24')
      )
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕上调整布局', () => {
      wrapper = createWrapper()
      
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })
      
      // 检查响应式类是否存在
      const style = wrapper.find('style')
      expect(style.exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该有正确的表单标签', () => {
      wrapper = createWrapper()
      
      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThan(0)
      
      // 检查是否有标签
      formItems.forEach(item => {
        expect(item.attributes('label')).toBeDefined()
      })
    })

    it('应该有正确的按钮文本', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('.el-button')
      const buttonTexts = buttons.map(btn => btn.text())
      
      expect(buttonTexts).toContain('取消')
      expect(buttonTexts).toContain('确认调整')
    })
  })
})