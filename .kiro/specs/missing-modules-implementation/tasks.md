# 实现计划

## 开发流程说明

本实现计划遵循严格的开发流程：
1. **API接口文档完善** - 先设计完整的API接口文档
2. **后端接口开发** - 实现后端接口，每个接口都要编写单元测试和接口测试
3. **前端页面开发** - 实现前端页面，每个功能都要进行端到端测试
4. **真实服务测试** - 每完成一个task都要启动真实服务进行测试验证

## MyBatis Plus 开发标准

本项目统一使用 **MyBatis Plus 3.5.4** 作为 ORM 框架，**erp-common 模块已提供完整的基础配置**，所有数据库操作必须遵循以下标准：

### 已有基础设施（erp-common模块提供）
- **BaseEntity**: 通用实体基类，包含id、createTime、updateTime、createBy、updateBy、deleted、version字段
- **BaseMapperPlus**: 增强的Mapper基接口，提供更多便捷查询方法
- **BaseServicePlus**: 增强的Service基接口，提供批量操作、分页查询等方法
- **MyMetaObjectHandler**: 自动填充处理器，自动处理审计字段
- **JsonTypeHandler**: JSON字段类型处理器，支持复杂对象存储
- **PageResult**: 统一分页结果封装类
- **QueryWrapperUtils**: 查询条件构造器工具类，简化条件构建

### 核心开发规范
- **实体类**: 继承 `com.erp.common.entity.BaseEntity` 基类，使用 `@TableName` 注解指定表名
- **主键策略**: BaseEntity已配置 `@TableId(type = IdType.ASSIGN_ID)` 雪花算法主键
- **字段映射**: 使用 `@TableField` 注解配置字段映射，BaseEntity已配置自动填充
- **逻辑删除**: BaseEntity已配置 `@TableLogic` 逻辑删除和乐观锁 `@Version`
- **枚举处理**: 使用 `@EnumValue` 注解支持枚举类型存储

### Mapper层规范
- **接口继承**: 所有Mapper接口必须继承 `com.erp.common.mapper.BaseMapperPlus<T>`
- **自定义查询**: 使用 `QueryWrapperUtils` 工具类构建类型安全的查询条件
- **分页查询**: 已配置 `PaginationInnerInterceptor` 分页插件，支持MySQL优化
- **批量操作**: 使用BaseMapperPlus提供的增强方法

### Service层规范
- **接口继承**: Service接口继承 `com.erp.common.service.BaseServicePlus<T>`
- **实现类继承**: Service实现类继承 `ServiceImpl<Mapper, Entity>` 并实现BaseServicePlus接口
- **事务管理**: 使用 `@Transactional(rollbackFor = Exception.class)` 注解
- **分页处理**: 使用 `PageResult<T>` 统一分页响应格式
- **条件构造**: 使用 `QueryWrapperUtils` 简化查询条件构建

### 已配置功能特性
- **自动填充**: MyMetaObjectHandler自动处理createTime、updateTime、createBy、updateBy等字段
- **分页插件**: 支持MySQL数据库，单页最大1000条记录，优化JOIN查询
- **乐观锁**: 支持version字段乐观锁控制
- **防攻击**: 防止全表更新删除操作
- **JSON支持**: JsonTypeHandler支持复杂对象字段存储
- **SQL日志**: 开发环境可启用SQL执行日志输出

## 任务列表

### 阶段一：API接口文档设计

- [x] 1. API接口文档完善
  - 在docs/api-documentation.md中添加平台管理、物流管理、通知中心、系统设置相关的API接口文档
  - 定义详细的请求参数、响应格式和错误码
  - 提供接口使用示例和说明
  - 完成后需要进行文档审查，确保接口定义清晰完整
  - _需求: 1.1, 2.1, 3.1, 4.1_

- [x] 1.1 平台管理API文档编写
  - 在docs/api-documentation.md中添加"平台管理 API"章节
  - 定义平台列表查询接口 `GET /api/platforms` 的文档
  - 定义平台配置接口 `GET/POST/PUT /api/platforms/config` 的文档
  - 定义平台状态监控接口 `GET /api/platforms/status` 的文档
  - 定义平台同步接口 `POST /api/platforms/{id}/sync` 的文档
  - 包含完整的请求参数、响应示例和错误码说明
  - 完成后需要与团队成员进行接口设计评审
  - _需求: 1.1_

- [x] 1.2 物流管理API文档编写
  - 在docs/api-documentation.md中添加"物流管理 API"章节
  - 定义物流订单查询接口 `GET /api/logistics/orders` 的文档
  - 定义面单生成接口 `POST /api/logistics/labels` 的文档
  - 定义物流跟踪接口 `GET /api/logistics/tracking/{trackingNumber}` 的文档
  - 定义物流异常处理接口 `GET/POST /api/logistics/exceptions` 的文档
  - 包含完整的请求参数、响应示例和错误码说明
  - 完成后需要与团队成员进行接口设计评审
  - _需求: 2.1_

