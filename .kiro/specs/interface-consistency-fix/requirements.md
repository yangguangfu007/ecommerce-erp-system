# 接口一致性修复需求文档

## 介绍

本需求文档旨在系统性地修复电商ERP系统中前后端接口不一致的问题，确保API文档、前端代码和后端实现三者保持完全一致。通过统一接口规范、修正字段映射、优化响应格式，提升系统的可维护性和开发效率。

## 需求

### 需求 1：统一登录接口响应格式

**用户故事：** 作为前端开发者，我希望登录接口的响应格式与后端实际实现保持一致，以便正确处理登录响应数据。

#### 验收标准

1. WHEN 用户调用登录接口 THEN 系统 SHALL 返回包含 accessToken、refreshToken、tokenType、expiresIn 和 userInfo 字段的响应
2. WHEN 登录成功 THEN userInfo 对象 SHALL 包含 realName 字段而不是 name 字段
3. WHEN 登录成功 THEN userInfo 对象 SHALL 包含数字类型的 status 字段（0-禁用，1-启用）
4. WHEN 登录成功 THEN userInfo 对象 SHALL 包含 roleNames 数组字段
5. WHEN 登录成功 THEN 前端代码 SHALL 能够正确解析和使用所有响应字段

### 需求 2：统一用户管理接口参数和响应

**用户故事：** 作为系统管理员，我希望用户管理相关的接口参数和响应格式保持一致，以便正确进行用户管理操作。

#### 验收标准

1. WHEN 查询用户列表 THEN 系统 SHALL 支持 username、realName 和数字类型 status 参数
2. WHEN 创建用户 THEN 系统 SHALL 接受 realName、nickname、数字类型 status 等字段
3. WHEN 返回用户信息 THEN 系统 SHALL 使用 realName 字段而不是 name 字段
4. WHEN 返回用户状态 THEN 系统 SHALL 同时提供数字类型 status 和字符串类型 statusStr 字段
5. WHEN 处理用户角色 THEN 系统 SHALL 使用 roleNames 数组字段

### 需求 3：统一商品管理接口字段映射

**用户故事：** 作为商品管理员，我希望商品相关接口的字段命名保持一致，以便正确管理商品信息。

#### 验收标准

1. WHEN 处理商品信息 THEN 系统 SHALL 统一使用 name 字段作为商品名称
2. WHEN 处理商品分类 THEN 系统 SHALL 使用 categoryId 数字字段而不是 category 字符串
3. WHEN 处理商品尺寸 THEN 系统 SHALL 使用字符串格式的 dimensions 字段
4. WHEN 处理商品状态 THEN 系统 SHALL 使用枚举值（ACTIVE/INACTIVE/DELETED）
5. WHEN 处理商品价格 THEN 系统 SHALL 确保前后端数字类型一致

### 需求 4：统一分页响应格式

**用户故事：** 作为前端开发者，我希望所有分页接口使用统一的响应格式，以便实现通用的分页组件。

#### 验收标准

1. WHEN 调用分页接口 THEN 系统 SHALL 返回包含 content、page、size、total、totalPages 字段的响应
2. WHEN 处理分页数据 THEN content 字段 SHALL 包含实际的数据列表
3. WHEN 处理分页信息 THEN page 字段 SHALL 表示当前页码（从1开始）
4. WHEN 处理分页信息 THEN total 字段 SHALL 表示总记录数
5. WHEN 处理分页信息 THEN totalPages 字段 SHALL 表示总页数

### 需求 5：统一错误响应格式

**用户故事：** 作为前端开发者，我希望所有接口的错误响应格式保持一致，以便实现统一的错误处理机制。

#### 验收标准

1. WHEN 接口发生错误 THEN 系统 SHALL 返回包含 code、message、error、timestamp 字段的响应
2. WHEN 参数验证失败 THEN 系统 SHALL 在 details 字段中提供具体的字段错误信息
3. WHEN 业务逻辑错误 THEN 系统 SHALL 提供明确的错误码和中文错误消息
4. WHEN 系统异常 THEN 系统 SHALL 返回通用的服务器错误响应
5. WHEN 前端接收错误响应 THEN 系统 SHALL 能够正确解析和显示错误信息

### 需求 6：更新API文档与实现保持一致

**用户故事：** 作为API使用者，我希望API文档准确反映后端的实际实现，以便正确集成和使用接口。

#### 验收标准

1. WHEN 查看API文档 THEN 文档 SHALL 准确描述所有接口的请求参数格式
2. WHEN 查看API文档 THEN 文档 SHALL 准确描述所有接口的响应字段结构
3. WHEN 查看API文档 THEN 文档 SHALL 包含正确的字段类型和约束信息
4. WHEN 查看API文档 THEN 文档 SHALL 提供准确的示例请求和响应
5. WHEN 对比文档和实现 THEN 两者 SHALL 完全一致无差异

### 需求 7：验证接口一致性

**用户故事：** 作为质量保证工程师，我希望有自动化测试来验证前后端接口的一致性，以便及时发现和修复不一致问题。

#### 验收标准

1. WHEN 运行接口测试 THEN 系统 SHALL 验证所有接口的请求参数格式正确
2. WHEN 运行接口测试 THEN 系统 SHALL 验证所有接口的响应格式符合预期
3. WHEN 运行接口测试 THEN 系统 SHALL 验证字段类型和数据格式正确
4. WHEN 发现不一致 THEN 测试 SHALL 提供详细的错误信息和修复建议
5. WHEN 所有测试通过 THEN 系统 SHALL 确保前后端接口完全一致