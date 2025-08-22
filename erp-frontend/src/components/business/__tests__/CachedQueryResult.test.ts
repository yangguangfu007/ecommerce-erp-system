import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElTable, ElTableColumn, ElPagination, ElTag } from 'element-plus'
import CachedQueryResult from '../CachedQueryResult.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElTable: { name: 'ElTable', template: '<table><slot /></table>' },
  ElTableColumn: { name: 'ElTableColumn', template: '<td><slot /></td>' },
  ElPagination: { name: 'ElPagination', template: '<div class="pagination"></div>' },
  ElTag: { name: 'ElTag', template: '<span><slot /></span>' },
  ElSwitch: { name: 'ElSwitch', template: '<input type="checkbox" />' },
  ElInputNumber: { name: 'ElInputNumber', template: '<input type="number" />' },
  ElDescriptions: { name: 'ElDescriptions', template: '<div><slot /></div>' },
  ElDescriptionsItem: { name: 'ElDescriptionsItem', template: '<div><slot /></div>' },
  ElFormItem: { name: 'ElFormItem', template: '<div><slot /></div>' },
  ElRow: { name: 'ElRow', template: '<div><slot /></div>' },
  ElCol: { name: 'ElCol', template: '<div><slot /></div>' },
  ElCollapseTransition: { name: 'ElCollapseTransition', template: '<div><slot /></div>' },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  Loading: { name: 'Loading' },
  Database: { name: 'Database' },
  Refresh: { name: 'Refresh' },
  Setting: { name: 'Setting' },
  Download: { name: 'Download' }
}))

// Mock business components
vi.mock('@/components/business', () => ({
  ExportDialog: { name: 'ExportDialog', template: '<div class="export-dialog"><slot /></div>' }
}))

// Mock cell components
vi.mock('../cells/CellText.vue', () => ({
  default: { name: 'CellText', template: '<span>{{ value }}</span>', props: ['value'] }
}))
vi.mock('../cells/CellNumber.vue', () => ({
  default: { name: 'CellNumber', template: '<span>{{ value }}</span>', props: ['value'] }
}))
vi.mock('../cells/CellDate.vue', () => ({
  default: { name: 'CellDate', template: '<span>{{ value }}</span>', props: ['value'] }
}))
vi.mock('../cells/CellStatus.vue', () => ({
  default: { name: 'CellStatus', template: '<span>{{ value }}</span>', props: ['value'] }
}))
vi.mock('../cells/CellImage.vue', () => ({
  default: { name: 'CellImage', template: '<img :src="value" />', props: ['value'] }
}))