- [x] 1.3 通知中心API文档编写
  - 在docs/api-documentation.md中添加"通知管理 API"章节
  - 定义通知列表查询接口 `GET /api/notifications` 的文档
  - 定义通知标记已读接口 `PUT /api/notifications/{id}/read` 的文档
  - 定义通知删除接口 `DELETE /api/notifications/{id}` 的文档
  - 定义未读通知数量接口 `GET /api/notifications/unread-count` 的文档
  - 定义实时通知WebSocket接口 `WS /api/notifications/ws` 的文档
  - 包含完整的请求参数、响应示例和错误码说明
  - 完成后需要与团队成员进行接口设计评审
  - _需求: 3.1_

- [x] 1.4 系统设置API文档编写
  - 在docs/api-documentation.md中添加"系统设置 API"章节
  - 定义系统配置查询接口 `GET /api/system/config` 的文档
  - 定义系统配置更新接口 `PUT /api/system/config` 的文档
  - 定义系统日志查询接口 `GET /api/system/logs` 的文档
  - 定义系统状态监控接口 `GET /api/system/status` 的文档
  - 包含完整的请求参数、响应示例和错误码说明
  - 完成后需要与团队成员进行接口设计评审
  - _需求: 4.1_
  
### 阶段

二：后端接口开发（包含单元测试和接口测试）

- [x] 2. 平台管理后端接口开发
  - 在erp-platform-service中实现平台管理相关的后端接口
  - 每个接口都要编写单元测试，确保功能正确性
  - 编写接口测试，验证API的正确性
  - 完成后启动服务进行真实测试验证
  - _需求: 1.1_

- [x] 2.1 平台管理数据模型和实体类创建（基于erp-common）
  - 创建Platform实体类，继承 `com.erp.common.entity.BaseEntity` 基类
  - 使用@TableName("platforms")注解指定表名，利用BaseEntity的通用字段
  - 创建PlatformConfig实体类，继承BaseEntity，使用@TableName("platform_configs")
  - 创建PlatformStatus、PlatformType等枚举类，使用@EnumValue注解
  - 使用@TableField配置JSON字段，利用erp-common的JsonTypeHandler
  - 在数据库中创建表结构，BaseEntity字段已标准化：id、create_time、update_time、create_by、update_by、deleted、version
  - 编写实体类的单元测试，验证继承BaseEntity的字段和erp-common配置
  - 使用 `./scripts/start-infrastructure.sh` 启动数据库服务
  - 验证MyBatis Plus的自动建表、逻辑删除和自动填充功能
  - _需求: 1.1_

- [x] 2.2 平台管理Mapper层开发（基于erp-common）
  - 创建PlatformMapper接口，继承 `com.erp.common.mapper.BaseMapperPlus<Platform>`
  - 创建PlatformConfigMapper接口，继承BaseMapperPlus<PlatformConfig>
  - 使用 `com.erp.common.util.QueryWrapperUtils` 构建类型安全的查询条件
  - 实现自定义查询方法，利用BaseMapperPlus的增强方法如existsByCondition、selectCountByCondition
  - 利用erp-common已配置的分页插件、乐观锁、防攻击等功能
  - 编写Mapper层的单元测试，使用H2内存数据库和@MybatisTest
  - 测试BaseMapperPlus的增强CRUD操作和QueryWrapperUtils工具方法
  - 启动MySQL服务验证erp-common配置的SQL日志输出和分页优化
  - _需求: 1.1_

- [x] 2.3 平台管理Service层开发（基于erp-common）
  - 创建PlatformService接口，继承 `com.erp.common.service.BaseServicePlus<Platform>`
  - 创建PlatformServiceImpl实现类，继承ServiceImpl<PlatformMapper, Platform>并实现BaseServicePlus接口
  - 使用 `com.erp.common.response.PageResult<T>` 统一分页响应格式
  - 利用BaseServicePlus的增强方法：pageQuery、insertBatch、updateBatchByIdEnhanced等
  - 使用QueryWrapperUtils构建查询条件，利用eqIfPresent、likeIfPresent等便捷方法
  - 使用@Transactional注解确保事务管理，配置rollbackFor = Exception.class
  - 实现平台状态监控和同步业务逻辑，使用BaseServicePlus的批量操作方法
  - 编写Service层的单元测试，使用@MockBean模拟Mapper依赖
  - 测试BaseServicePlus提供的增强CRUD方法和PageResult分页封装
  - _需求: 1.1_

