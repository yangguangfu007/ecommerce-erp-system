# ERP 系统 API 接口文档

## 概述

本文档描述了电商 ERP 系统的 REST API 接口，包括认证方式、请求格式、响应格式以及各个模块的详细接口说明。

## 目录

1. [API 概述](#API概述)
2. [认证方式](#认证方式)
3. [请求响应格式](#请求响应格式)
4. [用户管理 API](#用户管理API)
5. [商品管理 API](#商品管理API)
6. [订单管理 API](#订单管理API)
7. [库存管理 API](#库存管理API)
8. [平台管理 API](#平台管理API)
9. [物流管理 API](#物流管理API)
10. [通知管理 API](#通知管理API)
11. [错误码说明](#错误码说明)

## API 概述

### 基本信息

- **Base URL**: `http://localhost:8080/api` (开发环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API 版本**: v1.0

### 重要字段说明

#### 用户相关字段
- **realName**: 用户真实姓名（统一字段名，后端返回字段，前端直接使用）
- **status**: 用户状态，数字类型（0-禁用，1-启用）
- **statusStr**: 用户状态字符串（ACTIVE/INACTIVE，由前端根据status计算）
- **locked**: 锁定状态，数字类型（0-未锁定，1-锁定）
- **createTime**: 创建时间字段（后端返回格式）
- **roleNames**: 角色名称数组（后端返回字段）

#### 商品相关字段
- **name**: 商品名称（统一字段名，后端返回字段，前端直接使用）
- **categoryId**: 分类ID，数字类型（后端返回格式）
- **categoryName**: 分类名称，字符串类型（用于显示）
- **dimensions**: 商品尺寸，字符串格式（如："147.6x71.6x7.8"）
- **status**: 商品状态，枚举类型（ACTIVE/INACTIVE/DELETED）
- **createTime/updateTime**: 时间字段（后端返回格式）

#### 响应格式统一
- 所有API响应都包含 `timestamp` 字段
- 分页响应使用 `content` 数组包含数据列表
- 分页信息包含 `page`（当前页码，从1开始）、`size`（每页大小）、`total`（总记录数）、`totalPages`（总页数）
- 错误响应包含 `error`（错误码） 和 `details`（错误详情）字段

### 通用 HTTP 状态码

| 状态码 | 说明           |
| ------ | -------------- |
| 200    | 请求成功       |
| 201    | 创建成功       |
| 400    | 请求参数错误   |
| 401    | 未授权         |
| 403    | 禁止访问       |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |

## 认证方式

### JWT Token 认证

系统使用 JWT（JSON Web Token）进行身份认证。

#### 获取 Token

**请求**

```http
POST /users/login
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "nickname": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "avatar": null,
      "status": 1,
      "locked": 0,
      "roleNames": ["系统管理员"],
      "roles": [
        {
          "id": 1,
          "roleName": "系统管理员",
          "roleCode": "ADMIN",
          "description": "系统管理员角色"
        }
      ],
      "permissions": ["USER_READ", "USER_WRITE", "PRODUCT_READ", "PRODUCT_WRITE"],
      "createTime": "2024-01-01T12:00:00Z",
      "lastLoginTime": "2024-01-01T12:00:00Z",
      "lastLoginIp": "127.0.0.1",
      "remark": "系统默认管理员账户"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 使用 Token

在后续的 API 请求中，需要在请求头中包含 Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 刷新 Token

**请求**

```http
POST /users/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

**响应**

```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 请求响应格式

### 请求格式

#### GET 请求

```http
GET /api/products?page=1&size=10&keyword=手机
Authorization: Bearer your_token
```

#### POST 请求

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

#### PUT 请求

```http
PUT /api/products/1
Authorization: Bearer your_token
Content-Type: application/json

{
  "name": "更新后的商品名称",
  "price": 89.99
}
```

#### DELETE 请求

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

## 用户管理 API

### 1. 获取用户列表

**请求**

```http
GET /users?page=1&size=10&username=admin&realName=管理员&status=1
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| username | string | 否 | 用户名搜索 |
| realName | string | 否 | 真实姓名搜索 |
| status | int | 否 | 用户状态：0-禁用，1-启用 |

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
        "realName": "系统管理员",
        "nickname": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "avatar": null,
        "status": 1,
        "locked": 0,
        "roleNames": ["系统管理员"],
        "roles": [
          {
            "id": 1,
            "roleName": "系统管理员",
            "roleCode": "ADMIN",
            "description": "系统管理员角色"
          }
        ],
        "permissions": ["USER_READ", "USER_WRITE"],
        "createTime": "2024-01-01T12:00:00Z",
        "lastLoginTime": "2024-01-01T12:00:00Z",
        "lastLoginIp": "127.0.0.1",
        "remark": "系统默认管理员账户"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
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
    "realName": "系统管理员",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": null,
    "status": 1,
    "locked": 0,
    "roleNames": ["系统管理员"],
    "roles": [
      {
        "id": 1,
        "roleName": "系统管理员",
        "roleCode": "ADMIN",
        "description": "系统管理员角色"
      }
    ],
    "permissions": ["USER_READ", "USER_WRITE"],
    "createTime": "2024-01-01T12:00:00Z",
    "lastLoginTime": "2024-01-01T12:00:00Z",
    "lastLoginIp": "127.0.0.1",
    "remark": "系统默认管理员账户"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. 创建用户

**请求**

```http
POST /users
Content-Type: application/json

{
  "username": "newuser",
  "realName": "新用户",
  "nickname": "测试用户",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "password": "password123",
  "status": 1,
  "remark": "测试账户"
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
    "realName": "新用户",
    "nickname": "测试用户",
    "email": "newuser@example.com",
    "phone": "13800138001",
    "avatar": null,
    "status": 1,
    "locked": 0,
    "roleNames": [],
    "roles": [],
    "permissions": [],
    "createTime": "2024-01-01T12:00:00Z",
    "lastLoginTime": null,
    "lastLoginIp": null,
    "remark": "测试账户"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. 更新用户

**请求**

```http
PUT /users/{id}
Content-Type: application/json

{
  "realName": "更新后的真实姓名",
  "nickname": "更新后的昵称",
  "email": "updated@example.com",
  "phone": "13800138002",
  "status": 1,
  "remark": "更新后的备注"
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
    "realName": "更新后的真实姓名",
    "nickname": "更新后的昵称",
    "email": "updated@example.com",
    "phone": "13800138002",
    "avatar": null,
    "status": 1,
    "locked": 0,
    "roleNames": [],
    "roles": [],
    "permissions": [],
    "createTime": "2024-01-01T12:00:00Z",
    "lastLoginTime": null,
    "lastLoginIp": null,
    "remark": "更新后的备注"
  },
  "timestamp": "2024-01-01T12:00:00Z"
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
  "message": "用户删除成功",
  "data": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 商品管理 API

### 1. 获取商品列表

**请求**

```http
GET /products?page=1&size=10&keyword=手机&category=电子产品
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| keyword | string | 否 | 搜索关键词 |
| name | string | 否 | 商品名称 |
| categoryId | int | 否 | 商品分类ID |
| brand | string | 否 | 商品品牌 |
| status | string | 否 | 商品状态：ACTIVE/INACTIVE/DELETED |

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
        "categoryId": 1,
        "categoryName": "手机数码",
        "brand": "Apple",
        "price": 5999.0,
        "costPrice": 4500.0,
        "weight": 171,
        "dimensions": "147.6x71.6x7.8",
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "attributes": {
          "color": "黑色",
          "storage": "128GB"
        },
        "status": "ACTIVE",
        "createTime": "2024-01-01T12:00:00Z",
        "updateTime": "2024-01-01T12:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
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
    "categoryId": 1,
    "categoryName": "手机数码",
    "brand": "Apple",
    "price": 5999.0,
    "costPrice": 4500.0,
    "weight": 171,
    "dimensions": "147.6x71.6x7.8",
    "images": ["https://example.com/image1.jpg"],
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
    "createTime": "2024-01-01T12:00:00Z",
    "updateTime": "2024-01-01T12:00:00Z"
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
  "categoryId": 1,
  "brand": "Samsung",
  "price": 4999.00,
  "costPrice": 3500.00,
  "weight": 168,
  "dimensions": "146.3x70.9x7.6",
  "images": ["https://example.com/image1.jpg"],
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
    "description": "三星最新款手机",
    "categoryId": 1,
    "categoryName": "手机数码",
    "brand": "Samsung",
    "price": 4999.0,
    "costPrice": 3500.0,
    "weight": 168,
    "dimensions": "146.3x70.9x7.6",
    "images": ["https://example.com/image1.jpg"],
    "attributes": {
      "color": "白色",
      "storage": "256GB"
    },
    "status": "ACTIVE",
    "createTime": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
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

## 订单管理 API

### 1. 获取订单列表

**请求**

```http
GET /orders?page=1&size=10&status=PENDING&platform=WALMART
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| status | string | 否 | 订单状态 |
| platform | string | 否 | 平台名称 |
| storeId | long | 否 | 店铺 ID |
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
        "createTime": "2024-01-01T10:05:00Z"
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
      "cost": 0.0,
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
    "createTime": "2024-01-01T10:05:00Z",
    "updateTime": "2024-01-01T10:05:00Z"
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
    "updateTime": "2024-01-01T12:00:00Z"
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

## 库存管理 API

### 1. 获取库存列表

**请求**

```http
GET /inventory?page=1&size=10&sku=SKU001&lowStock=true
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| sku | string | 否 | SKU 编码 |
| storeId | long | 否 | 店铺 ID |
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
        "createTime": "2024-01-01T10:00:00Z"
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

- `type`: 调整类型，IN（入库）或 OUT（出库）
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
      "createTime": "2024-01-01T12:00:00Z"
    }
  }
}
```

## 平台管理 API

### 1. 获取平台列表

**请求**

```http
GET /platforms?page=1&size=10&name=沃尔玛&type=WALMART&status=ACTIVE
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| name | string | 否 | 平台名称搜索 |
| type | string | 否 | 平台类型：WALMART/AMAZON/EBAY |
| status | string | 否 | 平台状态：ACTIVE/INACTIVE/ERROR |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "沃尔玛旗舰店",
        "type": "WALMART",
        "status": "ACTIVE",
        "config": {
          "apiKey": "WM_API_KEY_***",
          "apiSecret": "WM_SECRET_***",
          "endpoint": "https://marketplace.walmartapis.com",
          "storeId": "12345",
          "additionalParams": {
            "region": "US",
            "currency": "USD"
          }
        },
        "lastSyncTime": "2024-01-01T12:00:00Z",
        "syncStatus": "SUCCESS",
        "errorMessage": null,
        "createTime": "2024-01-01T10:00:00Z",
        "updateTime": "2024-01-01T12:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. 获取平台详情

**请求**

```http
GET /platforms/{id}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "沃尔玛旗舰店",
    "type": "WALMART",
    "status": "ACTIVE",
    "config": {
      "apiKey": "WM_API_KEY_***",
      "apiSecret": "WM_SECRET_***",
      "endpoint": "https://marketplace.walmartapis.com",
      "storeId": "12345",
      "additionalParams": {
        "region": "US",
        "currency": "USD"
      }
    },
    "lastSyncTime": "2024-01-01T12:00:00Z",
    "syncStatus": "SUCCESS",
    "errorMessage": null,
    "statistics": {
      "totalProducts": 1250,
      "totalOrders": 3456,
      "totalSales": 125000.50,
      "lastOrderTime": "2024-01-01T11:30:00Z"
    },
    "createTime": "2024-01-01T10:00:00Z",
    "updateTime": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. 获取平台配置

**请求**

```http
GET /platforms/config?platformId=1
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platformId | long | 是 | 平台ID |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "platformId": 1,
    "platformName": "沃尔玛旗舰店",
    "platformType": "WALMART",
    "config": {
      "apiKey": "WM_API_KEY_***",
      "apiSecret": "WM_SECRET_***",
      "endpoint": "https://marketplace.walmartapis.com",
      "storeId": "12345",
      "additionalParams": {
        "region": "US",
        "currency": "USD",
        "timeout": 30000,
        "retryCount": 3
      }
    },
    "syncSettings": {
      "autoSync": true,
      "syncInterval": 300,
      "syncProducts": true,
      "syncOrders": true,
      "syncInventory": true
    },
    "lastUpdated": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. 创建平台配置

**请求**

```http
POST /platforms/config
Content-Type: application/json

{
  "name": "亚马逊旗舰店",
  "type": "AMAZON",
  "config": {
    "apiKey": "AMAZON_API_KEY",
    "apiSecret": "AMAZON_SECRET",
    "endpoint": "https://sellingpartnerapi-na.amazon.com",
    "storeId": "A1234567890",
    "additionalParams": {
      "region": "US",
      "currency": "USD",
      "marketplaceId": "ATVPDKIKX0DER"
    }
  },
  "syncSettings": {
    "autoSync": true,
    "syncInterval": 600,
    "syncProducts": true,
    "syncOrders": true,
    "syncInventory": true
  }
}
```

**响应**

```json
{
  "code": 201,
  "message": "平台配置创建成功",
  "data": {
    "id": 2,
    "name": "亚马逊旗舰店",
    "type": "AMAZON",
    "status": "INACTIVE",
    "config": {
      "apiKey": "AMAZON_API_KEY_***",
      "apiSecret": "AMAZON_SECRET_***",
      "endpoint": "https://sellingpartnerapi-na.amazon.com",
      "storeId": "A1234567890",
      "additionalParams": {
        "region": "US",
        "currency": "USD",
        "marketplaceId": "ATVPDKIKX0DER"
      }
    },
    "syncSettings": {
      "autoSync": true,
      "syncInterval": 600,
      "syncProducts": true,
      "syncOrders": true,
      "syncInventory": true
    },
    "createTime": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 5. 更新平台配置

**请求**

```http
PUT /platforms/config/{platformId}
Content-Type: application/json

{
  "name": "更新后的平台名称",
  "config": {
    "apiKey": "NEW_API_KEY",
    "apiSecret": "NEW_SECRET",
    "endpoint": "https://new-endpoint.com",
    "storeId": "NEW_STORE_ID",
    "additionalParams": {
      "region": "US",
      "currency": "USD",
      "timeout": 60000
    }
  },
  "syncSettings": {
    "autoSync": false,
    "syncInterval": 1800,
    "syncProducts": true,
    "syncOrders": true,
    "syncInventory": false
  }
}
```

**响应**

```json
{
  "code": 200,
  "message": "平台配置更新成功",
  "data": {
    "id": 1,
    "name": "更新后的平台名称",
    "type": "WALMART",
    "status": "ACTIVE",
    "config": {
      "apiKey": "NEW_API_KEY_***",
      "apiSecret": "NEW_SECRET_***",
      "endpoint": "https://new-endpoint.com",
      "storeId": "NEW_STORE_ID",
      "additionalParams": {
        "region": "US",
        "currency": "USD",
        "timeout": 60000
      }
    },
    "syncSettings": {
      "autoSync": false,
      "syncInterval": 1800,
      "syncProducts": true,
      "syncOrders": true,
      "syncInventory": false
    },
    "updateTime": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 6. 获取平台状态监控

**请求**

```http
GET /platforms/status?platformId=1
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platformId | long | 否 | 平台ID，不传则返回所有平台状态 |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "platformId": 1,
      "platformName": "沃尔玛旗舰店",
      "platformType": "WALMART",
      "status": "ACTIVE",
      "connectionStatus": "CONNECTED",
      "lastHeartbeat": "2024-01-01T12:00:00Z",
      "responseTime": 250,
      "apiQuota": {
        "limit": 10000,
        "used": 2500,
        "remaining": 7500,
        "resetTime": "2024-01-02T00:00:00Z"
      },
      "syncStatus": {
        "lastSyncTime": "2024-01-01T11:30:00Z",
        "nextSyncTime": "2024-01-01T11:35:00Z",
        "syncResult": "SUCCESS",
        "syncedProducts": 1250,
        "syncedOrders": 45,
        "errorCount": 0
      },
      "healthCheck": {
        "overall": "HEALTHY",
        "apiConnection": "HEALTHY",
        "authentication": "HEALTHY",
        "dataSync": "HEALTHY"
      }
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 7. 平台同步操作

**请求**

```http
POST /platforms/{id}/sync
Content-Type: application/json

{
  "syncType": "FULL",
  "syncScope": ["PRODUCTS", "ORDERS", "INVENTORY"],
  "force": false
}
```

**参数说明**

- `syncType`: 同步类型，FULL（全量同步）或 INCREMENTAL（增量同步）
- `syncScope`: 同步范围，可选值：PRODUCTS（商品）、ORDERS（订单）、INVENTORY（库存）
- `force`: 是否强制同步，忽略上次同步时间

**响应**

```json
{
  "code": 200,
  "message": "同步任务已启动",
  "data": {
    "taskId": "SYNC_TASK_20240101_001",
    "platformId": 1,
    "platformName": "沃尔玛旗舰店",
    "syncType": "FULL",
    "syncScope": ["PRODUCTS", "ORDERS", "INVENTORY"],
    "status": "RUNNING",
    "startTime": "2024-01-01T12:00:00Z",
    "estimatedDuration": 1800,
    "progress": {
      "totalSteps": 3,
      "completedSteps": 0,
      "currentStep": "PRODUCTS",
      "percentage": 0
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 8. 获取同步任务状态

**请求**

```http
GET /platforms/sync/status/{taskId}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "taskId": "SYNC_TASK_20240101_001",
    "platformId": 1,
    "platformName": "沃尔玛旗舰店",
    "syncType": "FULL",
    "syncScope": ["PRODUCTS", "ORDERS", "INVENTORY"],
    "status": "COMPLETED",
    "startTime": "2024-01-01T12:00:00Z",
    "endTime": "2024-01-01T12:25:00Z",
    "duration": 1500,
    "progress": {
      "totalSteps": 3,
      "completedSteps": 3,
      "currentStep": "COMPLETED",
      "percentage": 100
    },
    "result": {
      "success": true,
      "syncedProducts": 1250,
      "syncedOrders": 45,
      "syncedInventory": 1250,
      "errors": [],
      "warnings": [
        {
          "type": "PRODUCT_MAPPING",
          "message": "部分商品SKU映射失败",
          "count": 5
        }
      ]
    }
  },
  "timestamp": "2024-01-01T12:30:00Z"
}
```

### 9. 测试平台连接

**请求**

```http
POST /platforms/{id}/test-connection
```

**响应**

```json
{
  "code": 200,
  "message": "连接测试完成",
  "data": {
    "platformId": 1,
    "platformName": "沃尔玛旗舰店",
    "connectionTest": {
      "success": true,
      "responseTime": 245,
      "testTime": "2024-01-01T12:00:00Z"
    },
    "authenticationTest": {
      "success": true,
      "message": "认证成功"
    },
    "apiTest": {
      "success": true,
      "testedEndpoints": [
        {
          "endpoint": "/v3/items",
          "method": "GET",
          "status": "SUCCESS",
          "responseTime": 180
        }
      ]
    },
    "overall": "SUCCESS"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 物流管理 API

### 1. 获取物流订单列表

**请求**

```http
GET /logistics/orders?page=1&size=10&status=PENDING&carrier=UPS&trackingNumber=1Z999AA1234567890
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| status | string | 否 | 物流状态：PENDING/SHIPPED/IN_TRANSIT/DELIVERED/EXCEPTION |
| carrier | string | 否 | 承运商：UPS/FEDEX/DHL/USPS |
| trackingNumber | string | 否 | 运单号搜索 |
| orderId | long | 否 | 订单ID |
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
        "orderId": 1001,
        "orderNumber": "ORD20240101001",
        "trackingNumber": "1Z999AA1234567890",
        "carrier": "UPS",
        "carrierService": "UPS Ground",
        "status": "IN_TRANSIT",
        "shippingAddress": {
          "name": "John Doe",
          "phone": "+1234567890",
          "address1": "123 Main St",
          "address2": "Apt 4B",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US"
        },
        "packageInfo": {
          "weight": 2.5,
          "dimensions": {
            "length": 30.0,
            "width": 20.0,
            "height": 10.0,
            "unit": "cm"
          },
          "packageType": "BOX"
        },
        "shippingCost": 15.99,
        "currency": "USD",
        "estimatedDelivery": "2024-01-05T18:00:00Z",
        "actualDelivery": null,
        "shippedAt": "2024-01-01T10:00:00Z",
        "lastUpdated": "2024-01-03T14:30:00Z",
        "createTime": "2024-01-01T09:30:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2024-01-03T15:00:00Z"
}
```

### 2. 获取物流订单详情

**请求**

```http
GET /logistics/orders/{id}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "orderId": 1001,
    "orderNumber": "ORD20240101001",
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "carrierService": "UPS Ground",
    "status": "IN_TRANSIT",
    "shippingAddress": {
      "name": "John Doe",
      "phone": "+1234567890",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "packageInfo": {
      "weight": 2.5,
      "dimensions": {
        "length": 30.0,
        "width": 20.0,
        "height": 10.0,
        "unit": "cm"
      },
      "packageType": "BOX",
      "items": [
        {
          "sku": "SKU001",
          "name": "iPhone 15",
          "quantity": 1,
          "weight": 0.171
        }
      ]
    },
    "shippingCost": 15.99,
    "currency": "USD",
    "estimatedDelivery": "2024-01-05T18:00:00Z",
    "actualDelivery": null,
    "shippedAt": "2024-01-01T10:00:00Z",
    "trackingEvents": [
      {
        "timestamp": "2024-01-01T10:00:00Z",
        "status": "SHIPPED",
        "location": "New York, NY",
        "description": "包裹已发出"
      },
      {
        "timestamp": "2024-01-02T08:30:00Z",
        "status": "IN_TRANSIT",
        "location": "Philadelphia, PA",
        "description": "包裹运输中"
      },
      {
        "timestamp": "2024-01-03T14:30:00Z",
        "status": "IN_TRANSIT",
        "location": "Baltimore, MD",
        "description": "包裹运输中"
      }
    ],
    "lastUpdated": "2024-01-03T14:30:00Z",
    "createTime": "2024-01-01T09:30:00Z"
  },
  "timestamp": "2024-01-03T15:00:00Z"
}
```

### 3. 生成面单

**请求**

```http
POST /logistics/labels
Content-Type: application/json

{
  "orderId": 1002,
  "carrier": "UPS",
  "service": "UPS Ground",
  "fromAddress": {
    "name": "ERP Warehouse",
    "company": "ERP Company",
    "phone": "+1234567890",
    "address1": "456 Warehouse St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "US"
  },
  "toAddress": {
    "name": "Jane Smith",
    "phone": "+0987654321",
    "address1": "789 Customer Ave",
    "address2": "Suite 100",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "country": "US"
  },
  "packageInfo": {
    "weight": 1.8,
    "dimensions": {
      "length": 25.0,
      "width": 15.0,
      "height": 8.0,
      "unit": "cm"
    },
    "packageType": "BOX",
    "items": [
      {
        "sku": "SKU002",
        "name": "Samsung Galaxy S24",
        "quantity": 1,
        "value": 999.99,
        "weight": 0.168
      }
    ]
  },
  "insurance": {
    "enabled": true,
    "value": 999.99
  },
  "options": {
    "signatureRequired": false,
    "saturdayDelivery": false,
    "adultSignature": false
  }
}
```

**响应**

```json
{
  "code": 201,
  "message": "面单生成成功",
  "data": {
    "labelId": "LBL20240101001",
    "orderId": 1002,
    "trackingNumber": "1Z999BB9876543210",
    "carrier": "UPS",
    "service": "UPS Ground",
    "labelUrl": "https://api.erp.com/logistics/labels/LBL20240101001/download",
    "labelFormat": "PDF",
    "shippingCost": 12.45,
    "currency": "USD",
    "estimatedDelivery": "2024-01-06T18:00:00Z",
    "packageInfo": {
      "weight": 1.8,
      "dimensions": {
        "length": 25.0,
        "width": 15.0,
        "height": 8.0,
        "unit": "cm"
      },
      "packageType": "BOX"
    },
    "createTime": "2024-01-01T15:00:00Z",
    "expiresAt": "2024-01-08T15:00:00Z"
  },
  "timestamp": "2024-01-01T15:00:00Z"
}
```

### 4. 批量生成面单

**请求**

```http
POST /logistics/labels/batch
Content-Type: application/json

{
  "orderIds": [1003, 1004, 1005],
  "carrier": "FEDEX",
  "service": "FedEx Ground",
  "fromAddress": {
    "name": "ERP Warehouse",
    "company": "ERP Company",
    "phone": "+1234567890",
    "address1": "456 Warehouse St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "US"
  },
  "options": {
    "signatureRequired": false,
    "saturdayDelivery": false
  }
}
```

**响应**

```json
{
  "code": 200,
  "message": "批量面单生成完成",
  "data": {
    "batchId": "BATCH_20240101_001",
    "total": 3,
    "success": 2,
    "failed": 1,
    "results": [
      {
        "orderId": 1003,
        "success": true,
        "labelId": "LBL20240101002",
        "trackingNumber": "1234567890123456",
        "labelUrl": "https://api.erp.com/logistics/labels/LBL20240101002/download"
      },
      {
        "orderId": 1004,
        "success": true,
        "labelId": "LBL20240101003",
        "trackingNumber": "1234567890123457",
        "labelUrl": "https://api.erp.com/logistics/labels/LBL20240101003/download"
      },
      {
        "orderId": 1005,
        "success": false,
        "error": "INVALID_ADDRESS",
        "message": "收货地址不完整"
      }
    ],
    "batchLabelUrl": "https://api.erp.com/logistics/labels/batch/BATCH_20240101_001/download",
    "createTime": "2024-01-01T16:00:00Z"
  },
  "timestamp": "2024-01-01T16:00:00Z"
}
```

### 5. 物流跟踪查询

**请求**

```http
GET /logistics/tracking/{trackingNumber}?carrier=UPS
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| trackingNumber | string | 是 | 运单号 |
| carrier | string | 否 | 承运商，不传则自动识别 |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "trackingNumber": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "DELIVERED",
    "estimatedDelivery": "2024-01-05T18:00:00Z",
    "actualDelivery": "2024-01-05T16:45:00Z",
    "recipient": "John Doe",
    "deliveryLocation": "Front Door",
    "signedBy": "John Doe",
    "packageInfo": {
      "weight": 2.5,
      "service": "UPS Ground"
    },
    "trackingEvents": [
      {
        "timestamp": "2024-01-01T10:00:00Z",
        "status": "SHIPPED",
        "location": "New York, NY",
        "description": "包裹已发出",
        "facility": "New York Distribution Center"
      },
      {
        "timestamp": "2024-01-02T08:30:00Z",
        "status": "IN_TRANSIT",
        "location": "Philadelphia, PA",
        "description": "包裹运输中",
        "facility": "Philadelphia Hub"
      },
      {
        "timestamp": "2024-01-03T14:30:00Z",
        "status": "IN_TRANSIT",
        "location": "Baltimore, MD",
        "description": "包裹运输中",
        "facility": "Baltimore Facility"
      },
      {
        "timestamp": "2024-01-05T09:15:00Z",
        "status": "OUT_FOR_DELIVERY",
        "location": "New York, NY",
        "description": "包裹派送中",
        "facility": "New York Local Facility"
      },
      {
        "timestamp": "2024-01-05T16:45:00Z",
        "status": "DELIVERED",
        "location": "New York, NY",
        "description": "包裹已送达",
        "deliveryLocation": "Front Door",
        "signedBy": "John Doe"
      }
    ],
    "lastUpdated": "2024-01-05T16:45:00Z"
  },
  "timestamp": "2024-01-05T17:00:00Z"
}
```

### 6. 批量跟踪查询

**请求**

```http
POST /logistics/tracking/batch
Content-Type: application/json

{
  "trackingNumbers": [
    {
      "trackingNumber": "1Z999AA1234567890",
      "carrier": "UPS"
    },
    {
      "trackingNumber": "1234567890123456",
      "carrier": "FEDEX"
    }
  ]
}
```

**响应**

```json
{
  "code": 200,
  "message": "批量查询完成",
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "results": [
      {
        "trackingNumber": "1Z999AA1234567890",
        "carrier": "UPS",
        "success": true,
        "status": "DELIVERED",
        "lastUpdate": "2024-01-05T16:45:00Z"
      },
      {
        "trackingNumber": "1234567890123456",
        "carrier": "FEDEX",
        "success": true,
        "status": "IN_TRANSIT",
        "lastUpdate": "2024-01-04T12:30:00Z"
      }
    ]
  },
  "timestamp": "2024-01-05T17:00:00Z"
}
```

### 7. 获取物流异常列表

**请求**

```http
GET /logistics/exceptions?page=1&size=10&status=OPEN&type=DELIVERY_FAILED
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| status | string | 否 | 异常状态：OPEN/IN_PROGRESS/RESOLVED/CLOSED |
| type | string | 否 | 异常类型：DELIVERY_FAILED/DAMAGED/LOST/DELAYED/ADDRESS_ISSUE |
| carrier | string | 否 | 承运商筛选 |
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
        "trackingNumber": "1Z999CC5555555555",
        "orderId": 1006,
        "orderNumber": "ORD20240102001",
        "carrier": "UPS",
        "type": "DELIVERY_FAILED",
        "status": "OPEN",
        "title": "投递失败",
        "description": "收件人不在，无法投递",
        "occurredAt": "2024-01-06T14:30:00Z",
        "reportedAt": "2024-01-06T15:00:00Z",
        "customerInfo": {
          "name": "Alice Johnson",
          "phone": "+1555666777",
          "email": "alice@example.com"
        },
        "address": {
          "address1": "999 Oak Street",
          "city": "Boston",
          "state": "MA",
          "zipCode": "02101",
          "country": "US"
        },
        "resolution": null,
        "assignedTo": null,
        "priority": "HIGH",
        "createTime": "2024-01-06T15:00:00Z",
        "updateTime": "2024-01-06T15:00:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1,
    "totalPages": 1
  },
  "timestamp": "2024-01-06T16:00:00Z"
}
```

### 8. 处理物流异常

**请求**

```http
POST /logistics/exceptions/{id}/handle
Content-Type: application/json

{
  "action": "RESCHEDULE_DELIVERY",
  "resolution": "已联系客户重新安排投递时间",
  "assignedTo": "logistics_agent_001",
  "scheduledDelivery": "2024-01-08T10:00:00Z",
  "customerNotified": true,
  "notes": "客户要求周一上午投递"
}
```

**参数说明**

- `action`: 处理动作，RESCHEDULE_DELIVERY（重新安排投递）、RETURN_TO_SENDER（退回发件人）、CONTACT_CUSTOMER（联系客户）、INVESTIGATE（调查处理）
- `resolution`: 处理方案描述
- `assignedTo`: 分配给的处理人员
- `scheduledDelivery`: 重新安排的投递时间（可选）
- `customerNotified`: 是否已通知客户
- `notes`: 处理备注

**响应**

```json
{
  "code": 200,
  "message": "异常处理成功",
  "data": {
    "id": 1,
    "trackingNumber": "1Z999CC5555555555",
    "status": "IN_PROGRESS",
    "action": "RESCHEDULE_DELIVERY",
    "resolution": "已联系客户重新安排投递时间",
    "assignedTo": "logistics_agent_001",
    "scheduledDelivery": "2024-01-08T10:00:00Z",
    "customerNotified": true,
    "notes": "客户要求周一上午投递",
    "handledAt": "2024-01-06T16:30:00Z",
    "updateTime": "2024-01-06T16:30:00Z"
  },
  "timestamp": "2024-01-06T16:30:00Z"
}
```

### 9. 获取承运商服务列表

**请求**

```http
GET /logistics/carriers/{carrier}/services
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "carrier": "UPS",
    "services": [
      {
        "code": "UPS_GROUND",
        "name": "UPS Ground",
        "description": "标准地面运输服务",
        "transitTime": "1-5 business days",
        "features": ["tracking", "insurance_available"],
        "restrictions": {
          "maxWeight": 70,
          "maxDimensions": {
            "length": 108,
            "width": 108,
            "height": 108,
            "unit": "inches"
          }
        }
      },
      {
        "code": "UPS_2DAY",
        "name": "UPS 2nd Day Air",
        "description": "两日达航空服务",
        "transitTime": "2 business days",
        "features": ["tracking", "insurance_available", "signature_required"],
        "restrictions": {
          "maxWeight": 70,
          "maxDimensions": {
            "length": 108,
            "width": 108,
            "height": 108,
            "unit": "inches"
          }
        }
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 10. 计算运费

**请求**

```http
POST /logistics/rates
Content-Type: application/json

{
  "fromAddress": {
    "zipCode": "90001",
    "country": "US"
  },
  "toAddress": {
    "zipCode": "10001",
    "country": "US"
  },
  "packageInfo": {
    "weight": 2.5,
    "dimensions": {
      "length": 30.0,
      "width": 20.0,
      "height": 10.0,
      "unit": "cm"
    }
  },
  "carriers": ["UPS", "FEDEX", "DHL"]
}
```

**响应**

```json
{
  "code": 200,
  "message": "运费计算成功",
  "data": {
    "rates": [
      {
        "carrier": "UPS",
        "service": "UPS Ground",
        "serviceCode": "UPS_GROUND",
        "cost": 15.99,
        "currency": "USD",
        "transitTime": "3-5 business days",
        "estimatedDelivery": "2024-01-08T18:00:00Z"
      },
      {
        "carrier": "UPS",
        "service": "UPS 2nd Day Air",
        "serviceCode": "UPS_2DAY",
        "cost": 35.99,
        "currency": "USD",
        "transitTime": "2 business days",
        "estimatedDelivery": "2024-01-05T18:00:00Z"
      },
      {
        "carrier": "FEDEX",
        "service": "FedEx Ground",
        "serviceCode": "FEDEX_GROUND",
        "cost": 14.50,
        "currency": "USD",
        "transitTime": "3-5 business days",
        "estimatedDelivery": "2024-01-08T18:00:00Z"
      }
    ],
    "calculatedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 通知管理 API

### 1. 获取通知列表

**请求**

```http
GET /notifications?page=1&size=10&type=INFO&read=false&category=ORDER
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 10 |
| type | string | 否 | 通知类型：INFO/SUCCESS/WARNING/ERROR |
| read | boolean | 否 | 是否已读：true/false |
| category | string | 否 | 通知分类：ORDER/INVENTORY/PLATFORM/SYSTEM/LOGISTICS |
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
        "type": "WARNING",
        "category": "INVENTORY",
        "title": "库存预警",
        "content": "商品 iPhone 15 (SKU001) 库存不足，当前库存：5，安全库存：20",
        "read": false,
        "priority": "HIGH",
        "sender": "SYSTEM",
        "recipient": "admin",
        "data": {
          "productId": 1,
          "sku": "SKU001",
          "currentStock": 5,
          "safetyStock": 20,
          "actionUrl": "/inventory/1"
        },
        "actions": [
          {
            "key": "view_inventory",
            "label": "查看库存",
            "type": "primary",
            "url": "/inventory/1"
          },
          {
            "key": "purchase_order",
            "label": "创建采购单",
            "type": "default",
            "url": "/purchase/create?productId=1"
          }
        ],
        "createTime": "2024-01-01T10:00:00Z",
        "readAt": null,
        "expiresAt": "2024-01-08T10:00:00Z"
      },
      {
        "id": 2,
        "type": "SUCCESS",
        "category": "ORDER",
        "title": "订单发货成功",
        "content": "订单 ORD20240101001 已成功发货，运单号：1Z999AA1234567890",
        "read": true,
        "priority": "NORMAL",
        "sender": "SYSTEM",
        "recipient": "admin",
        "data": {
          "orderId": 1001,
          "orderNumber": "ORD20240101001",
          "trackingNumber": "1Z999AA1234567890",
          "actionUrl": "/orders/1001"
        },
        "actions": [
          {
            "key": "view_order",
            "label": "查看订单",
            "type": "primary",
            "url": "/orders/1001"
          },
          {
            "key": "track_package",
            "label": "跟踪包裹",
            "type": "default",
            "url": "/logistics/tracking/1Z999AA1234567890"
          }
        ],
        "createTime": "2024-01-01T11:00:00Z",
        "readAt": "2024-01-01T11:30:00Z",
        "expiresAt": null
      }
    ],
    "page": 1,
    "size": 10,
    "total": 2,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. 获取通知详情

**请求**

```http
GET /notifications/{id}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "type": "WARNING",
    "category": "INVENTORY",
    "title": "库存预警",
    "content": "商品 iPhone 15 (SKU001) 库存不足，当前库存：5，安全库存：20",
    "read": false,
    "priority": "HIGH",
    "sender": "SYSTEM",
    "recipient": "admin",
    "data": {
      "productId": 1,
      "sku": "SKU001",
      "productName": "iPhone 15",
      "currentStock": 5,
      "safetyStock": 20,
      "warehouseLocation": "A-01-001",
      "lastRestockDate": "2023-12-15T10:00:00Z",
      "actionUrl": "/inventory/1"
    },
    "actions": [
      {
        "key": "view_inventory",
        "label": "查看库存",
        "type": "primary",
        "url": "/inventory/1"
      },
      {
        "key": "purchase_order",
        "label": "创建采购单",
        "type": "default",
        "url": "/purchase/create?productId=1"
      },
      {
        "key": "adjust_safety_stock",
        "label": "调整安全库存",
        "type": "default",
        "url": "/inventory/1/safety-stock"
      }
    ],
    "relatedNotifications": [
      {
        "id": 15,
        "title": "库存预警",
        "createTime": "2023-12-20T10:00:00Z"
      }
    ],
    "createTime": "2024-01-01T10:00:00Z",
    "readAt": null,
    "expiresAt": "2024-01-08T10:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. 标记通知为已读

**请求**

```http
PUT /notifications/{id}/read
```

**响应**

```json
{
  "code": 200,
  "message": "通知已标记为已读",
  "data": {
    "id": 1,
    "read": true,
    "readAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. 批量标记已读

**请求**

```http
PUT /notifications/batch/read
Content-Type: application/json

{
  "notificationIds": [1, 2, 3, 4, 5]
}
```

**响应**

```json
{
  "code": 200,
  "message": "批量标记已读成功",
  "data": {
    "total": 5,
    "success": 5,
    "failed": 0,
    "results": [
      {
        "id": 1,
        "success": true,
        "readAt": "2024-01-01T12:00:00Z"
      },
      {
        "id": 2,
        "success": true,
        "readAt": "2024-01-01T12:00:00Z"
      },
      {
        "id": 3,
        "success": true,
        "readAt": "2024-01-01T12:00:00Z"
      },
      {
        "id": 4,
        "success": true,
        "readAt": "2024-01-01T12:00:00Z"
      },
      {
        "id": 5,
        "success": true,
        "readAt": "2024-01-01T12:00:00Z"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 5. 删除通知

**请求**

```http
DELETE /notifications/{id}
```

**响应**

```json
{
  "code": 200,
  "message": "通知删除成功",
  "data": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 6. 批量删除通知

**请求**

```http
DELETE /notifications/batch
Content-Type: application/json

{
  "notificationIds": [1, 2, 3]
}
```

**响应**

```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "total": 3,
    "success": 3,
    "failed": 0,
    "results": [
      {
        "id": 1,
        "success": true
      },
      {
        "id": 2,
        "success": true
      },
      {
        "id": 3,
        "success": true
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 7. 获取未读通知数量

**请求**

```http
GET /notifications/unread-count?category=ORDER
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 通知分类筛选 |
| type | string | 否 | 通知类型筛选 |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 15,
    "byCategory": {
      "ORDER": 5,
      "INVENTORY": 8,
      "PLATFORM": 1,
      "SYSTEM": 1,
      "LOGISTICS": 0
    },
    "byType": {
      "INFO": 3,
      "SUCCESS": 2,
      "WARNING": 8,
      "ERROR": 2
    },
    "byPriority": {
      "LOW": 2,
      "NORMAL": 8,
      "HIGH": 4,
      "URGENT": 1
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 8. 创建通知

**请求**

```http
POST /notifications
Content-Type: application/json

{
  "type": "INFO",
  "category": "SYSTEM",
  "title": "系统维护通知",
  "content": "系统将于今晚23:00-01:00进行维护，期间可能影响部分功能使用",
  "priority": "NORMAL",
  "recipients": ["admin", "manager"],
  "data": {
    "maintenanceStart": "2024-01-01T23:00:00Z",
    "maintenanceEnd": "2024-01-02T01:00:00Z",
    "affectedServices": ["order", "inventory"]
  },
  "actions": [
    {
      "key": "view_details",
      "label": "查看详情",
      "type": "primary",
      "url": "/system/maintenance"
    }
  ],
  "expiresAt": "2024-01-02T02:00:00Z",
  "sendEmail": true,
  "sendSms": false
}
```

**响应**

```json
{
  "code": 201,
  "message": "通知创建成功",
  "data": {
    "id": 100,
    "type": "INFO",
    "category": "SYSTEM",
    "title": "系统维护通知",
    "content": "系统将于今晚23:00-01:00进行维护，期间可能影响部分功能使用",
    "priority": "NORMAL",
    "sender": "admin",
    "recipients": ["admin", "manager"],
    "data": {
      "maintenanceStart": "2024-01-01T23:00:00Z",
      "maintenanceEnd": "2024-01-02T01:00:00Z",
      "affectedServices": ["order", "inventory"]
    },
    "actions": [
      {
        "key": "view_details",
        "label": "查看详情",
        "type": "primary",
        "url": "/system/maintenance"
      }
    ],
    "createTime": "2024-01-01T12:00:00Z",
    "expiresAt": "2024-01-02T02:00:00Z",
    "deliveryStatus": {
      "email": "SENT",
      "sms": "SKIPPED",
      "push": "SENT"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 9. 获取通知模板列表

**请求**

```http
GET /notifications/templates?category=INVENTORY&enabled=true
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 模板分类筛选 |
| enabled | boolean | 否 | 是否启用 |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "库存预警模板",
      "category": "INVENTORY",
      "type": "WARNING",
      "title": "库存预警",
      "content": "商品 {{productName}} ({{sku}}) 库存不足，当前库存：{{currentStock}}，安全库存：{{safetyStock}}",
      "variables": [
        "productName",
        "sku",
        "currentStock",
        "safetyStock"
      ],
      "enabled": true,
      "priority": "HIGH",
      "channels": ["PUSH", "EMAIL"],
      "createTime": "2024-01-01T10:00:00Z",
      "updateTime": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "name": "库存补货完成模板",
      "category": "INVENTORY",
      "type": "SUCCESS",
      "title": "库存补货完成",
      "content": "商品 {{productName}} ({{sku}}) 补货完成，补货数量：{{quantity}}，当前库存：{{currentStock}}",
      "variables": [
        "productName",
        "sku",
        "quantity",
        "currentStock"
      ],
      "enabled": true,
      "priority": "NORMAL",
      "channels": ["PUSH"],
      "createTime": "2024-01-01T10:00:00Z",
      "updateTime": "2024-01-01T10:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 10. WebSocket 实时通知

**连接**

```
WS /notifications/ws?token=your_jwt_token
```

**连接成功响应**

```json
{
  "type": "CONNECTION_SUCCESS",
  "message": "WebSocket连接成功",
  "userId": "admin",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**实时通知消息格式**

```json
{
  "type": "NOTIFICATION",
  "data": {
    "id": 101,
    "type": "WARNING",
    "category": "INVENTORY",
    "title": "库存预警",
    "content": "商品 Samsung Galaxy S24 (SKU002) 库存不足，当前库存：3，安全库存：15",
    "priority": "HIGH",
    "sender": "SYSTEM",
    "recipient": "admin",
    "data": {
      "productId": 2,
      "sku": "SKU002",
      "currentStock": 3,
      "safetyStock": 15,
      "actionUrl": "/inventory/2"
    },
    "actions": [
      {
        "key": "view_inventory",
        "label": "查看库存",
        "type": "primary",
        "url": "/inventory/2"
      }
    ],
    "createTime": "2024-01-01T12:05:00Z"
  },
  "timestamp": "2024-01-01T12:05:00Z"
}
```

**心跳消息**

```json
{
  "type": "HEARTBEAT",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**客户端心跳响应**

```json
{
  "type": "PONG",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 11. 通知统计信息

**请求**

```http
GET /notifications/statistics?period=7d
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | 统计周期：1d/7d/30d/90d，默认7d |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "period": "7d",
    "total": 156,
    "unread": 23,
    "byCategory": {
      "ORDER": {
        "total": 45,
        "unread": 8
      },
      "INVENTORY": {
        "total": 67,
        "unread": 12
      },
      "PLATFORM": {
        "total": 23,
        "unread": 2
      },
      "SYSTEM": {
        "total": 15,
        "unread": 1
      },
      "LOGISTICS": {
        "total": 6,
        "unread": 0
      }
    },
    "byType": {
      "INFO": {
        "total": 45,
        "unread": 5
      },
      "SUCCESS": {
        "total": 38,
        "unread": 3
      },
      "WARNING": {
        "total": 58,
        "unread": 13
      },
      "ERROR": {
        "total": 15,
        "unread": 2
      }
    },
    "dailyTrend": [
      {
        "date": "2024-01-01",
        "total": 25,
        "unread": 5
      },
      {
        "date": "2024-01-02",
        "total": 18,
        "unread": 3
      },
      {
        "date": "2024-01-03",
        "total": 32,
        "unread": 8
      },
      {
        "date": "2024-01-04",
        "total": 21,
        "unread": 2
      },
      {
        "date": "2024-01-05",
        "total": 28,
        "unread": 3
      },
      {
        "date": "2024-01-06",
        "total": 19,
        "unread": 1
      },
      {
        "date": "2024-01-07",
        "total": 13,
        "unread": 1
      }
    ]
  },
  "timestamp": "2024-01-07T12:00:00Z"
}
```

## 系统设置 API

### 1. 获取系统配置

**请求**

```http
GET /system/config?category=GENERAL&editable=true
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 配置分类：GENERAL/DATABASE/CACHE/EMAIL/SMS/SECURITY |
| editable | boolean | 否 | 是否只返回可编辑的配置 |
| key | string | 否 | 配置键名搜索 |

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "category": "GENERAL",
      "key": "system.name",
      "value": "电商ERP系统",
      "type": "string",
      "description": "系统名称",
      "editable": true,
      "required": true,
      "defaultValue": "ERP System",
      "validation": {
        "maxLength": 50,
        "pattern": null
      },
      "updateTime": "2024-01-01T10:00:00Z",
      "updatedBy": "admin"
    },
    {
      "id": 2,
      "category": "GENERAL",
      "key": "system.timezone",
      "value": "Asia/Shanghai",
      "type": "string",
      "description": "系统时区",
      "editable": true,
      "required": true,
      "defaultValue": "UTC",
      "options": [
        "UTC",
        "Asia/Shanghai",
        "America/New_York",
        "Europe/London"
      ],
      "validation": {
        "enum": ["UTC", "Asia/Shanghai", "America/New_York", "Europe/London"]
      },
      "updateTime": "2024-01-01T10:00:00Z",
      "updatedBy": "admin"
    },
    {
      "id": 3,
      "category": "SECURITY",
      "key": "auth.session.timeout",
      "value": 3600,
      "type": "number",
      "description": "会话超时时间（秒）",
      "editable": true,
      "required": true,
      "defaultValue": 3600,
      "validation": {
        "min": 300,
        "max": 86400
      },
      "updateTime": "2024-01-01T10:00:00Z",
      "updatedBy": "admin"
    },
    {
      "id": 4,
      "category": "EMAIL",
      "key": "email.smtp.enabled",
      "value": true,
      "type": "boolean",
      "description": "是否启用邮件发送",
      "editable": true,
      "required": false,
      "defaultValue": false,
      "updateTime": "2024-01-01T10:00:00Z",
      "updatedBy": "admin"
    }
  ],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. 获取单个配置项

**请求**

```http
GET /system/config/{key}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "category": "GENERAL",
    "key": "system.name",
    "value": "电商ERP系统",
    "type": "string",
    "description": "系统名称",
    "editable": true,
    "required": true,
    "defaultValue": "ERP System",
    "validation": {
      "maxLength": 50,
      "pattern": null
    },
    "history": [
      {
        "value": "ERP System",
        "updateTime": "2023-12-01T10:00:00Z",
        "updatedBy": "admin"
      },
      {
        "value": "电商ERP系统",
        "updateTime": "2024-01-01T10:00:00Z",
        "updatedBy": "admin"
      }
    ],
    "updateTime": "2024-01-01T10:00:00Z",
    "updatedBy": "admin"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 3. 更新系统配置

**请求**

```http
PUT /system/config
Content-Type: application/json

{
  "configs": [
    {
      "key": "system.name",
      "value": "新的ERP系统名称"
    },
    {
      "key": "system.timezone",
      "value": "America/New_York"
    },
    {
      "key": "auth.session.timeout",
      "value": 7200
    }
  ]
}
```

**响应**

```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": {
    "total": 3,
    "success": 3,
    "failed": 0,
    "results": [
      {
        "key": "system.name",
        "success": true,
        "oldValue": "电商ERP系统",
        "newValue": "新的ERP系统名称",
        "updateTime": "2024-01-01T12:00:00Z"
      },
      {
        "key": "system.timezone",
        "success": true,
        "oldValue": "Asia/Shanghai",
        "newValue": "America/New_York",
        "updateTime": "2024-01-01T12:00:00Z"
      },
      {
        "key": "auth.session.timeout",
        "success": true,
        "oldValue": 3600,
        "newValue": 7200,
        "updateTime": "2024-01-01T12:00:00Z"
      }
    ],
    "requiresRestart": false,
    "affectedServices": ["auth-service"]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. 重置配置为默认值

**请求**

```http
POST /system/config/reset
Content-Type: application/json

{
  "keys": ["system.timezone", "auth.session.timeout"]
}
```

**响应**

```json
{
  "code": 200,
  "message": "配置重置成功",
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "results": [
      {
        "key": "system.timezone",
        "success": true,
        "oldValue": "America/New_York",
        "newValue": "UTC",
        "resetAt": "2024-01-01T12:00:00Z"
      },
      {
        "key": "auth.session.timeout",
        "success": true,
        "oldValue": 7200,
        "newValue": 3600,
        "resetAt": "2024-01-01T12:00:00Z"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 5. 获取系统日志

**请求**

```http
GET /system/logs?page=1&size=50&level=ERROR&module=order-service&startDate=2024-01-01&endDate=2024-01-07
```

**参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页大小，默认 50 |
| level | string | 否 | 日志级别：DEBUG/INFO/WARN/ERROR |
| module | string | 否 | 模块名称 |
| keyword | string | 否 | 关键词搜索 |
| userId | string | 否 | 用户ID筛选 |
| ip | string | 否 | IP地址筛选 |
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
        "level": "ERROR",
        "message": "订单创建失败：库存不足",
        "module": "order-service",
        "className": "com.erp.order.service.OrderServiceImpl",
        "methodName": "createOrder",
        "lineNumber": 156,
        "userId": "admin",
        "userName": "系统管理员",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "requestId": "REQ_20240101_001",
        "sessionId": "SESSION_123456",
        "exception": {
          "type": "InsufficientInventoryException",
          "message": "商品SKU001库存不足，当前库存：0，需要库存：1",
          "stackTrace": "com.erp.order.exception.InsufficientInventoryException: 商品SKU001库存不足..."
        },
        "context": {
          "orderId": 1001,
          "productId": 1,
          "sku": "SKU001",
          "requestedQuantity": 1,
          "availableQuantity": 0
        },
        "createTime": "2024-01-01T10:30:00Z"
      },
      {
        "id": 2,
        "level": "WARN",
        "message": "用户登录失败次数过多，账户已锁定",
        "module": "user-service",
        "className": "com.erp.user.service.AuthServiceImpl",
        "methodName": "login",
        "lineNumber": 89,
        "userId": null,
        "userName": null,
        "ip": "192.168.1.200",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "requestId": "REQ_20240101_002",
        "sessionId": null,
        "exception": null,
        "context": {
          "username": "testuser",
          "failedAttempts": 5,
          "lockDuration": 1800
        },
        "createTime": "2024-01-01T11:15:00Z"
      }
    ],
    "page": 1,
    "size": 50,
    "total": 2,
    "totalPages": 1
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 6. 导出系统日志

**请求**

```http
POST /system/logs/export
Content-Type: application/json

{
  "level": "ERROR",
  "module": "order-service",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "format": "CSV",
  "includeStackTrace": true
}
```

**响应**

```json
{
  "code": 200,
  "message": "日志导出任务已创建",
  "data": {
    "taskId": "EXPORT_LOGS_20240101_001",
    "status": "PROCESSING",
    "format": "CSV",
    "filters": {
      "level": "ERROR",
      "module": "order-service",
      "startDate": "2024-01-01",
      "endDate": "2024-01-07"
    },
    "estimatedRecords": 156,
    "createTime": "2024-01-01T12:00:00Z",
    "estimatedCompletion": "2024-01-01T12:05:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 7. 获取导出任务状态

**请求**

```http
GET /system/logs/export/{taskId}
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "taskId": "EXPORT_LOGS_20240101_001",
    "status": "COMPLETED",
    "format": "CSV",
    "filters": {
      "level": "ERROR",
      "module": "order-service",
      "startDate": "2024-01-01",
      "endDate": "2024-01-07"
    },
    "result": {
      "totalRecords": 156,
      "fileSize": 2048576,
      "downloadUrl": "https://api.erp.com/system/logs/export/EXPORT_LOGS_20240101_001/download",
      "expiresAt": "2024-01-08T12:00:00Z"
    },
    "createTime": "2024-01-01T12:00:00Z",
    "completedAt": "2024-01-01T12:03:00Z"
  },
  "timestamp": "2024-01-01T12:10:00Z"
}
```

### 8. 获取系统状态监控

**请求**

```http
GET /system/status
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "overall": "HEALTHY",
    "services": [
      {
        "name": "user-service",
        "status": "UP",
        "port": 8001,
        "responseTime": 45,
        "lastCheck": "2024-01-01T12:00:00Z",
        "version": "1.0.0",
        "uptime": 86400,
        "healthChecks": {
          "database": "UP",
          "redis": "UP",
          "kafka": "UP"
        }
      },
      {
        "name": "product-service",
        "status": "UP",
        "port": 8002,
        "responseTime": 38,
        "lastCheck": "2024-01-01T12:00:00Z",
        "version": "1.0.0",
        "uptime": 86400,
        "healthChecks": {
          "database": "UP",
          "redis": "UP",
          "elasticsearch": "UP"
        }
      },
      {
        "name": "order-service",
        "status": "DOWN",
        "port": 8003,
        "responseTime": null,
        "lastCheck": "2024-01-01T12:00:00Z",
        "version": "1.0.0",
        "uptime": 0,
        "error": "Connection refused",
        "healthChecks": {
          "database": "DOWN",
          "redis": "UP",
          "kafka": "UP"
        }
      }
    ],
    "infrastructure": {
      "database": {
        "status": "UP",
        "type": "MySQL",
        "version": "8.0.35",
        "connections": {
          "active": 15,
          "idle": 5,
          "max": 100
        },
        "responseTime": 12,
        "lastCheck": "2024-01-01T12:00:00Z"
      },
      "cache": {
        "status": "UP",
        "type": "Redis",
        "version": "7.2.3",
        "memory": {
          "used": "256MB",
          "max": "1GB",
          "usage": 25.6
        },
        "connections": 8,
        "responseTime": 3,
        "lastCheck": "2024-01-01T12:00:00Z"
      },
      "messageQueue": {
        "status": "UP",
        "type": "Kafka",
        "version": "3.6.0",
        "topics": 12,
        "partitions": 36,
        "brokers": 1,
        "responseTime": 8,
        "lastCheck": "2024-01-01T12:00:00Z"
      }
    },
    "system": {
      "cpu": {
        "usage": 45.2,
        "cores": 8
      },
      "memory": {
        "used": "4.2GB",
        "total": "16GB",
        "usage": 26.25
      },
      "disk": {
        "used": "120GB",
        "total": "500GB",
        "usage": 24.0
      },
      "network": {
        "inbound": "1.2MB/s",
        "outbound": "0.8MB/s"
      }
    },
    "lastUpdated": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 9. 系统健康检查

**请求**

```http
GET /system/health
```

**响应**

```json
{
  "code": 200,
  "message": "系统健康检查完成",
  "data": {
    "status": "UP",
    "checks": [
      {
        "name": "database",
        "status": "UP",
        "responseTime": 12,
        "details": {
          "driver": "MySQL",
          "version": "8.0.35",
          "url": "jdbc:mysql://localhost:3306/erp_system"
        }
      },
      {
        "name": "redis",
        "status": "UP",
        "responseTime": 3,
        "details": {
          "version": "7.2.3",
          "mode": "standalone"
        }
      },
      {
        "name": "kafka",
        "status": "UP",
        "responseTime": 8,
        "details": {
          "version": "3.6.0",
          "brokers": ["localhost:9092"]
        }
      },
      {
        "name": "diskSpace",
        "status": "UP",
        "details": {
          "total": 536870912000,
          "free": 402653184000,
          "threshold": 10737418240
        }
      }
    ],
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 10. 清理系统日志

**请求**

```http
POST /system/logs/cleanup
Content-Type: application/json

{
  "retentionDays": 30,
  "level": "DEBUG",
  "dryRun": false
}
```

**参数说明**

- `retentionDays`: 保留天数，删除超过此天数的日志
- `level`: 要清理的日志级别，不传则清理所有级别
- `dryRun`: 是否为试运行，true时只返回将要删除的记录数，不实际删除

**响应**

```json
{
  "code": 200,
  "message": "日志清理完成",
  "data": {
    "taskId": "CLEANUP_LOGS_20240101_001",
    "retentionDays": 30,
    "level": "DEBUG",
    "dryRun": false,
    "result": {
      "totalRecords": 50000,
      "deletedRecords": 35000,
      "freedSpace": "2.5GB",
      "oldestRemainingLog": "2023-12-02T10:00:00Z"
    },
    "startTime": "2024-01-01T12:00:00Z",
    "endTime": "2024-01-01T12:05:00Z",
    "duration": 300
  },
  "timestamp": "2024-01-01T12:05:00Z"
}
```

### 11. 获取系统信息

**请求**

```http
GET /system/info
```

**响应**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "application": {
      "name": "电商ERP系统",
      "version": "1.0.0",
      "buildTime": "2024-01-01T08:00:00Z",
      "environment": "production",
      "profiles": ["prod", "mysql", "redis"]
    },
    "system": {
      "os": "Linux",
      "osVersion": "Ubuntu 20.04.6 LTS",
      "architecture": "x86_64",
      "javaVersion": "17.0.8",
      "javaVendor": "Eclipse Adoptium",
      "timezone": "Asia/Shanghai",
      "encoding": "UTF-8"
    },
    "runtime": {
      "startTime": "2024-01-01T00:00:00Z",
      "uptime": 43200,
      "processors": 8,
      "memory": {
        "max": "4GB",
        "total": "2GB",
        "used": "1.2GB",
        "free": "800MB"
      }
    },
    "dependencies": {
      "spring-boot": "3.2.0",
      "spring-cloud": "2023.0.0",
      "mysql": "8.0.35",
      "redis": "7.2.3",
      "kafka": "3.6.0",
      "elasticsearch": "8.11.0"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 错误码说明

### 通用错误码

| 错误码            | HTTP 状态码 | 说明           |
| ----------------- | ----------- | -------------- |
| SUCCESS           | 200         | 操作成功       |
| INVALID_PARAMETER | 400         | 请求参数错误   |
| UNAUTHORIZED      | 401         | 未授权访问     |
| FORBIDDEN         | 403         | 禁止访问       |
| NOT_FOUND         | 404         | 资源不存在     |
| INTERNAL_ERROR    | 500         | 服务器内部错误 |

### 业务错误码

| 错误码                    | HTTP 状态码 | 说明                |
| ------------------------- | ----------- | ------------------- |
| USER_NOT_FOUND            | 404         | 用户不存在          |
| USER_ALREADY_EXISTS       | 400         | 用户已存在          |
| INVALID_CREDENTIALS       | 401         | 用户名或密码错误    |
| TOKEN_EXPIRED             | 401         | Token 已过期        |
| PRODUCT_NOT_FOUND         | 404         | 商品不存在          |
| SKU_ALREADY_EXISTS        | 400         | SKU 已存在          |
| INSUFFICIENT_INVENTORY    | 400         | 库存不足            |
| ORDER_NOT_FOUND           | 404         | 订单不存在          |
| ORDER_STATUS_INVALID      | 400         | 订单状态无效        |
| PLATFORM_API_ERROR        | 500         | 平台 API 调用失败   |
| PLATFORM_NOT_FOUND        | 404         | 平台不存在          |
| PLATFORM_CONFIG_INVALID   | 400         | 平台配置无效        |
| PLATFORM_CONNECTION_FAILED| 500         | 平台连接失败        |
| SYNC_TASK_NOT_FOUND       | 404         | 同步任务不存在      |
| SYNC_ALREADY_RUNNING      | 409         | 同步任务已在运行    |
| LOGISTICS_ORDER_NOT_FOUND | 404         | 物流订单不存在      |
| TRACKING_NUMBER_INVALID   | 400         | 运单号无效          |
| CARRIER_NOT_SUPPORTED     | 400         | 不支持的承运商      |
| LABEL_GENERATION_FAILED   | 500         | 面单生成失败        |
| ADDRESS_INVALID           | 400         | 地址信息无效        |
| PACKAGE_INFO_INVALID      | 400         | 包裹信息无效        |
| NOTIFICATION_NOT_FOUND    | 404         | 通知不存在          |
| NOTIFICATION_TEMPLATE_NOT_FOUND | 404   | 通知模板不存在      |
| WEBSOCKET_CONNECTION_FAILED | 500       | WebSocket 连接失败  |
| CONFIG_NOT_FOUND          | 404         | 配置项不存在        |
| CONFIG_NOT_EDITABLE       | 403         | 配置项不可编辑      |
| CONFIG_VALIDATION_FAILED  | 400         | 配置验证失败        |
| LOG_EXPORT_FAILED         | 500         | 日志导出失败        |
| SYSTEM_MAINTENANCE        | 503         | 系统维护中          |

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

如有 API 相关问题，请联系：

- **技术支持**: api-support@company.com
- **开发文档**: https://docs.api.erp.yourdomain.com
- **API 测试**: https://api-test.erp.yourdomain.com

## 更新日志

| 版本 | 日期       | 更新内容                                           |
| ---- | ---------- | -------------------------------------------------- |
| v1.0 | 2024-01-01 | 初始版本                                           |
| v1.1 | 2024-02-01 | 新增批量操作接口                                   |
| v1.2 | 2024-03-01 | 优化错误处理                                       |
| v1.3 | 2024-09-07 | 新增平台管理、物流管理、通知管理、系统设置 API 接口 |
