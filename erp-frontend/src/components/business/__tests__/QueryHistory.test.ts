import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElEmpty } from 'element-plus'
import QueryHistory from '../QueryHistory.vue'

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button :type="type" :size="size" :text="text"><slot /></button>',
    props: ['type', 'size', 'text']
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue" class="el-dialog"><slot /><div class="el-dialog__footer"><slot name="footer" /></div></div>',
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue']
  },
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>',
    props: ['model', 'labelWidth']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><label>{{ label }}</label><slot /></div>',
    props: ['label']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'maxlength', 'showWordLimit'],
    emits: ['update:modelValue']
  },
  ElEmpty: {
    name: 'ElEmpty',
    template: '<div class="el-empty">{{ description }}</div>',
    props: ['description', 'imageSize']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i><slot /></i>'
  },
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue(true)
  }
}))

// Mock 图标组件
vi.mock('@element-plus/icons-vue', () => ({
  Delete: { name: 'Delete' },
  Edit: { name: 'Edit' }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('QueryHistory', () => {
  let wrapper: any

  const defaultProps = {
    maxHistory: 10,
    storageKey: 'test-query-history',
    dataSources: [
      { label: '订单数据', value: 'orders' },
      { label: '商品数据', value: 'products' }
    ]
  }

  const mockHistoryItem = {
    name: '测试查询',
    dataSource: 'orders',
    selectedFields: ['id', 'orderNumber'],
    filters: { status: 'active' },
    sortField: 'id',
    sortOrder: 'asc',
    pageSize: 50,
    timestamp: Date.now(),
    filterCount: 1
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockHistoryItem]))
    
    wrapper = mount(QueryHistory, {
      props: defaultProps,
      global: {
        components: {
          ElButton,
          ElDialog,
          ElForm,
          ElFormItem,
          ElInput,
          ElEmpty
        }
      }
    })
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.query-history').exists()).toBe(true)
  })

  it('应该显示历史标题和操作', () => {
    const title = wrapper.find('.history-title')
    expect(title.text()).toBe('查询历史')
    
    const actions = wrapper.find('.history-actions')
    expect(actions.exists()).toBe(true)
  })

  it('应该加载历史记录', () => {
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-query-history')
    expect(wrapper.vm.historyList.length).toBe(1)
    expect(wrapper.vm.historyList[0].name).toBe('测试查询')
  })

  it('应该显示历史记录列表', () => {
    const historyItems = wrapper.findAll('.history-item')
    expect(historyItems.length).toBe(1)
    
    const historyName = wrapper.find('.history-name')
    expect(historyName.text()).toBe('测试查询')
  })

  it('应该显示历史记录摘要信息', () => {
    const summary = wrapper.find('.history-summary')
    expect(summary.exists()).toBe(true)
    expect(summary.text()).toContain('订单数据')
    expect(summary.text()).toContain('2 个字段')
    expect(summary.text()).toContain('1 个筛选条件')
  })

  it('应该能够应用历史记录', async () => {
    const historyItem = wrapper.find('.history-item')
    await historyItem.trigger('click')
    
    expect(wrapper.emitted('apply')).toBeTruthy()
    expect(wrapper.emitted('apply')[0]).toEqual([mockHistoryItem])
  })

  it('应该能够编辑历史记录', async () => {
    const editBtn = wrapper.find('.history-actions button')
    await editBtn.trigger('click')
    
    expect(wrapper.vm.showEditDialog).toBe(true)
    expect(wrapper.vm.editForm.name).toBe('测试查询')
  })

  it('应该能够删除历史记录', async () => {
    const { ElMessageBox } = await import('element-plus')
    ElMessageBox.confirm = vi.fn().mockResolvedValue(true)
    
    await wrapper.vm.deleteHistory(0)
    
    expect(ElMessageBox.confirm).toHaveBeenCalled()
    expect(wrapper.vm.historyList.length).toBe(0)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('应该能够清空历史记录', async () => {
    const { ElMessageBox } = await import('element-plus')
    ElMessageBox.confirm = vi.fn().mockResolvedValue(true)
    
    await wrapper.vm.clearHistory()
    
    expect(ElMessageBox.confirm).toHaveBeenCalled()
    expect(wrapper.vm.historyList.length).toBe(0)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-query-history', '[]')
  })

  it('应该能够添加新的历史记录', () => {
    const newQueryConfig = {
      dataSource: 'products',
      selectedFields: ['id', 'name'],
      filters: { category: 'electronics' },
      sortField: 'name',
      sortOrder: 'desc',
      pageSize: 100
    }
    
    wrapper.vm.addHistory(newQueryConfig, '新查询')
    
    expect(wrapper.vm.historyList.length).toBe(2)
    expect(wrapper.vm.historyList[0].name).toBe('新查询')
    expect(wrapper.vm.historyList[0].dataSource).toBe('products')
  })

  it('应该限制历史记录数量', () => {
    // 设置较小的最大历史记录数
    wrapper = mount(QueryHistory, {
      props: { ...defaultProps, maxHistory: 2 },
      global: {
        components: {
          ElButton,
          ElDialog,
          ElForm,
          ElFormItem,
          ElInput,
          ElEmpty
        }
      }
    })
    
    // 添加多个历史记录
    for (let i = 0; i < 5; i++) {
      wrapper.vm.addHistory({
        dataSource: 'orders',
        selectedFields: ['id'],
        filters: {},
        sortField: '',
        sortOrder: 'asc',
        pageSize: 50
      }, `查询${i}`)
    }
    
    expect(wrapper.vm.historyList.length).toBe(2)
  })

  it('应该能够更新现有的相同查询', () => {
    const sameQueryConfig = {
      dataSource: 'orders',
      selectedFields: ['id', 'orderNumber'],
      filters: { status: 'active' },
      sortField: 'id',
      sortOrder: 'asc',
      pageSize: 50
    }
    
    const originalTimestamp = wrapper.vm.historyList[0].timestamp
    
    wrapper.vm.addHistory(sameQueryConfig, '更新的查询')
    
    // 应该更新现有记录而不是添加新记录
    expect(wrapper.vm.historyList.length).toBe(1)
    expect(wrapper.vm.historyList[0].name).toBe('更新的查询')
    expect(wrapper.vm.historyList[0].timestamp).toBeGreaterThan(originalTimestamp)
  })

  it('应该能够格式化时间显示', () => {
    const now = Date.now()
    
    // 测试不同时间差
    expect(wrapper.vm.formatTime(now)).toBe('刚刚')
    expect(wrapper.vm.formatTime(now - 5 * 60 * 1000)).toBe('5分钟前')
    expect(wrapper.vm.formatTime(now - 2 * 60 * 60 * 1000)).toBe('2小时前')
    expect(wrapper.vm.formatTime(now - 3 * 24 * 60 * 60 * 1000)).toBe('3天前')
  })

  it('应该能够保存编辑', async () => {
    const { ElMessage } = await import('element-plus')
    
    wrapper.vm.editForm.name = '编辑后的名称'
    wrapper.vm.editForm.index = 0
    
    await wrapper.vm.saveEdit()
    
    expect(wrapper.vm.historyList[0].name).toBe('编辑后的名称')
    expect(wrapper.vm.showEditDialog).toBe(false)
    expect(ElMessage.success).toHaveBeenCalledWith('修改成功')
  })

  it('应该在编辑时验证名称', async () => {
    const { ElMessage } = await import('element-plus')
    
    wrapper.vm.editForm.name = ''
    wrapper.vm.editForm.index = 0
    
    await wrapper.vm.saveEdit()
    
    expect(ElMessage.warning).toHaveBeenCalledWith('请输入查询名称')
    expect(wrapper.vm.showEditDialog).toBe(true)
  })

  it('应该能够获取数据源标签', () => {
    const getLabel = wrapper.vm.getDataSourceLabel
    expect(getLabel('orders')).toBe('订单数据')
    expect(getLabel('products')).toBe('商品数据')
    expect(getLabel('unknown')).toBe('unknown')
  })

  it('应该在无历史记录时显示空状态', async () => {
    await wrapper.setData({ historyList: [] })
    
    const empty = wrapper.find('.history-empty')
    expect(empty.exists()).toBe(true)
  })

  it('应该暴露正确的方法', () => {
    expect(wrapper.vm.addHistory).toBeDefined()
    expect(wrapper.vm.clearHistory).toBeDefined()
    expect(wrapper.vm.getHistory).toBeDefined()
    
    const history = wrapper.vm.getHistory()
    expect(history).toBe(wrapper.vm.historyList)
  })
})