- [x] 2.4 平台管理Controller层开发
  - 创建PlatformController类，实现REST API接口
  - 实现 `GET /api/platforms` 平台列表查询接口，返回PageResult<Platform>统一分页格式
  - 实现 `GET/POST/PUT /api/platforms/config` 平台配置接口，使用BaseServicePlus的saveOrUpdateEnhanced()方法
  - 实现 `GET /api/platforms/status` 平台状态监控接口，使用BaseServicePlus的统计查询方法
  - 实现 `POST /api/platforms/{id}/sync` 平台同步接口，使用BaseServicePlus的批量更新方法
  - 使用 `com.erp.common.response.Result` 统一响应格式
  - 添加参数验证注解，如@Valid、@RequestParam等
  - 编写Controller层的单元测试，使用@WebMvcTest和MockMvc
  - 编写接口集成测试，验证PageResult分页响应和erp-common的统一异常处理
  - 使用 `./scripts/start-backend.sh start platform` 启动平台服务
  - 使用curl测试BaseServicePlus的增强CRUD操作和PageResult分页功能
  - _需求: 1.1_

- [x] 3. 物流管理后端接口开发
  - 在erp-logistics-service中实现物流管理相关的后端接口
  - 每个接口都要编写单元测试，确保功能正确性
  - 编写接口测试，验证API的正确性
  - 完成后启动服务进行真实测试验证
  - _需求: 2.1_

- [x] 3.1 物流管理数据模型和实体类创建（基于erp-common）
  - 创建LogisticsOrder实体类，继承 `com.erp.common.entity.BaseEntity`，使用@TableName("logistics_orders")
  - 创建ShippingLabel实体类，继承BaseEntity，使用@TableName("shipping_labels")
  - 创建Address实体类，继承BaseEntity，使用@TableName("addresses")
  - 利用BaseEntity的雪花算法主键、自动填充、逻辑删除、乐观锁等功能
  - 在数据库中创建表结构，继承BaseEntity的标准字段：id、create_time、update_time、create_by、update_by、deleted、version
  - 配置LogisticsStatus、ShippingStatus等枚举类，使用@EnumValue注解
  - 使用erp-common的JsonTypeHandler处理复杂地址信息等JSON字段
  - 编写实体类的单元测试，验证BaseEntity继承和erp-common配置
  - 使用 `./scripts/start-infrastructure.sh` 启动数据库服务
  - 验证erp-common的MyMetaObjectHandler自动填充、逻辑删除和乐观锁功能
  - _需求: 2.1_

- [x] 3.2 物流管理Mapper层开发（基于erp-common）
  - 创建LogisticsOrderMapper接口，继承 `com.erp.common.mapper.BaseMapperPlus<LogisticsOrder>`
  - 创建ShippingLabelMapper接口，继承BaseMapperPlus<ShippingLabel>
  - 创建AddressMapper接口，继承BaseMapperPlus<Address>
  - 使用BaseMapperPlus的增强方法：existsByCondition、selectCountByCondition等
  - 使用QueryWrapperUtils构建复杂查询条件，如状态统计、时间范围查询等
  - 利用erp-common已配置的分页插件、乐观锁、防攻击等功能
  - 编写Mapper层的单元测试，使用@MybatisTest和H2内存数据库
  - 测试BaseMapperPlus的增强方法和QueryWrapperUtils工具类
  - 启动MySQL服务验证erp-common配置的SQL执行日志和分页优化
  - _需求: 2.1_

- [x] 3.3 物流管理Service层开发（基于erp-common）
  - 创建LogisticsService接口，继承 `com.erp.common.service.BaseServicePlus<LogisticsOrder>`
  - 创建LogisticsServiceImpl实现类，继承ServiceImpl<LogisticsOrderMapper, LogisticsOrder>并实现BaseServicePlus接口
  - 使用 `com.erp.common.response.PageResult<T>` 统一分页响应格式
  - 实现面单生成业务逻辑，使用BaseServicePlus的insertBatch()批量保存
  - 使用@Transactional(rollbackFor = Exception.class)确保事务一致性
  - 实现物流跟踪和异常处理，使用BaseServicePlus的updateBatchByIdEnhanced()批量更新状态
  - 使用QueryWrapperUtils构建查询条件，利用betweenTime、eqIfPresent等便捷方法
  - 编写Service层的单元测试，使用@MockBean模拟Mapper依赖
  - 测试BaseServicePlus的增强方法和PageResult分页封装
  - _需求: 2.1_

- [x] 3.4 物流管理Controller层开发
  - 创建LogisticsController类，实现REST API接口
  - 实现 `GET /api/logistics/orders` 物流订单查询接口，返回PageResult<LogisticsOrder>统一分页格式
  - 实现 `POST /api/logistics/labels` 面单生成接口，使用BaseServicePlus的insertBatch()批量保存
  - 实现 `GET /api/logistics/tracking/{trackingNumber}` 物流跟踪接口
  - 实现 `GET/POST /api/logistics/exceptions` 物流异常处理接口
  - 使用 `com.erp.common.response.Result` 统一响应格式
  - 使用QueryWrapperUtils实现复杂的订单状态筛选
  - 编写Controller层的单元测试，使用@WebMvcTest注解
  - 编写接口集成测试，验证BaseServicePlus的批量操作和PageResult分页响应
  - 使用 `./scripts/start-backend.sh start logistics` 启动物流服务
  - 使用curl测试BaseServicePlus的增强批量操作和PageResult分页功能
  - _需求: 2.1_
  

