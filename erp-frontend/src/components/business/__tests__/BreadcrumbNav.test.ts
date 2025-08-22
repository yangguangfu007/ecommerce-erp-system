import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElIcon } from 'element-plus'
import BreadcrumbNav from '../BreadcrumbNav.vue'

// Mock Vue Router
const mockRoute = {
  path: '/dashboard/users/list',
  matched: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: { title: '仪表板', icon: 'dashboard' },
      components: { default: {} }
    },
    {
      path: '/dashboard/users',
      name: 'Users',
      meta: { title: '用户管理', icon: 'users' },
      components: { default: {} }
    },
    {
      path: '/dashboard/users/list',
      name: 'UserList',
      meta: { title: '用户列表', icon: 'list' },
      components: { default: {} }
    }
  ],
  params: {}
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' }
}))

describe('BreadcrumbNav', () => {
  it('应该正确渲染面包屑导航', () => {
    const wrapper = mount(BreadcrumbNav, {
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.find('.breadcrumb-nav').exists()).toBe(true)
    expect(wrapper.find('.breadcrumb-list').exists()).toBe(true)
  })

  it('应该显示首页链接', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        showHome: true,
        homeText: '首页'
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('首页')
  })

  it('应该隐藏首页链接', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).not.toContain('首页')
  })

  it('应该支持自定义面包屑项', () => {
    const customItems = [
      { title: '自定义1', path: '/custom1' },
      { title: '自定义2', path: '/custom2' },
      { title: '当前页面' }
    ]

    const wrapper = mount(BreadcrumbNav, {
      props: {
        items: customItems,
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('自定义1')
    expect(wrapper.text()).toContain('自定义2')
    expect(wrapper.text()).toContain('当前页面')
  })

  it('应该自动生成面包屑', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        autoGenerate: true,
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('仪表板')
    expect(wrapper.text()).toContain('用户管理')
    expect(wrapper.text()).toContain('用户列表')
  })

  it('应该支持紧凑模式', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        compact: true
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.find('.breadcrumb-nav-compact').exists()).toBe(true)
  })

  it('应该限制最大层级', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        maxLevel: 2,
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    const breadcrumbItems = wrapper.vm.breadcrumbItems
    expect(breadcrumbItems.length).toBeLessThanOrEqual(2)
  })

  it('应该支持自定义元信息字段', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        metaFields: {
          title: 'customTitle',
          icon: 'customIcon',
          breadcrumb: 'customBreadcrumb'
        },
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.vm.metaFields.title).toBe('customTitle')
    expect(wrapper.vm.metaFields.icon).toBe('customIcon')
    expect(wrapper.vm.metaFields.breadcrumb).toBe('customBreadcrumb')
  })

  it('应该正确判断是否为首页', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        homeRoute: '/dashboard'
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    // 当前路由不是首页
    expect(wrapper.vm.isHomePage).toBe(false)
  })

  it('应该支持操作插槽', () => {
    const wrapper = mount(BreadcrumbNav, {
      slots: {
        actions: '<button class="custom-action">操作</button>'
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.find('.breadcrumb-actions').exists()).toBe(true)
    expect(wrapper.find('.custom-action').exists()).toBe(true)
  })

  it('应该支持更新面包屑项', () => {
    const wrapper = mount(BreadcrumbNav, {
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    const newItems = [
      { title: '新项目1', path: '/new1' },
      { title: '新项目2' }
    ]

    wrapper.vm.updateItems(newItems)
    expect(wrapper.vm.customItems).toEqual(newItems)
  })

  it('应该支持添加面包屑项', () => {
    const wrapper = mount(BreadcrumbNav, {
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    const newItem = { title: '新项目', path: '/new' }
    wrapper.vm.addItem(newItem)
    expect(wrapper.vm.customItems).toContainEqual(newItem)

    // 测试在指定位置添加
    const anotherItem = { title: '另一个项目', path: '/another' }
    wrapper.vm.addItem(anotherItem, 0)
    expect(wrapper.vm.customItems[0]).toEqual(anotherItem)
  })

  it('应该支持删除面包屑项', () => {
    const wrapper = mount(BreadcrumbNav, {
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    // 先添加一些项目
    wrapper.vm.customItems = [
      { title: '项目1', path: '/1' },
      { title: '项目2', path: '/2' }
    ]

    wrapper.vm.removeItem(0)
    expect(wrapper.vm.customItems).toHaveLength(1)
    expect(wrapper.vm.customItems[0].title).toBe('项目2')
  })

  it('应该支持清空面包屑项', () => {
    const wrapper = mount(BreadcrumbNav, {
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    // 先添加一些项目
    wrapper.vm.customItems = [
      { title: '项目1', path: '/1' },
      { title: '项目2', path: '/2' }
    ]

    wrapper.vm.clearItems()
    expect(wrapper.vm.customItems).toHaveLength(0)
  })

  it('应该正确生成面包屑项', () => {
    const wrapper = mount(BreadcrumbNav, {
      props: {
        autoGenerate: true,
        showHome: false
      },
      global: {
        components: {
          ElIcon
        },
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    const breadcrumbs = wrapper.vm.generateBreadcrumbs()
    expect(breadcrumbs).toHaveLength(3)
    expect(breadcrumbs[0].title).toBe('仪表板')
    expect(breadcrumbs[1].title).toBe('用户管理')
    expect(breadcrumbs[2].title).toBe('用户列表')
    
    // 最后一项不应该有路径（不可点击）
    expect(breadcrumbs[2].path).toBeUndefined()
  })
})