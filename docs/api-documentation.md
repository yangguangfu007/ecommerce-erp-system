# ERP系统API接口文档

## 概述

本文档描述了电商ERP系统的REST API接口，包括认证方式、请求格式、响应格式以及各个模块的详细接口说明。

## 目录

1. [API概述](#API概述)
2. [认证方式](#认证方式)
3. [请求响应格式](#请求响应格式)
4. [用户管理API](#用户管理API)
5. [商品管理API](#商品管理API)
6. [订单管理API](#订单管理API)
7. [库存管理API](#库存管理API)
8. [平台管理API](#平台管理API)
9. [物流管理API](#物流管理API)
10. [通知管理API](#通知管理API)
11. [错误码说明](#错误码说明)

## API概述

### 基本信息

- **Base URL**: `https://api.erp.yourdomain.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API版本**: v1.0

### 通用HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证方式

### JWT Token认证

系统使用JWT（JSON Web Token）进行身份认证。

#### 获取Token

**请求**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**响应**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "roles": ["ADMIN"]
    }
  }
}
```

#### 使用Token

在后续的API请求中，需要在请求头中包含Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 刷新Token

**请求**
```http
POST /auth/refresh
Authorization: Bearer your_current_token
```

**响应**
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "new_jwt_token",
    "expires_in": 3600
  }
}
```

## 请求响应格式

### 请求格式

#### GET请求
```http
GET /api/products?page=1&size=10&keyword=手机
Authorization: Bearer your_token
```

#### POST请求
```http
POST /api/products
Authorization: Bearer your_token
Content-Type: application/json

{
  "sku": "SKU001",
  "name": "商品名称",
  "price": 99.99
}
```

#### PUT请求
```http
PUT /api/products/1
Authorization: Bearer your_token
Content-Type: application/json

{
  "name": "更新后的商品名称",
  "price": 89.99
}
```

#### DELETE请求
```http
DELETE /api/products/1
Authorization: Bearer your_token
```

### 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 分页响应
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      // 数据列表
    ],
    "page": 1,
    "size": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "INVALID_PARAMETER",
  "details": [
    {
      "field": "sku",
      "message": "SKU不能为空"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 用户管理API

### 1. 获取用户列表

**请求**
```http
GET /users?page=1&size=10&keyword=admin
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |
| keyword | string | 否 | 搜索关键词 |
| status | string | 否 | 用户状态：ACTIVE/INACTIVE |

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "status": "ACTIVE",
        "roles": ["ADMIN"],
        "createdAt": "2024-01-01T12:00:00Z",
        "lastLoginAt": "2024-01-01T12:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. 获取用户详情

**请求**
```http
GET /users/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": "ACTIVE",
    "roles": ["ADMIN"],
    "permissions": ["USER_READ", "USER_WRITE"],
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "lastLoginAt": "2024-01-01T12:00:00Z"
  }
}
```

### 3. 创建用户

**请求**
```http
POST /users
Content-Type: application/json

{
  "username": "newuser",
  "name": "新用户",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "password": "password123",
  "roles": ["USER"],
  "status": "ACTIVE"
}
```

**响应**
```json
{
  "code": 201,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "name": "新用户",
    "email": "newuser@example.com",
    "phone": "13800138001",
    "status": "ACTIVE",
    "roles": ["USER"],
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 4. 更新用户

**请求**
```http
PUT /users/{id}
Content-Type: application/json

{
  "name": "更新后的用户名",
  "email": "updated@example.com",
  "phone": "13800138002",
  "status": "ACTIVE"
}
```

**响应**
```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "name": "更新后的用户名",
    "email": "updated@example.com",
    "phone": "13800138002",
    "status": "ACTIVE",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 5. 删除用户

**请求**
```http
DELETE /users/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "用户删除成功"
}
```

## 商品管理API

### 1. 获取商品列表

**请求**
```http
GET /products?page=1&size=10&keyword=手机&category=电子产品
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 商品分类 |
| brand | string | 否 | 商品品牌 |
| status | string | 否 | 商品状态 |

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "id": 1,
        "sku": "SKU001",
        "name": "iPhone 15",
        "description": "苹果最新款手机",
        "category": "手机数码",
        "brand": "Apple",
        "price": 5999.00,
        "costPrice": 4500.00,
        "weight": 171,
        "dimensions": {
          "length": 147.6,
          "width": 71.6,
          "height": 7.8
        },
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "attributes": {
          "color": "黑色",
          "storage": "128GB"
        },
        "status": "ACTIVE",
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. 获取商品详情

**请求**
```http
GET /products/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "sku": "SKU001",
    "name": "iPhone 15",
    "description": "苹果最新款手机",
    "category": "手机数码",
    "brand": "Apple",
    "price": 5999.00,
    "costPrice": 4500.00,
    "weight": 171,
    "dimensions": {
      "length": 147.6,
      "width": 71.6,
      "height": 7.8
    },
    "images": [
      "https://example.com/image1.jpg"
    ],
    "attributes": {
      "color": "黑色",
      "storage": "128GB"
    },
    "status": "ACTIVE",
    "inventory": {
      "available": 100,
      "reserved": 10,
      "total": 110
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 3. 创建商品

**请求**
```http
POST /products
Content-Type: application/json

{
  "sku": "SKU002",
  "name": "Samsung Galaxy S24",
  "description": "三星最新款手机",
  "category": "手机数码",
  "brand": "Samsung",
  "price": 4999.00,
  "costPrice": 3500.00,
  "weight": 168,
  "dimensions": {
    "length": 146.3,
    "width": 70.9,
    "height": 7.6
  },
  "attributes": {
    "color": "白色",
    "storage": "256GB"
  },
  "status": "ACTIVE"
}
```

**响应**
```json
{
  "code": 201,
  "message": "商品创建成功",
  "data": {
    "id": 2,
    "sku": "SKU002",
    "name": "Samsung Galaxy S24",
    "price": 4999.00,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 4. 批量导入商品

**请求**
```http
POST /products/batch-import
Content-Type: multipart/form-data

file: products.xlsx
```

**响应**
```json
{
  "code": 200,
  "message": "批量导入完成",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "sku": "SKU010",
        "error": "SKU已存在"
      }
    ]
  }
}
```

## 订单管理API

### 1. 获取订单列表

**请求**
```http
GET /orders?page=1&size=10&status=PENDING&platform=WALMART
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |
| status | string | 否 | 订单状态 |
| platform | string | 否 | 平台名称 |
| storeId | long | 否 | 店铺ID |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "id": 1,
        "orderNumber": "ORD20240101001",
        "platformOrderId": "WM123456789",
        "platform": "WALMART",
        "storeId": 1,
        "storeName": "沃尔玛旗舰店",
        "status": "PENDING",
        "totalAmount": 299.99,
        "currency": "USD",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "shippingAddress": {
          "name": "John Doe",
          "address1": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US"
        },
        "items": [
          {
            "sku": "SKU001",
            "name": "iPhone 15",
            "quantity": 1,
            "unitPrice": 299.99,
            "totalPrice": 299.99
          }
        ],
        "orderDate": "2024-01-01T10:00:00Z",
        "createdAt": "2024-01-01T10:05:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. 获取订单详情

**请求**
```http
GET /orders/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "orderNumber": "ORD20240101001",
    "platformOrderId": "WM123456789",
    "platform": "WALMART",
    "storeId": 1,
    "storeName": "沃尔玛旗舰店",
    "status": "PENDING",
    "totalAmount": 299.99,
    "currency": "USD",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "shippingAddress": {
      "name": "John Doe",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "billingAddress": {
      "name": "John Doe",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "items": [
      {
        "id": 1,
        "sku": "SKU001",
        "name": "iPhone 15",
        "quantity": 1,
        "unitPrice": 299.99,
        "totalPrice": 299.99
      }
    ],
    "shipping": {
      "method": "Standard",
      "cost": 0.00,
      "trackingNumber": null,
      "carrier": null,
      "estimatedDelivery": null
    },
    "payment": {
      "method": "Credit Card",
      "status": "PAID",
      "transactionId": "TXN123456"
    },
    "notes": [],
    "orderDate": "2024-01-01T10:00:00Z",
    "createdAt": "2024-01-01T10:05:00Z",
    "updatedAt": "2024-01-01T10:05:00Z"
  }
}
```

### 3. 更新订单状态

**请求**
```http
PUT /orders/{id}/status
Content-Type: application/json

{
  "status": "CONFIRMED",
  "note": "订单已确认，准备发货"
}
```

**响应**
```json
{
  "code": 200,
  "message": "订单状态更新成功",
  "data": {
    "id": 1,
    "status": "CONFIRMED",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 4. 订单发货

**请求**
```http
POST /orders/{id}/ship
Content-Type: application/json

{
  "carrier": "UPS",
  "trackingNumber": "1Z999AA1234567890",
  "shippingMethod": "Ground",
  "estimatedDelivery": "2024-01-05T18:00:00Z"
}
```

**响应**
```json
{
  "code": 200,
  "message": "订单发货成功",
  "data": {
    "id": 1,
    "status": "SHIPPED",
    "shipping": {
      "carrier": "UPS",
      "trackingNumber": "1Z999AA1234567890",
      "shippingMethod": "Ground",
      "estimatedDelivery": "2024-01-05T18:00:00Z",
      "shippedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

## 库存管理API

### 1. 获取库存列表

**请求**
```http
GET /inventory?page=1&size=10&sku=SKU001&lowStock=true
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |
| sku | string | 否 | SKU编码 |
| storeId | long | 否 | 店铺ID |
| lowStock | boolean | 否 | 是否只显示低库存 |

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "id": 1,
        "sku": "SKU001",
        "productName": "iPhone 15",
        "storeId": 1,
        "storeName": "沃尔玛旗舰店",
        "availableQuantity": 95,
        "reservedQuantity": 5,
        "totalQuantity": 100,
        "safetyStock": 20,
        "status": "NORMAL",
        "lastUpdated": "2024-01-01T12:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. 获取库存详情

**请求**
```http
GET /inventory/{id}
```

**响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "sku": "SKU001",
    "productName": "iPhone 15",
    "storeId": 1,
    "storeName": "沃尔玛旗舰店",
    "availableQuantity": 95,
    "reservedQuantity": 5,
    "totalQuantity": 100,
    "safetyStock": 20,
    "status": "NORMAL",
    "warehouseLocation": "A-01-001",
    "recentTransactions": [
      {
        "id": 1,
        "type": "IN",
        "quantity": 100,
        "reason": "采购入库",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "lastUpdated": "2024-01-01T12:00:00Z"
  }
}
```

### 3. 调整库存

**请求**
```http
POST /inventory/{id}/adjust
Content-Type: application/json

{
  "type": "IN",
  "quantity": 50,
  "reason": "PURCHASE",
  "note": "新采购商品入库",
  "referenceNumber": "PO20240101001"
}
```

**参数说明**
- `type`: 调整类型，IN（入库）或OUT（出库）
- `quantity`: 调整数量
- `reason`: 调整原因，PURCHASE（采购）、RETURN（退货）、DAMAGE（损坏）、OTHER（其他）
- `note`: 备注说明
- `referenceNumber`: 参考单号

**响应**
```json
{
  "code": 200,
  "message": "库存调整成功",
  "data": {
    "id": 1,
    "sku": "SKU001",
    "availableQuantity": 145,
    "totalQuantity": 150,
    "transaction": {
      "id": 2,
      "type": "IN",
      "quantity": 50,
      "reason": "PURCHASE",
      "note": "新采购商品入库",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

## 错误码说明

### 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| SUCCESS | 200 | 操作成功 |
| INVALID_PARAMETER | 400 | 请求参数错误 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| USER_NOT_FOUND | 404 | 用户不存在 |
| USER_ALREADY_EXISTS | 400 | 用户已存在 |
| INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| TOKEN_EXPIRED | 401 | Token已过期 |
| PRODUCT_NOT_FOUND | 404 | 商品不存在 |
| SKU_ALREADY_EXISTS | 400 | SKU已存在 |
| INSUFFICIENT_INVENTORY | 400 | 库存不足 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| ORDER_STATUS_INVALID | 400 | 订单状态无效 |
| PLATFORM_API_ERROR | 500 | 平台API调用失败 |

### 错误响应示例

```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "INVALID_PARAMETER",
  "details": [
    {
      "field": "sku",
      "message": "SKU不能为空"
    },
    {
      "field": "price",
      "message": "价格必须大于0"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 联系信息

如有API相关问题，请联系：
- **技术支持**: api-support@company.com
- **开发文档**: https://docs.api.erp.yourdomain.com
- **API测试**: https://api-test.erp.yourdomain.com

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2024-01-01 | 初始版本 |
| v1.1 | 2024-02-01 | 新增批量操作接口 |
| v1.2 | 2024-03-01 | 优化错误处理 |