- [x] 4.通知中心后端接口开发
  - 在erp-notification-service中实现通知管理相关的后端接口
  - 实现WebSocket实时通知推送功能
  - 每个接口都要编写单元测试，确保功能正确性
  - 编写接口测试，验证API的正确性和WebSocket连接
  - 完成后启动服务进行真实测试验证
  - _需求: 3.1_

- [x] 4.1 通知中心数据模型和实体类创建（基于erp-common）
  - 创建Notification实体类，继承 `com.erp.common.entity.BaseEntity`，使用@TableName("notifications")
  - 创建NotificationTemplate实体类，继承BaseEntity，使用@TableName("notification_templates")
  - 创建NotificationRule实体类，继承BaseEntity，使用@TableName("notification_rules")
  - 配置NotificationType、NotificationStatus等枚举，使用@EnumValue注解
  - 使用erp-common的JsonTypeHandler处理规则条件等复杂JSON字段
  - 利用BaseEntity的自动填充功能，无需手动配置@TableField(fill = FieldFill.INSERT)
  - 在数据库中创建表结构，继承BaseEntity的标准字段，添加中文注释和索引
  - 编写实体类的单元测试，验证BaseEntity继承和JsonTypeHandler处理
  - 使用 `./scripts/start-infrastructure.sh` 启动数据库服务
  - 验证erp-common的JsonTypeHandler和MyMetaObjectHandler自动填充功能
  - _需求: 3.1_

- [x] 4.2 通知中心Mapper层开发（基于erp-common）
  - 创建NotificationMapper接口，继承 `com.erp.common.mapper.BaseMapperPlus<Notification>`
  - 创建NotificationTemplateMapper接口，继承BaseMapperPlus<NotificationTemplate>
  - 创建NotificationRuleMapper接口，继承BaseMapperPlus<NotificationRule>
  - 使用BaseMapperPlus的selectCountByCondition方法实现未读通知数量统计
  - 使用QueryWrapperUtils构建查询条件，如根据用户ID、通知类型查询等
  - 利用BaseMapperPlus的existsByCondition、selectPageByCondition等增强方法
  - 编写Mapper层的单元测试，使用@MybatisTest注解
  - 测试BaseMapperPlus的批量更新和erp-common的逻辑删除功能
  - 启动MySQL服务验证erp-common的JsonTypeHandler和索引性能
  - _需求: 3.1_

- [x] 4.3 通知中心Service层开发（基于erp-common）
  - 创建NotificationService接口，继承 `com.erp.common.service.BaseServicePlus<Notification>`
  - 创建NotificationServiceImpl实现类，继承ServiceImpl<NotificationMapper, Notification>并实现BaseServicePlus接口
  - 使用 `com.erp.common.response.PageResult<T>` 实现通知列表分页查询
  - 使用BaseServicePlus的updateBatchByIdEnhanced()实现批量标记已读功能
  - 使用BaseServicePlus的countByCondition()方法实现未读通知数量统计
  - 使用@Transactional注解确保通知操作的事务性
  - 实现WebSocket实时通知推送，集成Spring WebSocket
  - 编写Service层的单元测试，模拟BaseServicePlus的增强操作
  - 测试BaseServicePlus的批量操作和PageResult分页封装功能
  - _需求: 3.1_

- [x] 4.4 通知中心Controller和WebSocket开发
  - 创建NotificationController类，实现REST API接口
  - 实现 `GET /api/notifications` 通知列表查询接口，返回PageResult<Notification>统一分页格式
  - 实现 `PUT /api/notifications/{id}/read` 通知标记已读接口，使用BaseServicePlus的updateById()
  - 实现 `DELETE /api/notifications/{id}` 通知删除接口，使用erp-common的逻辑删除
  - 实现 `GET /api/notifications/unread-count` 未读通知数量接口，使用BaseServicePlus的countByCondition()统计
  - 实现批量操作接口，使用BaseServicePlus的updateBatchByIdEnhanced()批量更新状态
  - 使用 `com.erp.common.response.Result` 统一响应格式
  - 创建NotificationWebSocketHandler，实现WebSocket通信
  - 编写Controller层的单元测试，使用@WebMvcTest注解
  - 编写WebSocket集成测试，验证实时通知推送和BaseServicePlus操作
  - 使用 `./scripts/start-backend.sh start notification` 启动通知服务
  - 使用curl测试erp-common的逻辑删除和BaseServicePlus的批量更新功能
  - _需求: 3.1_

