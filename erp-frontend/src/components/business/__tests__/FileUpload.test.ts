import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElProgress, ElIcon, ElDialog } from 'element-plus'
import FileUpload from '../FileUpload.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElProgress: { name: 'ElProgress', template: '<div class="progress" />' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' },
  ElDialog: { name: 'ElDialog', template: '<div><slot /></div>' },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('FileUpload', () => {
  it('应该正确渲染文件上传组件', () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    expect(wrapper.find('.file-upload').exists()).toBe(true)
    expect(wrapper.find('.upload-area').exists()).toBe(true)
  })

  it('应该显示上传按钮', () => {
    const wrapper = mount(FileUpload, {
      props: {
        showButton: true
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('应该隐藏上传按钮', () => {
    const wrapper = mount(FileUpload, {
      props: {
        showButton: false
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    expect(wrapper.find('.btn-primary').exists()).toBe(false)
  })

  it('应该支持禁用状态', () => {
    const wrapper = mount(FileUpload, {
      props: {
        disabled: true
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    expect(wrapper.find('.upload-area-disabled').exists()).toBe(true)
  })

  it('应该正确验证文件类型', () => {
    const wrapper = mount(FileUpload, {
      props: {
        accept: '.jpg,.png'
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' })
    const error = wrapper.vm.validateFile(mockFile)
    expect(error).toContain('不支持的文件类型')
  })

  it('应该正确验证文件大小', () => {
    const wrapper = mount(FileUpload, {
      props: {
        maxSize: 1 // 1MB
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    // 创建一个2MB的文件
    const mockFile = new File(['x'.repeat(2 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
    const error = wrapper.vm.validateFile(mockFile)
    expect(error).toContain('文件大小不能超过')
  })

  it('应该正确验证文件数量', () => {
    const wrapper = mount(FileUpload, {
      props: {
        multiple: false
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    // 添加一个文件到内部列表
    wrapper.vm.internalFileList = [{
      uid: '1',
      name: 'existing.jpg',
      size: 1024,
      type: 'image/jpeg',
      status: 'success'
    }]

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const error = wrapper.vm.validateFile(mockFile)
    expect(error).toContain('只能上传一个文件')
  })

  it('应该正确格式化文件大小', () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    expect(wrapper.vm.formatFileSize(0)).toBe('0 B')
    expect(wrapper.vm.formatFileSize(1024)).toBe('1 KB')
    expect(wrapper.vm.formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(wrapper.vm.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('应该正确判断文件类型', () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const imageFile = { type: 'image/jpeg' }
    const docFile = { type: 'application/pdf' }
    const videoFile = { type: 'video/mp4' }
    const audioFile = { type: 'audio/mp3' }

    expect(wrapper.vm.isImage(imageFile)).toBe(true)
    expect(wrapper.vm.isDocument(docFile)).toBe(true)
    expect(wrapper.vm.isVideo(videoFile)).toBe(true)
    expect(wrapper.vm.isAudio(audioFile)).toBe(true)
  })

  it('应该支持拖拽上传', async () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const uploadArea = wrapper.find('.upload-area')
    
    // 模拟拖拽进入
    await uploadArea.trigger('dragover')
    expect(wrapper.vm.isDragOver).toBe(true)

    // 模拟拖拽离开
    await uploadArea.trigger('dragleave')
    expect(wrapper.vm.isDragOver).toBe(false)
  })

  it('应该支持多文件上传', () => {
    const wrapper = mount(FileUpload, {
      props: {
        multiple: true,
        maxCount: 5
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const mockFiles = [
      new File([''], 'test1.jpg', { type: 'image/jpeg' }),
      new File([''], 'test2.jpg', { type: 'image/jpeg' })
    ]

    wrapper.vm.processFiles(mockFiles)
    expect(wrapper.vm.internalFileList).toHaveLength(2)
  })

  it('应该触发上传事件', async () => {
    const wrapper = mount(FileUpload, {
      props: {
        autoUpload: true
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    wrapper.vm.processFiles([mockFile])

    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('应该支持删除文件', async () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    // 添加一个文件
    wrapper.vm.internalFileList = [{
      uid: '1',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      status: 'success',
      url: 'blob:mock-url'
    }]

    await wrapper.vm.handleRemove(0)
    expect(wrapper.vm.internalFileList).toHaveLength(0)
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('应该支持预览文件', async () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    const mockFile = {
      uid: '1',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      status: 'success',
      url: 'blob:mock-url'
    }

    await wrapper.vm.handlePreview(mockFile)
    expect(wrapper.vm.previewVisible).toBe(true)
    expect(wrapper.vm.previewFile).toEqual(mockFile)
    expect(wrapper.emitted('preview')).toBeTruthy()
  })

  it('应该支持清空文件', () => {
    const wrapper = mount(FileUpload, {
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    // 添加一些文件
    wrapper.vm.internalFileList = [
      {
        uid: '1',
        name: 'test1.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'success',
        url: 'blob:mock-url'
      },
      {
        uid: '2',
        name: 'test2.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'success'
      }
    ]

    wrapper.vm.clearFiles()
    expect(wrapper.vm.internalFileList).toHaveLength(0)
    expect(wrapper.vm.errorMessage).toBe('')
  })

  it('应该支持手动上传', () => {
    const wrapper = mount(FileUpload, {
      props: {
        autoUpload: false
      },
      global: {
        components: {
          ElButton,
          ElProgress,
          ElIcon,
          ElDialog
        }
      }
    })

    // 添加一些待上传的文件
    wrapper.vm.internalFileList = [
      {
        uid: '1',
        name: 'test1.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'ready'
      },
      {
        uid: '2',
        name: 'test2.jpg',
        size: 1024,
        type: 'image/jpeg',
        status: 'ready'
      }
    ]

    wrapper.vm.uploadFiles()
    
    // 检查文件状态是否变为上传中
    expect(wrapper.vm.internalFileList[0].status).toBe('uploading')
    expect(wrapper.vm.internalFileList[1].status).toBe('uploading')
  })
})