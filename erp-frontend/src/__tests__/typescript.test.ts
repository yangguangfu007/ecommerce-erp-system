import { describe, it, expect } from 'vitest'

// 测试接口定义
interface TestUser {
  id: number
  name: string
  email?: string
}

// 测试类型别名
type TestStatus = 'active' | 'inactive' | 'pending'

// 测试泛型
interface TestResponse<T> {
  data: T
  message: string
  success: boolean
}

describe('TypeScript 配置测试', () => {
  it('应该支持接口定义', () => {
    const user: TestUser = {
      id: 1,
      name: '测试用户'
    }

    expect(user.id).toBe(1)
    expect(user.name).toBe('测试用户')
    expect(user.email).toBeUndefined()
  })

  it('应该支持类型别名', () => {
    const status: TestStatus = 'active'
    expect(status).toBe('active')

    // 类型检查应该在编译时进行
    const validStatuses: TestStatus[] = ['active', 'inactive', 'pending']
    expect(validStatuses).toHaveLength(3)
  })

  it('应该支持泛型', () => {
    const response: TestResponse<TestUser> = {
      data: { id: 1, name: '测试用户' },
      message: '成功',
      success: true
    }

    expect(response.data.id).toBe(1)
    expect(response.success).toBe(true)
  })

  it('应该支持可选属性', () => {
    const userWithEmail: TestUser = {
      id: 1,
      name: '测试用户',
      email: 'test@example.com'
    }

    const userWithoutEmail: TestUser = {
      id: 2,
      name: '测试用户2'
    }

    expect(userWithEmail.email).toBe('test@example.com')
    expect(userWithoutEmail.email).toBeUndefined()
  })

  it('应该支持数组类型', () => {
    const numbers: number[] = [1, 2, 3, 4, 5]
    const users: TestUser[] = [
      { id: 1, name: '用户1' },
      { id: 2, name: '用户2' }
    ]

    expect(numbers).toHaveLength(5)
    expect(users).toHaveLength(2)
    expect(users[0].name).toBe('用户1')
  })

  it('应该支持函数类型', () => {
    const add = (a: number, b: number): number => a + b
    const greet = (name: string): string => `Hello, ${name}!`

    expect(add(2, 3)).toBe(5)
    expect(greet('World')).toBe('Hello, World!')
  })

  it('应该支持枚举', () => {
    enum Color {
      Red = 'red',
      Green = 'green',
      Blue = 'blue'
    }

    expect(Color.Red).toBe('red')
    expect(Color.Green).toBe('green')
    expect(Color.Blue).toBe('blue')
  })

  it('应该支持联合类型', () => {
    type StringOrNumber = string | number
    
    const value1: StringOrNumber = 'hello'
    const value2: StringOrNumber = 42

    expect(typeof value1).toBe('string')
    expect(typeof value2).toBe('number')
  })

  it('应该支持类型断言', () => {
    const someValue: unknown = 'this is a string'
    const strLength = (someValue as string).length

    expect(strLength).toBe(16)
  })
})