- [x] 5. 系统设置后端接口开发 ✅
  - 在相应服务中实现系统设置相关的后端接口
  - 每个接口都要编写单元测试，确保功能正确性
  - 编写接口测试，验证API的正确性
  - 完成后启动服务进行真实测试验证
  - _需求: 4.1_

**✅ 系统设置接口测试结果**:
- ✅ `GET /api/system/config` - 系统配置查询接口（支持分类筛选）
- ✅ `PUT /api/system/config` - 系统配置更新接口（使用BaseServicePlus的saveOrUpdateEnhanced()）
- ✅ `GET /api/system/logs` - 系统日志查询接口（返回PageResult<SystemLog>分页格式）
- ✅ `GET /api/system/status` - 系统状态监控接口（使用BaseServicePlus的统计查询）
- ✅ 分类筛选功能正常（SYSTEM: 4条记录，BUSINESS: 2条记录）
- ✅ 所有接口返回统一的Result格式
- ✅ 分页功能正常工作
- ✅ 数据库字段类型已修复（config_value: JSON → TEXT）
- ✅ 单元测试已修复并通过编译

- [x] 5.1 系统设置数据模型和实体类创建（基于erp-common）
  - 创建SystemConfig实体类，继承 `com.erp.common.entity.BaseEntity`，使用@TableName("system_configs")
  - 创建SystemLog实体类，继承BaseEntity，使用@TableName("system_logs")
  - 创建SystemStatus实体类，继承BaseEntity，使用@TableName("system_status")
  - 使用erp-common的JsonTypeHandler处理JSON配置字段，无需手动配置typeHandler
  - 配置ConfigType、LogLevel等枚举类，使用@EnumValue注解
  - 在数据库中创建表结构，继承BaseEntity的标准字段，为日志表创建时间索引
  - 利用erp-common已配置的JsonTypeHandler，支持复杂配置对象序列化
  - 编写实体类的单元测试，验证BaseEntity继承和JsonTypeHandler处理
  - 使用 `./scripts/start-infrastructure.sh` 启动数据库服务
  - 验证erp-common的JsonTypeHandler和索引优化效果
  - _需求: 4.1_

- [x] 5.2 系统设置Mapper层开发（基于erp-common）
  - 创建SystemConfigMapper接口，继承 `com.erp.common.mapper.BaseMapperPlus<SystemConfig>`
  - 创建SystemLogMapper接口，继承BaseMapperPlus<SystemLog>
  - 创建SystemStatusMapper接口，继承BaseMapperPlus<SystemStatus>
  - 使用BaseMapperPlus的selectCountByCondition方法实现配置分类查询和统计
  - 使用QueryWrapperUtils的betweenTime、eqIfPresent方法实现日志查询，支持时间范围和级别筛选
  - 利用erp-common已配置的分页插件，优化大数据量日志查询
  - 使用QueryWrapperUtils构建复杂的日志筛选条件
  - 编写Mapper层的单元测试，使用@MybatisTest注解
  - 测试BaseMapperPlus的分页查询和QueryWrapperUtils条件筛选性能
  - 启动MySQL服务验证erp-common的索引优化和查询性能
  - _需求: 4.1_

- [x] 5.3 系统设置Service层开发（基于erp-common）
  - 创建SystemService接口，继承 `com.erp.common.service.BaseServicePlus<SystemConfig>`
  - 创建SystemServiceImpl实现类，继承ServiceImpl<SystemConfigMapper, SystemConfig>并实现BaseServicePlus接口
  - 使用 `com.erp.common.response.PageResult<T>` 实现系统日志分页查询
  - 实现配置更新业务逻辑，使用BaseServicePlus的saveOrUpdateEnhanced()方法
  - 使用@Transactional注解确保配置更新的原子性
  - 实现系统状态监控，使用BaseServicePlus的countByCondition()等统计查询方法
  - 配置Redis缓存，优化频繁访问的系统配置查询
  - 编写Service层的单元测试，模拟BaseServicePlus的增强操作
  - 测试BaseServicePlus的缓存机制和事务管理
  - _需求: 4.1_

- [x] 5.4 系统设置Controller层开发
  - 创建SystemController类，实现REST API接口
  - 实现 `GET /api/system/config` 系统配置查询接口，支持分类筛选
  - 实现 `PUT /api/system/config` 系统配置更新接口，使用BaseServicePlus的saveOrUpdateEnhanced()
  - 实现 `GET /api/system/logs` 系统日志查询接口，返回PageResult<SystemLog>分页格式和时间范围筛选
  - 实现 `GET /api/system/status` 系统状态监控接口，使用BaseServicePlus的统计查询
  - 使用 `com.erp.common.response.Result` 统一响应格式
  - 使用QueryWrapperUtils实现复杂的日志筛选条件
  - 编写Controller层的单元测试，使用@WebMvcTest注解
  - 编写接口集成测试，验证PageResult分页查询和erp-common的JSON字段处理
  - 使用 `./scripts/start-backend.sh start system` 启动系统服务
  - 使用curl测试BaseServicePlus的条件查询和配置更新功能
  - _需求: 4.1_
  

