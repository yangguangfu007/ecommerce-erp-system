/**
 * 错误处理相关类型定义
 * 根据后端实际实现统一错误响应格式
 */

// 统一错误码定义
export enum ErrorCode {
  // 通用错误
  SUCCESS = 200,
  INVALID_PARAMETER = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
  
  // 用户相关错误
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 商品相关错误
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  SKU_ALREADY_EXISTS = 'SKU_ALREADY_EXISTS',
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY'
}

// 错误详情接口
export interface ErrorDetail {
  field: string        // 错误字段
  message: string      // 错误消息
  value?: any         // 错误值
}

// 业务异常类
export class BusinessError extends Error {
  constructor(
    message: string,
    public errorCode?: string,
    public details?: ErrorDetail[]
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

// 系统异常类
export class SystemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SystemError'
  }
}

// 验证错误接口
export interface ValidationError {
  field: string
  message: string
  value?: any
}

// 错误处理器接口
export interface ErrorHandler {
  handleValidationError(errors: ValidationError[]): void
  handleBusinessError(errorCode: string, message: string, details?: ErrorDetail[]): void
  handleSystemError(error: Error): void
}