describe('CachedQueryResult', () => {
  let wrapper: any

  const mockData = [
    { id: 1, name: '商品1', price: 100, status: 'active', createdAt: '2024-01-01' },
    { id: 2, name: '商品2', price: 200, status: 'inactive', createdAt: '2024-01-02' },
    { id: 3, name: '商品3', price: 300, status: 'active', createdAt: '2024-01-03' }
  ]

  const mockColumns = [
    { key: 'id', label: 'ID', type: 'number' as const, sortable: true },
    { key: 'name', label: '名称', type: 'text' as const },
    { key: 'price', label: '价格', type: 'number' as const, sortable: true },
    { key: 'status', label: '状态', type: 'status' as const },
    { key: 'createdAt', label: '创建时间', type: 'date' as const, sortable: true }
  ]

  const mockPagination = {
    page: 1,
    size: 20,
    total: 100
  }

  beforeEach(() => {
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

    wrapper = mount(CachedQueryResult, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: mockPagination,
        selectable: true,
        showIndex: true,
        showActions: true,
        cacheKey: 'test-cache'
      },
      global: {
        components: {
          ElButton,
          ElTable,
          ElTableColumn,
          ElPagination,
          ElTag
        }
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染结果头部', () => {
      expect(wrapper.find('.result-header').exists()).toBe(true)
      expect(wrapper.find('.result-title').text()).toBe('查询结果')
      expect(wrapper.find('.result-stats').exists()).toBe(true)
      expect(wrapper.find('.result-actions').exists()).toBe(true)
    })

    it('应该显示正确的数据统计', () => {
      const statsTag = wrapper.find('.result-stats .el-tag')
      expect(statsTag.text()).toContain('共 100 条记录')
    })

    it('应该渲染数据表格', () => {
      expect(wrapper.find('.result-table').exists()).toBe(true)
      expect(wrapper.find('.el-table').exists()).toBe(true)
    })

    it('应该渲染分页组件', () => {
      expect(wrapper.find('.result-pagination').exists()).toBe(true)
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('应该显示分页信息', () => {
      const paginationInfo = wrapper.find('.pagination-info')
      expect(paginationInfo.text()).toContain('显示第 1-20 条，共 100 条记录')
    })
  })

  describe('缓存功能', () => {
    it('应该初始化缓存配置', () => {
      expect(wrapper.vm.cacheConfig.enabled).toBe(true)
      expect(wrapper.vm.cacheConfig.ttl).toBe(30)
      expect(wrapper.vm.cacheConfig.maxSize).toBe(1000)
    })

    it('应该能够生成缓存键', () => {
      const conditions = { field: 'name', value: 'test' }
      const cacheKey = wrapper.vm.generateCacheKey(conditions)
      
      expect(cacheKey).toBe('test-cache_{"field":"name","value":"test"}')
    })

    it('应该能够设置缓存数据', () => {
      const conditions = { field: 'name', value: 'test' }
      const testData = [{ id: 1, name: 'test' }]
      
      wrapper.vm.setCachedData(conditions, testData)
      
      const cached = wrapper.vm.getCachedData(conditions)
      expect(cached).toBeTruthy()
      expect(cached.data).toEqual(testData)
    })

    it('应该能够获取缓存数据', () => {
      const conditions = { field: 'name', value: 'test' }
      const testData = [{ id: 1, name: 'test' }]
      
      // 设置缓存
      wrapper.vm.setCachedData(conditions, testData)
      
      // 获取缓存
      const cached = wrapper.vm.getCachedData(conditions)
      expect(cached).toBeTruthy()
      expect(cached.data).toEqual(testData)
    })

    it('应该在缓存过期时返回null', () => {
      const conditions = { field: 'name', value: 'test' }
      const testData = [{ id: 1, name: 'test' }]
      
      // 设置缓存配置为0分钟（立即过期）
      wrapper.vm.cacheConfig.ttl = 0
      wrapper.vm.setCachedData(conditions, testData)
      
      // 获取缓存应该返回null（已过期）
      const cached = wrapper.vm.getCachedData(conditions)
      expect(cached).toBeNull()
    })

    it('应该在禁用缓存时不设置缓存', () => {
      wrapper.vm.cacheConfig.enabled = false
      
      const conditions = { field: 'name', value: 'test' }
      const testData = [{ id: 1, name: 'test' }]
      
      wrapper.vm.setCachedData(conditions, testData)
      
      const cached = wrapper.vm.getCachedData(conditions)
      expect(cached).toBeNull()
    })

    it('应该能够清空缓存', async () => {
      const conditions = { field: 'name', value: 'test' }
      const testData = [{ id: 1, name: 'test' }]
      
      wrapper.vm.setCachedData(conditions, testData)
      expect(wrapper.vm.cacheStorage.size).toBeGreaterThan(0)
      
      await wrapper.vm.clearCache()
      
      expect(wrapper.vm.cacheStorage.size).toBe(0)
    })

    it('应该在缓存大小超限时删除最旧的缓存', () => {
      wrapper.vm.cacheConfig.maxSize = 2
      
      const conditions1 = { field: 'name', value: 'test1' }
      const conditions2 = { field: 'name', value: 'test2' }
      const conditions3 = { field: 'name', value: 'test3' }
      
      wrapper.vm.setCachedData(conditions1, [])
      wrapper.vm.setCachedData(conditions2, [])
      expect(wrapper.vm.cacheStorage.size).toBe(2)
      
      wrapper.vm.setCachedData(conditions3, [])
      expect(wrapper.vm.cacheStorage.size).toBe(2)
      
      // 最旧的缓存应该被删除
      expect(wrapper.vm.getCachedData(conditions1)).toBeNull()
      expect(wrapper.vm.getCachedData(conditions2)).toBeTruthy()
      expect(wrapper.vm.getCachedData(conditions3)).toBeTruthy()
    })
  })

  describe('分页功能', () => {
    it('应该正确计算分页数据', () => {
      const paginatedData = wrapper.vm.paginatedData
      expect(paginatedData).toEqual(mockData) // 因为数据少于页面大小
    })

    it('应该正确计算起始和结束记录数', () => {
      expect(wrapper.vm.startRecord).toBe(1)
      expect(wrapper.vm.endRecord).toBe(20)
    })

    it('应该正确计算行索引', () => {
      expect(wrapper.vm.getRowIndex(0)).toBe(1)
      expect(wrapper.vm.getRowIndex(1)).toBe(2)
    })

    it('应该在页面变更时触发事件', async () => {
      await wrapper.vm.onPageChange(2)
      
      expect(wrapper.emitted('pageChange')).toBeTruthy()
      expect(wrapper.emitted('pageChange')[0]).toEqual([2, 20])
    })

    it('应该在页面大小变更时触发事件', async () => {
      await wrapper.vm.onPageSizeChange(50)
      
      expect(wrapper.emitted('pageChange')).toBeTruthy()
      expect(wrapper.emitted('pageChange')[0]).toEqual([1, 50])
    })
  })

  describe('排序功能', () => {
    it('应该在排序变更时触发事件', async () => {
      await wrapper.vm.onSortChange({ prop: 'price', order: 'ascending' })
      
      expect(wrapper.emitted('sortChange')).toBeTruthy()
      expect(wrapper.emitted('sortChange')[0]).toEqual(['price', 'asc'])
    })

    it('应该正确处理降序排序', async () => {
      await wrapper.vm.onSortChange({ prop: 'price', order: 'descending' })
      
      expect(wrapper.emitted('sortChange')).toBeTruthy()
      expect(wrapper.emitted('sortChange')[0]).toEqual(['price', 'desc'])
    })
  })

  describe('选择功能', () => {
    it('应该在选择变更时触发事件', async () => {
      const selectedRows = [mockData[0], mockData[1]]
      
      await wrapper.vm.onSelectionChange(selectedRows)
      
      expect(wrapper.vm.selectedRows).toEqual(selectedRows)
      expect(wrapper.emitted('selectionChange')).toBeTruthy()
      expect(wrapper.emitted('selectionChange')[0]).toEqual([selectedRows])
    })
  })

  describe('操作功能', () => {
    it('应该在查看详情时触发事件', async () => {
      const row = mockData[0]
      
      await wrapper.vm.viewDetail(row)
      
      expect(wrapper.emitted('viewDetail')).toBeTruthy()
      expect(wrapper.emitted('viewDetail')[0]).toEqual([row])
    })

    it('应该在编辑行时触发事件', async () => {
      const row = mockData[0]
      
      await wrapper.vm.editRow(row)
      
      expect(wrapper.emitted('editRow')).toBeTruthy()
      expect(wrapper.emitted('editRow')[0]).toEqual([row])
    })

    it('应该在刷新时触发事件', async () => {
      await wrapper.vm.refreshData()
      
      expect(wrapper.emitted('refresh')).toBeTruthy()
    })

    it('应该在导出时显示导出对话框', async () => {
      await wrapper.vm.exportData()
      
      expect(wrapper.vm.showExportDialog).toBe(true)
    })
  })

  describe('单元格组件', () => {
    it('应该根据列类型返回正确的单元格组件', () => {
      const textColumn = { type: 'text' }
      const numberColumn = { type: 'number' }
      const dateColumn = { type: 'date' }
      const statusColumn = { type: 'status' }
      const imageColumn = { type: 'image' }
      const defaultColumn = {}
      
      expect(wrapper.vm.getCellComponent(textColumn).name).toBe('CellText')
      expect(wrapper.vm.getCellComponent(numberColumn).name).toBe('CellNumber')
      expect(wrapper.vm.getCellComponent(dateColumn).name).toBe('CellDate')
      expect(wrapper.vm.getCellComponent(statusColumn).name).toBe('CellStatus')
      expect(wrapper.vm.getCellComponent(imageColumn).name).toBe('CellImage')
      expect(wrapper.vm.getCellComponent(defaultColumn).name).toBe('CellText')
    })
  })

  describe('缓存设置', () => {
    it('应该能够切换缓存设置面板', async () => {
      expect(wrapper.vm.showCacheSettings).toBe(false)
      
      await wrapper.vm.toggleCacheSettings()
      
      expect(wrapper.vm.showCacheSettings).toBe(true)
    })

    it('应该在缓存配置变更时保存配置', async () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem')
      
      await wrapper.vm.onCacheConfigChange()
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'test-cache_config',
        JSON.stringify(wrapper.vm.cacheConfig)
      )
    })

    it('应该在禁用缓存时清空缓存', async () => {
      // 先设置一些缓存数据
      wrapper.vm.setCachedData({ test: 'data' }, [])
      expect(wrapper.vm.cacheStorage.size).toBeGreaterThan(0)
      
      // 禁用缓存
      wrapper.vm.cacheConfig.enabled = false
      await wrapper.vm.onCacheConfigChange()
      
      expect(wrapper.vm.cacheStorage.size).toBe(0)
    })
  })

  describe('缓存统计', () => {
    it('应该正确更新缓存统计', () => {
      wrapper.vm.setCachedData({ test: 'data1' }, [])
      wrapper.vm.setCachedData({ test: 'data2' }, [])
      
      wrapper.vm.updateCacheStats()
      
      expect(wrapper.vm.cacheStats.size).toBe(2)
      expect(wrapper.vm.cacheStats.lastUpdate).toBeTruthy()
    })
  })

  describe('计算属性', () => {
    it('应该正确计算可见列', () => {
      const visibleColumns = wrapper.vm.visibleColumns
      expect(visibleColumns).toEqual(mockColumns)
      
      // 隐藏一列
      const columnsWithHidden = [...mockColumns]
      columnsWithHidden[0].visible = false
      
      await wrapper.setProps({ columns: columnsWithHidden })
      
      const newVisibleColumns = wrapper.vm.visibleColumns
      expect(newVisibleColumns).toHaveLength(mockColumns.length - 1)
      expect(newVisibleColumns.find(col => col.key === 'id')).toBeUndefined()
    })

    it('应该正确计算导出列', () => {
      const exportColumns = wrapper.vm.exportColumns
      
      expect(exportColumns).toHaveLength(mockColumns.length)
      expect(exportColumns[0]).toMatchObject({
        key: 'id',
        title: 'ID'
      })
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时加载缓存配置', () => {
      const getItemSpy = vi.spyOn(localStorage, 'getItem')
      
      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(CachedQueryResult, {
        props: {
          data: mockData,
          columns: mockColumns,
          pagination: mockPagination,
          cacheKey: 'test-cache'
        }
      })
      
      expect(getItemSpy).toHaveBeenCalledWith('test-cache_config')
    })

    it('应该在卸载时停止缓存清理定时器', () => {
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('工具方法', () => {
    it('应该正确格式化日期时间', () => {
      const dateTime = '2024-01-01T12:00:00.000Z'
      const formatted = wrapper.vm.formatDateTime(dateTime)
      
      expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
    })

    it('应该处理空日期时间', () => {
      const formatted = wrapper.vm.formatDateTime('')
      expect(formatted).toBe('-')
    })
  })
})