### 阶段

三：前端页面开发（包含端到端测试）

- [x] 6. 导航菜单结构优化
  - 更新导航配置，添加缺失的子菜单结构
  - 实现菜单展开/收起动画效果
  - 添加菜单项徽章显示功能
  - 优化菜单权限控制逻辑
  - 完成后启动前端服务进行真实测试验证
  - _需求: 1.1, 2.1, 4.1, 5.1_

- [x] 6.1 平台管理子菜单实现
  - 在useNavigation.ts中添加平台管理子菜单配置
  - 创建平台配置页面路由 `/platforms/config`
  - 实现平台管理菜单的权限控制
  - 添加平台连接状态徽章显示
  - 编写菜单组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户点击菜单，验证导航功能
  - 测试面包屑导航显示是否正确
  - _需求: 1.1_

- [x] 6.2 物流管理子菜单实现
  - 在useNavigation.ts中添加物流管理子菜单配置
  - 确保面单管理页面路由正确配置
  - 实现物流管理菜单的权限控制
  - 添加待处理面单数量徽章显示
  - 编写菜单组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户点击菜单，验证导航功能
  - 测试面包屑导航显示是否正确
  - _需求: 2.1_

- [x] 6.3 系统设置子菜单实现
  - 在useNavigation.ts中添加系统设置子菜单配置
  - 创建系统日志页面路由 `/settings/logs`
  - 实现系统设置菜单的权限控制
  - 添加系统异常徽章显示
  - 编写菜单组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户点击菜单，验证导航功能
  - 测试面包屑导航显示是否正确
  - _需求: 4.1_

- [ ] 7. 通用组件开发
  - 创建PageHeader、DataTable、FormBuilder、StatusBadge等通用组件
  - 实现统一的页面布局和交互规范
  - 编写组件单元测试
  - 完成后进行组件集成测试
  - _需求: 6.1, 7.1, 8.1, 9.1_

- [ ] 7.1 PageHeader组件开发
  - 创建PageHeader.vue组件文件
  - 实现title、subtitle、actions等属性支持
  - 添加返回、刷新、帮助等通用操作
  - 实现响应式布局适配
  - 编写组件单元测试，测试属性和事件
  - 使用 `./scripts/start-frontend.sh` 启动前端服务
  - 创建测试页面验证组件功能
  - 进行端到端测试：模拟用户点击各种操作按钮
  - _需求: 6.1_

- [ ] 7.2 DataTable组件开发
  - 创建DataTable.vue组件文件
  - 实现columns、dataSource等核心属性
  - 添加loading、empty状态处理
  - 实现表格的排序和筛选功能
  - 添加批量选择和操作工具栏
  - 编写组件单元测试，测试表格功能
  - 使用 `./scripts/start-frontend.sh` 启动前端服务
  - 创建测试页面验证组件功能
  - 进行端到端测试：模拟用户进行排序、筛选、选择等操作
  - _需求: 7.1_

- [ ] 7.3 FormBuilder组件开发
  - 创建FormBuilder.vue组件文件
  - 实现fields配置驱动的表单生成
  - 添加各种表单控件类型支持
  - 实现表单验证和错误提示
  - 添加表单提交和重置功能
  - 编写组件单元测试，测试表单功能
  - 使用 `./scripts/start-frontend.sh` 启动前端服务
  - 创建测试页面验证组件功能
  - 进行端到端测试：模拟用户填写表单、提交、验证等操作
  - _需求: 8.1_

- [ ] 7.4 StatusBadge组件开发
  - 创建StatusBadge.vue组件文件
  - 定义状态类型枚举和颜色映射
  - 实现不同状态的图标和颜色显示
  - 添加状态描述和工具提示功能
  - 编写组件单元测试，测试状态显示
  - 使用 `./scripts/start-frontend.sh` 启动前端服务
  - 创建测试页面验证组件功能
  - 进行端到端测试：验证各种状态的显示效果
  - _需求: 9.1_-
 [ ] 8. 平台管理页面开发
  - 实现平台列表页面和平台配置页面
  - 集成后端API接口，实现完整的数据交互
  - 编写页面组件单元测试
  - 完成后进行端到端测试，验证完整业务流程
  - _需求: 1.1_

- [ ] 8.1 平台列表页面开发
  - 更新PlatformManagement.vue页面
  - 实现平台列表查询，调用 `GET /api/platforms` 接口
  - 添加平台状态显示和筛选功能
  - 实现平台的启用/禁用操作
  - 添加平台删除和批量操作功能
  - 集成DataTable和PageHeader组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户查看平台列表、筛选、操作等完整流程
  - 验证API调用和数据显示的正确性
  - _需求: 1.1_

