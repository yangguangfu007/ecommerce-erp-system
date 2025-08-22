/**
 * 测试环境设置
 * 配置全局测试环境和 mock
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Element Plus 组件 - 使用简单的 stub
config.global.stubs = {
  'el-button': { 
    template: '<button class="el-button" :class="[`el-button--${type || \'default\'}`]"><slot /></button>',
    props: ['type']
  },
  'el-input': { template: '<input class="el-input" />' },
  'el-form': { template: '<form class="el-form"><slot /></form>' },
  'el-form-item': { template: '<div class="el-form-item"><slot /></div>' },
  'el-select': { template: '<select class="el-select"><slot /></select>' },
  'el-option': { template: '<option class="el-option"><slot /></option>' },
  'el-table': { template: '<table class="el-table"><slot /></table>' },
  'el-table-column': { template: '<td class="el-table-column"><slot /></td>' },
  'el-pagination': { template: '<div class="el-pagination"><slot /></div>' },
  'el-dialog': { template: '<div class="el-dialog"><slot /></div>' },
  'el-date-picker': { template: '<input type="date" class="el-date-picker" />' },
  'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" />' },
  'el-radio': { template: '<input type="radio" class="el-radio" />' },
  'el-radio-group': { template: '<div class="el-radio-group"><slot /></div>' },
  'el-switch': { template: '<input type="checkbox" class="el-switch" />' },
  'el-tag': { template: '<span class="el-tag"><slot /></span>' },
  'el-tooltip': { template: '<div class="el-tooltip"><slot /></div>' },
  'el-popover': { template: '<div class="el-popover"><slot /></div>' },
  'el-dropdown': { template: '<div class="el-dropdown"><slot /></div>' },
  'el-dropdown-menu': { template: '<div class="el-dropdown-menu"><slot /></div>' },
  'el-dropdown-item': { template: '<div class="el-dropdown-item"><slot /></div>' },
  'el-card': { template: '<div class="el-card"><slot /></div>' },
  'el-row': { template: '<div class="el-row"><slot /></div>' },
  'el-col': { template: '<div class="el-col"><slot /></div>' },
  'el-divider': { template: '<hr class="el-divider" />' },
  'el-alert': { template: '<div class="el-alert"><slot /></div>' },
  'el-message': { template: '<div class="el-message"><slot /></div>' },
  'el-notification': { template: '<div class="el-notification"><slot /></div>' },
  'el-loading': { template: '<div class="el-loading"><slot /></div>' },
  'el-icon': { template: '<i class="el-icon"><slot /></i>' },
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div><slot /></div>' }
}

// Mock 路由
const mockRoute = {
  path: '/',
  name: 'home',
  params: {},
  query: {},
  meta: {},
  fullPath: '/',
  hash: '',
  matched: []
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: mockRoute }
}

config.global.mocks = {
  $router: mockRouter,
  $route: mockRoute
}

// Mock vue-router composables
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
  RouterLink: 'router-link',
  RouterView: 'router-view'
}))

// 增强 DOM 环境 - 确保 happy-dom 正常工作
if (typeof document !== 'undefined') {
  // 确保 document.body 存在并有正确的方法
  if (!document.body) {
    document.body = document.createElement('body')
    document.documentElement.appendChild(document.body)
  }

  // 确保 document.body 有 classList
  if (!document.body.classList) {
    document.body.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn(),
      replace: vi.fn()
    }
  }

  // 确保 documentElement 有正确的属性和方法
  if (!document.documentElement.classList) {
    document.documentElement.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn(),
      replace: vi.fn()
    }
  }

  // 设置初始属性
  document.documentElement.setAttribute = vi.fn()
  document.documentElement.className = 'existing-class theme-light'
  document.documentElement.lang = 'zh-CN'

  // 确保 createElement 返回的元素有正确的方法
  const originalCreateElement = document.createElement.bind(document)
  document.createElement = vi.fn((tagName: string) => {
    const element = originalCreateElement(tagName)
    
    // 确保元素有 insertBefore 方法
    if (!element.insertBefore) {
      element.insertBefore = vi.fn((newNode: any, referenceNode: any) => {
        if (element.children) {
          const index = referenceNode ? Array.from(element.children).indexOf(referenceNode) : element.children.length
          if (index >= 0) {
            element.children.splice(index, 0, newNode)
          }
        }
        return newNode
      })
    }

    // 确保元素有 appendChild 方法
    if (!element.appendChild) {
      element.appendChild = vi.fn((child: any) => {
        if (!element.children) {
          element.children = []
        }
        element.children.push(child)
        return child
      })
    }

    // 确保元素有 removeChild 方法
    if (!element.removeChild) {
      element.removeChild = vi.fn((child: any) => {
        if (element.children) {
          const index = element.children.indexOf(child)
          if (index >= 0) {
            element.children.splice(index, 1)
          }
        }
        return child
      })
    }

    // 确保元素有 classList
    if (!element.classList) {
      element.classList = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false),
        toggle: vi.fn(),
        replace: vi.fn()
      }
    }

    return element
  })

  // 确保 body 和 documentElement 也有 insertBefore 方法
  if (!document.body.insertBefore) {
    document.body.insertBefore = vi.fn((newNode: any, referenceNode: any) => newNode)
  }
  if (!document.documentElement.insertBefore) {
    document.documentElement.insertBefore = vi.fn((newNode: any, referenceNode: any) => newNode)
  }
}

// Mock 全局对象
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock XMLHttpRequest 以修复网络请求问题
global.XMLHttpRequest = vi.fn().mockImplementation(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  abort: vi.fn(),
  readyState: 4,
  status: 200,
  statusText: 'OK',
  responseText: '{}',
  response: {},
  upload: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
}))

// Mock axios
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    post: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    put: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    delete: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    patch: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
  
  const mockAxios = {
    create: vi.fn(() => mockInstance),
    get: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    post: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    put: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    delete: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    patch: vi.fn(() => Promise.resolve({ data: { code: 200, data: {}, message: '成功' } })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
  return {
    default: mockAxios,
    ...mockAxios
  }
})

// Mock Element Plus 完整组件和功能
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal() as any
  
  // 创建一个简单的按钮组件 mock
  const ElButtonMock = {
    name: 'ElButton',
    template: '<button class="el-button" :class="[`el-button--${type || \'default\'}`]"><slot /></button>',
    props: {
      type: {
        type: String,
        default: 'default'
      }
    }
  }
  
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(() => Promise.resolve()),
      alert: vi.fn(() => Promise.resolve()),
      prompt: vi.fn(() => Promise.resolve())
    },
    ElNotification: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    // Mock 所有常用组件 - 使用更完整的组件定义
    ElButton: ElButtonMock,
    ElInput: { name: 'ElInput', template: '<input class="el-input" />' },
    ElForm: { name: 'ElForm', template: '<form class="el-form"><slot /></form>' },
    ElFormItem: { name: 'ElFormItem', template: '<div class="el-form-item"><slot /></div>' },
    ElSelect: { name: 'ElSelect', template: '<select class="el-select"><slot /></select>' },
    ElOption: { name: 'ElOption', template: '<option class="el-option"><slot /></option>' },
    ElTable: { name: 'ElTable', template: '<table class="el-table"><slot /></table>' },
    ElTableColumn: { name: 'ElTableColumn', template: '<td class="el-table-column"><slot /></td>' },
    ElPagination: { name: 'ElPagination', template: '<div class="el-pagination"><slot /></div>' },
    ElDialog: { name: 'ElDialog', template: '<div class="el-dialog"><slot /></div>' },
    ElDatePicker: { name: 'ElDatePicker', template: '<input type="date" class="el-date-picker" />' },
    ElCheckbox: { name: 'ElCheckbox', template: '<input type="checkbox" class="el-checkbox" />' },
    ElRadio: { name: 'ElRadio', template: '<input type="radio" class="el-radio" />' },
    ElRadioGroup: { name: 'ElRadioGroup', template: '<div class="el-radio-group"><slot /></div>' },
    ElSwitch: { name: 'ElSwitch', template: '<input type="checkbox" class="el-switch" />' },
    ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>' },
    ElTooltip: { name: 'ElTooltip', template: '<div class="el-tooltip"><slot /></div>' },
    ElPopover: { name: 'ElPopover', template: '<div class="el-popover"><slot /></div>' },
    ElDropdown: { name: 'ElDropdown', template: '<div class="el-dropdown"><slot /></div>' },
    ElDropdownMenu: { name: 'ElDropdownMenu', template: '<div class="el-dropdown-menu"><slot /></div>' },
    ElDropdownItem: { name: 'ElDropdownItem', template: '<div class="el-dropdown-item"><slot /></div>' },
    ElCard: { name: 'ElCard', template: '<div class="el-card"><slot /></div>' },
    ElRow: { name: 'ElRow', template: '<div class="el-row"><slot /></div>' },
    ElCol: { name: 'ElCol', template: '<div class="el-col"><slot /></div>' },
    ElDivider: { name: 'ElDivider', template: '<hr class="el-divider" />' },
    ElAlert: { name: 'ElAlert', template: '<div class="el-alert"><slot /></div>' },
    ElIcon: { name: 'ElIcon', template: '<i class="el-icon"><slot /></i>' },
    ElUpload: { name: 'ElUpload', template: '<div class="el-upload"><slot /></div>' },
    ElProgress: { name: 'ElProgress', template: '<div class="el-progress"><slot /></div>' },
    ElBadge: { name: 'ElBadge', template: '<div class="el-badge"><slot /></div>' },
    ElAvatar: { name: 'ElAvatar', template: '<div class="el-avatar"><slot /></div>' },
    ElEmpty: { name: 'ElEmpty', template: '<div class="el-empty"><slot /></div>' },
    ElResult: { name: 'ElResult', template: '<div class="el-result"><slot /></div>' },
    ElSkeleton: { name: 'ElSkeleton', template: '<div class="el-skeleton"><slot /></div>' },
    ElBacktop: { name: 'ElBacktop', template: '<div class="el-backtop"><slot /></div>' },
    ElBreadcrumb: { name: 'ElBreadcrumb', template: '<div class="el-breadcrumb"><slot /></div>' },
    ElBreadcrumbItem: { name: 'ElBreadcrumbItem', template: '<div class="el-breadcrumb-item"><slot /></div>' },
    ElMenu: { name: 'ElMenu', template: '<div class="el-menu"><slot /></div>' },
    ElMenuItem: { name: 'ElMenuItem', template: '<div class="el-menu-item"><slot /></div>' },
    ElSubMenu: { name: 'ElSubMenu', template: '<div class="el-sub-menu"><slot /></div>' },
    ElMenuItemGroup: { name: 'ElMenuItemGroup', template: '<div class="el-menu-item-group"><slot /></div>' },
    ElTabs: { name: 'ElTabs', template: '<div class="el-tabs"><slot /></div>' },
    ElTabPane: { name: 'ElTabPane', template: '<div class="el-tab-pane"><slot /></div>' },
    ElSteps: { name: 'ElSteps', template: '<div class="el-steps"><slot /></div>' },
    ElStep: { name: 'ElStep', template: '<div class="el-step"><slot /></div>' },
    ElCollapse: { name: 'ElCollapse', template: '<div class="el-collapse"><slot /></div>' },
    ElCollapseItem: { name: 'ElCollapseItem', template: '<div class="el-collapse-item"><slot /></div>' },
    ElTimeline: { name: 'ElTimeline', template: '<div class="el-timeline"><slot /></div>' },
    ElTimelineItem: { name: 'ElTimelineItem', template: '<div class="el-timeline-item"><slot /></div>' },
    ElTree: { name: 'ElTree', template: '<div class="el-tree"><slot /></div>' },
    ElTransfer: { name: 'ElTransfer', template: '<div class="el-transfer"><slot /></div>' },
    ElDrawer: { name: 'ElDrawer', template: '<div class="el-drawer"><slot /></div>' },
    ElPopconfirm: { name: 'ElPopconfirm', template: '<div class="el-popconfirm"><slot /></div>' },
    ElColorPicker: { name: 'ElColorPicker', template: '<div class="el-color-picker"><slot /></div>' },
    ElRate: { name: 'ElRate', template: '<div class="el-rate"><slot /></div>' },
    ElSlider: { name: 'ElSlider', template: '<div class="el-slider"><slot /></div>' },
    ElTimePicker: { name: 'ElTimePicker', template: '<input type="time" class="el-time-picker" />' },
    ElTimeSelect: { name: 'ElTimeSelect', template: '<select class="el-time-select"><slot /></select>' },
    ElCascader: { name: 'ElCascader', template: '<div class="el-cascader"><slot /></div>' },
    ElInputNumber: { name: 'ElInputNumber', template: '<input type="number" class="el-input-number" />' },
    ElAutocomplete: { name: 'ElAutocomplete', template: '<input class="el-autocomplete" />' },
    ElImage: { name: 'ElImage', template: '<img class="el-image" />' },
    ElCarousel: { name: 'ElCarousel', template: '<div class="el-carousel"><slot /></div>' },
    ElCarouselItem: { name: 'ElCarouselItem', template: '<div class="el-carousel-item"><slot /></div>' },
    ElCalendar: { name: 'ElCalendar', template: '<div class="el-calendar"><slot /></div>' },
    ElDescriptions: { name: 'ElDescriptions', template: '<div class="el-descriptions"><slot /></div>' },
    ElDescriptionsItem: { name: 'ElDescriptionsItem', template: '<div class="el-descriptions-item"><slot /></div>' },
    ElStatistic: { name: 'ElStatistic', template: '<div class="el-statistic"><slot /></div>' },
    ElAffix: { name: 'ElAffix', template: '<div class="el-affix"><slot /></div>' },
    ElAnchor: { name: 'ElAnchor', template: '<div class="el-anchor"><slot /></div>' },
    ElAnchorLink: { name: 'ElAnchorLink', template: '<div class="el-anchor-link"><slot /></div>' },
    ElWatermark: { name: 'ElWatermark', template: '<div class="el-watermark"><slot /></div>' },
    ElConfigProvider: { name: 'ElConfigProvider', template: '<div class="el-config-provider"><slot /></div>' },
    ElSpace: { name: 'ElSpace', template: '<div class="el-space"><slot /></div>' },
    ElContainer: { name: 'ElContainer', template: '<div class="el-container"><slot /></div>' },
    ElHeader: { name: 'ElHeader', template: '<div class="el-header"><slot /></div>' },
    ElAside: { name: 'ElAside', template: '<div class="el-aside"><slot /></div>' },
    ElMain: { name: 'ElMain', template: '<div class="el-main"><slot /></div>' },
    ElFooter: { name: 'ElFooter', template: '<div class="el-footer"><slot /></div>' }
  }
})

// Mock localStorage with proper implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

global.localStorage = localStorageMock

// Mock sessionStorage with proper implementation
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

global.sessionStorage = sessionStorageMock

// Mock console 方法以减少测试输出噪音
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}

// Mock fetch
global.fetch = vi.fn()

// Mock URL
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()