- [ ] 8.2 平台配置页面开发
  - 创建PlatformConfig.vue页面组件
  - 实现平台配置表单，调用 `GET/POST/PUT /api/platforms/config` 接口
  - 添加平台类型选择和参数配置
  - 实现平台连接测试功能
  - 添加配置保存和验证功能
  - 集成FormBuilder和PageHeader组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户配置平台、测试连接、保存等完整流程
  - 验证表单验证和API调用的正确性
  - _需求: 1.1_

- [ ] 9. 物流管理页面开发
  - 更新物流列表页面和完善面单管理功能
  - 集成后端API接口，实现完整的数据交互
  - 编写页面组件单元测试
  - 完成后进行端到端测试，验证完整业务流程
  - _需求: 2.1_

- [ ] 9.1 物流列表页面更新
  - 更新LogisticsManagement.vue页面
  - 实现物流订单查询，调用 `GET /api/logistics/orders` 接口
  - 添加物流状态筛选和搜索功能
  - 实现物流跟踪查询，调用 `GET /api/logistics/tracking/{trackingNumber}` 接口
  - 添加批量操作和导出功能
  - 集成DataTable和PageHeader组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户查看物流订单、跟踪、筛选等完整流程
  - 验证API调用和数据显示的正确性
  - _需求: 2.1_

- [ ] 9.2 面单管理功能完善
  - 更新ShippingLabels.vue页面
  - 实现面单生成功能，调用 `POST /api/logistics/labels` 接口
  - 添加面单模板选择和预览
  - 实现批量面单生成和打印
  - 添加面单历史记录查询
  - 集成相关通用组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户生成面单、预览、打印等完整流程
  - 验证面单生成和API调用的正确性
  - _需求: 2.1_

- [ ] 10. 通知中心页面开发
  - 实现通知列表页面和实时通知功能
  - 集成后端API接口和WebSocket连接
  - 编写页面组件单元测试
  - 完成后进行端到端测试，验证完整业务流程
  - _需求: 3.1_

- [ ] 10.1 通知中心页面开发
  - 创建NotificationCenter.vue页面组件
  - 实现通知列表的查询和显示，调用 `GET /api/notifications` 接口
  - 添加通知筛选和搜索功能
  - 实现通知标记已读功能，调用 `PUT /api/notifications/{id}/read` 接口
  - 实现通知删除功能，调用 `DELETE /api/notifications/{id}` 接口
  - 添加批量操作功能
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户查看通知、标记已读、删除等完整流程
  - 验证API调用和数据显示的正确性
  - _需求: 3.1_

- [ ] 10.2 实时通知功能实现
  - 创建NotificationService服务类
  - 实现WebSocket连接管理，连接 `WS /api/notifications/ws`
  - 添加实时通知接收和处理
  - 实现通知数量徽章更新，调用 `GET /api/notifications/unread-count` 接口
  - 添加桌面通知支持
  - 集成到MainLayout组件中
  - 编写服务类的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟实时通知推送、徽章更新等功能
  - 验证WebSocket连接和实时通知的正确性
  - _需求: 3.1_

- [ ] 11. 系统设置页面开发
  - 更新系统配置页面和创建系统日志页面
  - 集成后端API接口，实现完整的数据交互
  - 编写页面组件单元测试
  - 完成后进行端到端测试，验证完整业务流程
  - _需求: 4.1_

- [ ] 11.1 系统配置页面更新
  - 更新SystemSettings.vue页面
  - 实现系统配置查询，调用 `GET /api/system/config` 接口
  - 添加配置分类和搜索功能
  - 实现配置更新功能，调用 `PUT /api/system/config` 接口
  - 添加配置验证和保存确认
  - 集成FormBuilder和PageHeader组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户查看配置、修改、保存等完整流程
  - 验证配置更新和API调用的正确性
  - _需求: 4.1_

- [ ] 11.2 系统日志页面开发
  - 创建SystemLogs.vue页面组件
  - 实现系统日志查询，调用 `GET /api/system/logs` 接口
  - 添加日志级别筛选和时间范围选择
  - 实现日志搜索和导出功能
  - 添加日志详情查看和分析
  - 集成DataTable和PageHeader组件
  - 编写页面组件的单元测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 进行端到端测试：模拟用户查看日志、筛选、搜索等完整流程
  - 验证日志查询和API调用的正确性
  - _需求: 4.1_

### 阶段四：系统集成测试和优化

- [ ] 12. 全系统集成测试
  - 进行完整的系统集成测试
  - 验证所有功能模块的协同工作
  - 进行性能测试和优化
  - 修复发现的问题和缺陷
  - _需求: 所有需求_

- [ ] 12.1 端到端业务流程测试
  - 使用 `./scripts/start-services.sh` 启动完整系统
  - 测试完整的平台管理业务流程：添加平台→配置→监控→同步
  - 测试完整的物流管理业务流程：查看订单→生成面单→跟踪物流
  - 测试完整的通知中心业务流程：接收通知→查看详情→标记已读
  - 测试完整的系统设置业务流程：查看配置→修改设置→查看日志
  - 验证所有功能的正确性和用户体验
  - _需求: 所有需求_

- [ ] 12.2 性能测试和优化
  - 进行前端页面加载性能测试
  - 进行后端API接口性能测试
  - 进行数据库查询性能测试
  - 优化发现的性能瓶颈
  - 验证优化效果
  - _需求: 所有需求_

- [ ] 12.3 错误处理和用户体验优化
  - 测试各种异常情况的处理
  - 优化错误提示和用户反馈
  - 完善加载状态和空状态处理
  - 验证权限控制的正确性
  - 确保用户体验的一致性
  - _需求: 所有需求_

## 测试验证要求

每个任务完成后都必须进行以下验证：

1. **单元测试通过** - 所有相关的单元测试必须通过
2. **服务启动成功** - 使用启动脚本成功启动相关服务
3. **功能验证** - 手动测试或自动化测试验证功能正确性
4. **API测试** - 使用curl、Postman或自动化测试验证API接口
5. **端到端测试** - 模拟真实用户操作验证完整业务流程

## 开发注意事项

### 通用开发规范
1. **严格按照阶段顺序执行** - 必须先完成API文档，再开发后端，最后开发前端
2. **每个接口都要测试** - 开发完一个接口立即进行测试验证
3. **真实服务验证** - 每个任务完成后都要启动真实服务进行验证
4. **代码质量保证** - 遵循代码规范，编写中文注释，保证测试覆盖率
5. **问题及时修复** - 发现问题立即修复，不要积累到最后

### 基于erp-common的开发注意事项

#### 实体类开发（基于BaseEntity）
- **必须继承BaseEntity** - 获得标准字段（id、createTime、updateTime、createBy、updateBy、deleted、version）
- **雪花算法主键** - BaseEntity已配置@TableId(type = IdType.ASSIGN_ID)，无需重复配置
- **自动填充字段** - BaseEntity已配置自动填充，MyMetaObjectHandler会自动处理审计字段
- **逻辑删除和乐观锁** - BaseEntity已配置@TableLogic和@Version，直接使用即可
- **枚举类型处理** - 使用@EnumValue注解，确保枚举值正确存储到数据库
- **JSON字段处理** - 使用erp-common的JsonTypeHandler处理复杂对象字段

#### Mapper层开发（基于BaseMapperPlus）
- **继承BaseMapperPlus** - 获得增强的CRUD方法，如existsByCondition、selectCountByCondition等
- **使用QueryWrapperUtils** - 利用工具类构建类型安全的查询条件，如eqIfPresent、likeIfPresent等
- **分页查询优化** - 利用erp-common已配置的分页插件，支持MySQL优化和防攻击
- **自定义查询简化** - 优先使用BaseMapperPlus的增强方法，减少自定义SQL

#### Service层开发（基于BaseServicePlus）
- **继承BaseServicePlus** - 获得增强的Service方法，如pageQuery、insertBatch、updateBatchByIdEnhanced等
- **统一分页响应** - 使用PageResult<T>统一分页响应格式，包含完整的分页信息
- **批量操作优化** - 使用BaseServicePlus的增强批量方法，支持指定批次大小
- **事务注解使用** - @Transactional(rollbackFor = Exception.class)确保异常回滚
- **条件查询简化** - 使用QueryWrapperUtils构建查询条件，支持时间范围、模糊查询等

#### 响应格式统一（基于erp-common）
- **统一响应格式** - 使用com.erp.common.response.Result统一API响应格式
- **分页响应格式** - 使用com.erp.common.response.PageResult统一分页响应
- **异常处理** - 利用erp-common的统一异常处理机制

#### 性能优化建议（基于erp-common配置）
- **分页插件优化** - erp-common已配置单页最大1000条记录和JOIN优化
- **乐观锁控制** - 利用BaseEntity的version字段进行并发控制
- **防攻击保护** - erp-common已配置防止全表更新删除操作
- **JSON字段优化** - 使用erp-common的JsonTypeHandler，支持复杂对象序列化

#### 测试验证要点（基于erp-common）
- **BaseEntity测试** - 验证继承BaseEntity的自动填充、逻辑删除、乐观锁功能
- **BaseMapperPlus测试** - 测试增强的Mapper方法和QueryWrapperUtils工具类
- **BaseServicePlus测试** - 测试增强的Service方法和PageResult分页封装
- **JsonTypeHandler测试** - 验证JSON字段的序列化和反序列化功能
- **集成测试验证** - 验证erp-common配置的分页、事务、异常处理等功能