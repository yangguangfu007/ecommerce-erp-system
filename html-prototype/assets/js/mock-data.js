/* Mock Data - 模拟数据 */

// 数据生成工具函数
const DataGenerator = {
  // 生成随机ID
  generateId: () => Date.now() + Math.floor(Math.random() * 1000),
  
  // 生成随机日期
  generateDate: (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },
  
  // 生成随机价格
  generatePrice: (min = 100, max = 20000) => {
    return Math.floor(Math.random() * (max - min) + min) + 0.99;
  },
  
  // 生成随机库存
  generateStock: (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min) + min);
  },
  
  // 生成随机手机号
  generatePhone: () => {
    const prefixes = ['138', '139', '150', '151', '152', '158', '159', '188', '189'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  },
  
  // 生成随机邮箱
  generateEmail: (username) => {
    const domains = ['example.com', 'test.com', 'demo.com', 'sample.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
  },
  
  // 生成随机地址
  generateAddress: () => {
    const provinces = ['广东省', '北京市', '上海市', '江苏省', '浙江省', '四川省', '湖北省', '山东省'];
    const cities = ['深圳市', '广州市', '北京市', '上海市', '南京市', '杭州市', '成都市', '武汉市', '青岛市'];
    const districts = ['南山区', '福田区', '朝阳区', '浦东新区', '鼓楼区', '西湖区', '锦江区', '武昌区', '市南区'];
    const streets = ['科技园南区', '建国门外大街', '陆家嘴环路', '中山路', '文三路', '春熙路', '中南路', '香港中路'];
    
    return {
      province: provinces[Math.floor(Math.random() * provinces.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      district: districts[Math.floor(Math.random() * districts.length)],
      street: streets[Math.floor(Math.random() * streets.length)] + Math.floor(Math.random() * 999) + '号'
    };
  }
};

// 平台模拟数据
const mockPlatforms = [
  {
    id: 1,
    name: '沃尔玛官方旗舰店',
    type: 'walmart',
    url: 'https://marketplace.walmart.com/store/12345',
    logo: 'https://via.placeholder.com/32x32?text=W',
    status: 'active',
    syncStatus: 'success',
    lastSync: '2024-01-15 14:30:25',
    productCount: 1250,
    orderCount: 3420,
    createdAt: '2023-06-15 10:20:30'
  },
  {
    id: 2,
    name: '亚马逊专营店',
    type: 'amazon',
    url: 'https://amazon.com/seller/67890',
    logo: 'https://via.placeholder.com/32x32?text=A',
    status: 'active',
    syncStatus: 'syncing',
    lastSync: '2024-01-15 14:25:10',
    productCount: 890,
    orderCount: 2150,
    createdAt: '2023-08-20 15:45:12'
  },
  {
    id: 3,
    name: 'eBay商城店铺',
    type: 'ebay',
    url: 'https://ebay.com/store/mystore',
    logo: 'https://via.placeholder.com/32x32?text=E',
    status: 'error',
    syncStatus: 'failed',
    lastSync: '2024-01-15 12:15:45',
    productCount: 560,
    orderCount: 1280,
    createdAt: '2023-09-10 09:30:20'
  },
  {
    id: 4,
    name: 'Shopify独立站',
    type: 'shopify',
    url: 'https://mystore.myshopify.com',
    logo: 'https://via.placeholder.com/32x32?text=S',
    status: 'active',
    syncStatus: 'success',
    lastSync: '2024-01-15 14:28:33',
    productCount: 320,
    orderCount: 850,
    createdAt: '2023-11-05 16:20:15'
  },
  {
    id: 5,
    name: '淘宝企业店铺',
    type: 'taobao',
    url: 'https://shop.taobao.com/12345',
    logo: 'https://via.placeholder.com/32x32?text=T',
    status: 'inactive',
    syncStatus: 'pending',
    lastSync: '2024-01-14 18:45:20',
    productCount: 2100,
    orderCount: 5680,
    createdAt: '2023-05-12 11:15:40'
  }
];

const mockData = {
  // 角色数据
  roles: [
    {
      id: 1,
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
      permissions: ['*'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: 2,
      name: '管理员',
      code: 'admin',
      description: '系统管理员，拥有大部分权限',
      permissions: ['user:*', 'product:*', 'order:*', 'inventory:*', 'platform:*'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: 3,
      name: '运营人员',
      code: 'operator',
      description: '负责日常运营管理',
      permissions: ['product:read', 'product:write', 'order:*', 'inventory:read'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: 4,
      name: '仓库管理员',
      code: 'warehouse',
      description: '负责库存和物流管理',
      permissions: ['inventory:*', 'logistics:*', 'order:read'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: 5,
      name: '客服人员',
      code: 'customer_service',
      description: '负责客户服务和订单处理',
      permissions: ['order:read', 'order:update', 'customer:*'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: 6,
      name: '财务人员',
      code: 'finance',
      description: '负责财务管理和报表',
      permissions: ['finance:*', 'order:read', 'report:*'],
      status: 'active',
      createdAt: '2024-01-01 00:00:00'
    }
  ],

  // 商品分类数据
  categories: [
    {
      id: 1,
      name: '手机数码',
      code: 'mobile_digital',
      parentId: null,
      level: 1,
      sort: 1,
      status: 'active',
      children: [
        { id: 11, name: '手机', code: 'mobile', parentId: 1, level: 2, sort: 1, status: 'active' },
        { id: 12, name: '平板电脑', code: 'tablet', parentId: 1, level: 2, sort: 2, status: 'active' },
        { id: 13, name: '智能穿戴', code: 'wearable', parentId: 1, level: 2, sort: 3, status: 'active' },
        { id: 14, name: '耳机音响', code: 'audio', parentId: 1, level: 2, sort: 4, status: 'active' }
      ]
    },
    {
      id: 2,
      name: '电脑办公',
      code: 'computer_office',
      parentId: null,
      level: 1,
      sort: 2,
      status: 'active',
      children: [
        { id: 21, name: '笔记本电脑', code: 'laptop', parentId: 2, level: 2, sort: 1, status: 'active' },
        { id: 22, name: '台式电脑', code: 'desktop', parentId: 2, level: 2, sort: 2, status: 'active' },
        { id: 23, name: '办公设备', code: 'office_equipment', parentId: 2, level: 2, sort: 3, status: 'active' },
        { id: 24, name: '电脑配件', code: 'computer_accessories', parentId: 2, level: 2, sort: 4, status: 'active' }
      ]
    },
    {
      id: 3,
      name: '游戏娱乐',
      code: 'gaming',
      parentId: null,
      level: 1,
      sort: 3,
      status: 'active',
      children: [
        { id: 31, name: '游戏机', code: 'console', parentId: 3, level: 2, sort: 1, status: 'active' },
        { id: 32, name: '游戏配件', code: 'gaming_accessories', parentId: 3, level: 2, sort: 2, status: 'active' },
        { id: 33, name: '游戏软件', code: 'games', parentId: 3, level: 2, sort: 3, status: 'active' }
      ]
    },
    {
      id: 4,
      name: '摄影摄像',
      code: 'photography',
      parentId: null,
      level: 1,
      sort: 4,
      status: 'active',
      children: [
        { id: 41, name: '数码相机', code: 'camera', parentId: 4, level: 2, sort: 1, status: 'active' },
        { id: 42, name: '摄像设备', code: 'video_equipment', parentId: 4, level: 2, sort: 2, status: 'active' },
        { id: 43, name: '摄影配件', code: 'photo_accessories', parentId: 4, level: 2, sort: 3, status: 'active' }
      ]
    }
  ],

  // 品牌数据
  brands: [
    { id: 1, name: 'Apple', logo: 'assets/images/brands/apple.png', status: 'active' },
    { id: 2, name: 'Samsung', logo: 'assets/images/brands/samsung.png', status: 'active' },
    { id: 3, name: 'Dell', logo: 'assets/images/brands/dell.png', status: 'active' },
    { id: 4, name: 'Sony', logo: 'assets/images/brands/sony.png', status: 'active' },
    { id: 5, name: 'Nintendo', logo: 'assets/images/brands/nintendo.png', status: 'active' },
    { id: 6, name: 'Logitech', logo: 'assets/images/brands/logitech.png', status: 'active' },
    { id: 7, name: 'Microsoft', logo: 'assets/images/brands/microsoft.png', status: 'active' },
    { id: 8, name: 'Canon', logo: 'assets/images/brands/canon.png', status: 'active' }
  ],

  // 用户数据
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 'active',
      roles: ['管理员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-15 10:30:00',
      lastLogin: '2024-02-05 14:20:00'
    },
    {
      id: 2,
      username: 'operator',
      email: 'operator@example.com',
      phone: '13800138001',
      status: 'active',
      roles: ['运营人员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-20 09:15:00',
      lastLogin: '2024-02-05 11:45:00'
    },
    {
      id: 3,
      username: 'warehouse',
      email: 'warehouse@example.com',
      phone: '13800138002',
      status: 'active',
      roles: ['仓库管理员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-25 14:20:00',
      lastLogin: '2024-02-04 16:30:00'
    },
    {
      id: 4,
      username: 'customer_service',
      email: 'cs@example.com',
      phone: '13800138003',
      status: 'inactive',
      roles: ['客服人员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-02-01 11:00:00',
      lastLogin: '2024-02-03 09:20:00'
    },
    {
      id: 5,
      username: 'sales_manager',
      email: 'sales@example.com',
      phone: '13800138004',
      status: 'active',
      roles: ['销售经理'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-28 16:45:00',
      lastLogin: '2024-02-05 09:30:00'
    },
    {
      id: 6,
      username: 'finance',
      email: 'finance@example.com',
      phone: '13800138005',
      status: 'active',
      roles: ['财务人员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-30 13:20:00',
      lastLogin: '2024-02-04 17:15:00'
    },
    {
      id: 7,
      username: 'logistics',
      email: 'logistics@example.com',
      phone: '13800138006',
      status: 'active',
      roles: ['物流专员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-02-02 10:10:00',
      lastLogin: '2024-02-05 08:45:00'
    },
    {
      id: 8,
      username: 'product_manager',
      email: 'pm@example.com',
      phone: '13800138007',
      status: 'inactive',
      roles: ['产品经理'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-18 14:30:00',
      lastLogin: '2024-02-01 12:20:00'
    },
    {
      id: 9,
      username: 'marketing',
      email: 'marketing@example.com',
      phone: '13800138008',
      status: 'active',
      roles: ['市场专员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-22 11:15:00',
      lastLogin: '2024-02-05 15:30:00'
    },
    {
      id: 10,
      username: 'it_support',
      email: 'it@example.com',
      phone: '13800138009',
      status: 'active',
      roles: ['技术支持'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-26 09:40:00',
      lastLogin: '2024-02-04 20:10:00'
    },
    {
      id: 11,
      username: 'data_analyst',
      email: 'data@example.com',
      phone: '13800138010',
      status: 'active',
      roles: ['数据分析师'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-29 15:25:00',
      lastLogin: '2024-02-05 13:50:00'
    },
    {
      id: 12,
      username: 'quality_control',
      email: 'qc@example.com',
      phone: '13800138011',
      status: 'inactive',
      roles: ['质检员'],
      avatar: '../../assets/images/avatars/admin.svg',
      createdAt: '2024-01-31 12:00:00',
      lastLogin: '2024-02-02 16:40:00'
    }
  ],

  // 商品数据
  products: [
    {
      id: 1,
      sku: 'SKU001',
      name: 'iPhone 15 Pro Max',
      category: '手机数码',
      price: 9999.00,
      stock: 50,
      status: 'active',
      images: ['../../assets/images/products/iphone15.svg'],
      attributes: {
        brand: 'Apple',
        color: '深空黑色',
        storage: '256GB'
      },
      createdAt: '2024-01-10 08:00:00'
    },
    {
      id: 2,
      sku: 'SKU002',
      name: 'MacBook Pro 14英寸',
      category: '电脑办公',
      price: 15999.00,
      stock: 25,
      status: 'active',
      images: ['../../assets/images/products/macbook.svg'],
      attributes: {
        brand: 'Apple',
        processor: 'M3 Pro',
        memory: '16GB'
      },
      createdAt: '2024-01-12 10:30:00'
    },
    {
      id: 3,
      sku: 'SKU003',
      name: 'AirPods Pro 2',
      category: '手机数码',
      price: 1899.00,
      stock: 8,
      status: 'active',
      images: ['../../assets/images/products/airpods.svg'],
      attributes: {
        brand: 'Apple',
        color: '白色',
        type: '入耳式'
      },
      createdAt: '2024-01-15 16:45:00'
    },
    {
      id: 4,
      sku: 'SKU004',
      name: 'iPad Air',
      category: '电脑办公',
      price: 4399.00,
      stock: 0,
      status: 'inactive',
      images: ['../../assets/images/products/ipad.svg'],
      attributes: {
        brand: 'Apple',
        screen: '10.9英寸',
        storage: '64GB'
      },
      createdAt: '2024-01-18 13:20:00'
    },
    {
      id: 5,
      sku: 'SKU005',
      name: 'Samsung Galaxy S24 Ultra',
      category: '手机数码',
      price: 8999.00,
      stock: 35,
      status: 'active',
      images: ['../../assets/images/products/samsung-s24.svg'],
      attributes: {
        brand: 'Samsung',
        color: '钛金灰',
        storage: '256GB'
      },
      createdAt: '2024-01-20 14:15:00'
    },
    {
      id: 6,
      sku: 'SKU006',
      name: 'Dell XPS 13',
      category: '电脑办公',
      price: 12999.00,
      stock: 15,
      status: 'active',
      images: ['../../assets/images/products/dell-xps13.svg'],
      attributes: {
        brand: 'Dell',
        processor: 'Intel i7',
        memory: '16GB'
      },
      createdAt: '2024-01-22 09:30:00'
    },
    {
      id: 7,
      sku: 'SKU007',
      name: 'Sony WH-1000XM5',
      category: '手机数码',
      price: 2399.00,
      stock: 42,
      status: 'active',
      images: ['../../assets/images/products/sony-headphones.svg'],
      attributes: {
        brand: 'Sony',
        color: '黑色',
        type: '头戴式'
      },
      createdAt: '2024-01-25 11:20:00'
    },
    {
      id: 8,
      sku: 'SKU008',
      name: 'Nintendo Switch OLED',
      category: '游戏娱乐',
      price: 2599.00,
      stock: 28,
      status: 'active',
      images: ['../../assets/images/products/nintendo-switch.svg'],
      attributes: {
        brand: 'Nintendo',
        color: '白色',
        storage: '64GB'
      },
      createdAt: '2024-01-28 16:45:00'
    },
    {
      id: 9,
      sku: 'SKU009',
      name: 'Logitech MX Master 3S',
      category: '电脑办公',
      price: 699.00,
      stock: 3,
      status: 'active',
      images: ['../../assets/images/products/logitech-mouse.svg'],
      attributes: {
        brand: 'Logitech',
        color: '石墨色',
        type: '无线鼠标'
      },
      createdAt: '2024-01-30 13:10:00'
    },
    {
      id: 10,
      sku: 'SKU010',
      name: 'Apple Watch Series 9',
      category: '手机数码',
      price: 2999.00,
      stock: 0,
      status: 'inactive',
      images: ['../../assets/images/products/apple-watch.svg'],
      attributes: {
        brand: 'Apple',
        color: '午夜色',
        size: '45mm'
      },
      createdAt: '2024-02-01 10:25:00'
    },
    {
      id: 11,
      sku: 'SKU011',
      name: 'Microsoft Surface Pro 9',
      category: '电脑办公',
      price: 8999.00,
      stock: 18,
      status: 'active',
      images: ['../../assets/images/products/surface-pro.svg'],
      attributes: {
        brand: 'Microsoft',
        processor: 'Intel i5',
        memory: '8GB'
      },
      createdAt: '2024-02-03 15:40:00'
    },
    {
      id: 12,
      sku: 'SKU012',
      name: 'Canon EOS R6 Mark II',
      category: '摄影摄像',
      price: 16999.00,
      stock: 12,
      status: 'active',
      images: ['../../assets/images/products/canon-camera.svg'],
      attributes: {
        brand: 'Canon',
        type: '全画幅微单',
        resolution: '2420万像素'
      },
      createdAt: '2024-02-05 08:15:00'
    }
  ],

  // 订单数据
  orders: [
    {
      id: 1,
      orderNo: 'ORD202402050001',
      platformOrderId: 'WM123456789',
      platform: 'Walmart',
      status: 'paid',
      totalAmount: 9999.00,
      customerName: '张三',
      customerPhone: '13800138000',
      shippingAddress: {
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区深南大道10000号'
      },
      items: [
        {
          productId: 1,
          sku: 'SKU001',
          name: 'iPhone 15 Pro Max',
          quantity: 1,
          price: 9999.00
        }
      ],
      createdAt: '2024-02-05 10:30:00',
      paidAt: '2024-02-05 10:35:00'
    },
    {
      id: 2,
      orderNo: 'ORD202402050002',
      platformOrderId: 'WM123456790',
      platform: 'Walmart',
      status: 'shipped',
      totalAmount: 17898.00,
      customerName: '李四',
      customerPhone: '13800138001',
      shippingAddress: {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国门外大街1号'
      },
      items: [
        {
          productId: 2,
          sku: 'SKU002',
          name: 'MacBook Pro 14英寸',
          quantity: 1,
          price: 15999.00
        },
        {
          productId: 3,
          sku: 'SKU003',
          name: 'AirPods Pro 2',
          quantity: 1,
          price: 1899.00
        }
      ],
      createdAt: '2024-02-04 15:20:00',
      paidAt: '2024-02-04 15:25:00',
      shippedAt: '2024-02-05 09:30:00'
    },
    {
      id: 3,
      orderNo: 'ORD202402040001',
      platformOrderId: 'WM123456791',
      platform: 'Walmart',
      status: 'completed',
      totalAmount: 4399.00,
      customerName: '王五',
      customerPhone: '13800138002',
      shippingAddress: {
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '陆家嘴环路1000号'
      },
      items: [
        {
          productId: 4,
          sku: 'SKU004',
          name: 'iPad Air',
          quantity: 1,
          price: 4399.00
        }
      ],
      createdAt: '2024-02-03 11:15:00',
      paidAt: '2024-02-03 11:20:00',
      shippedAt: '2024-02-03 16:45:00',
      completedAt: '2024-02-04 14:30:00'
    },
    {
      id: 4,
      orderNo: 'ORD202402030001',
      platformOrderId: 'AM987654321',
      platform: 'Amazon',
      status: 'pending',
      totalAmount: 8999.00,
      customerName: '赵六',
      customerPhone: '13800138003',
      shippingAddress: {
        province: '江苏省',
        city: '南京市',
        district: '鼓楼区',
        detail: '中山路100号'
      },
      items: [
        {
          productId: 5,
          sku: 'SKU005',
          name: 'Samsung Galaxy S24 Ultra',
          quantity: 1,
          price: 8999.00
        }
      ],
      createdAt: '2024-02-03 09:45:00'
    },
    {
      id: 5,
      orderNo: 'ORD202402020001',
      platformOrderId: 'WM123456792',
      platform: 'Walmart',
      status: 'cancelled',
      totalAmount: 12999.00,
      customerName: '孙七',
      customerPhone: '13800138004',
      shippingAddress: {
        province: '浙江省',
        city: '杭州市',
        district: '西湖区',
        detail: '文三路100号'
      },
      items: [
        {
          productId: 6,
          sku: 'SKU006',
          name: 'Dell XPS 13',
          quantity: 1,
          price: 12999.00
        }
      ],
      createdAt: '2024-02-02 14:20:00',
      cancelledAt: '2024-02-02 16:30:00'
    },
    {
      id: 6,
      orderNo: 'ORD202402010001',
      platformOrderId: 'EB555666777',
      platform: 'eBay',
      status: 'shipped',
      totalAmount: 2399.00,
      customerName: '周八',
      customerPhone: '13800138005',
      shippingAddress: {
        province: '四川省',
        city: '成都市',
        district: '锦江区',
        detail: '春熙路88号'
      },
      items: [
        {
          productId: 7,
          sku: 'SKU007',
          name: 'Sony WH-1000XM5',
          quantity: 1,
          price: 2399.00
        }
      ],
      createdAt: '2024-02-01 16:30:00',
      paidAt: '2024-02-01 16:35:00',
      shippedAt: '2024-02-02 10:15:00'
    },
    {
      id: 7,
      orderNo: 'ORD202401310001',
      platformOrderId: 'WM123456793',
      platform: 'Walmart',
      status: 'completed',
      totalAmount: 2599.00,
      customerName: '吴九',
      customerPhone: '13800138006',
      shippingAddress: {
        province: '湖北省',
        city: '武汉市',
        district: '武昌区',
        detail: '中南路200号'
      },
      items: [
        {
          productId: 8,
          sku: 'SKU008',
          name: 'Nintendo Switch OLED',
          quantity: 1,
          price: 2599.00
        }
      ],
      createdAt: '2024-01-31 13:45:00',
      paidAt: '2024-01-31 13:50:00',
      shippedAt: '2024-02-01 09:20:00',
      completedAt: '2024-02-03 15:30:00'
    },
    {
      id: 8,
      orderNo: 'ORD202401300001',
      platformOrderId: 'AM987654322',
      platform: 'Amazon',
      status: 'paid',
      totalAmount: 699.00,
      customerName: '郑十',
      customerPhone: '13800138007',
      shippingAddress: {
        province: '广西省',
        city: '南宁市',
        district: '青秀区',
        detail: '民族大道100号'
      },
      items: [
        {
          productId: 9,
          sku: 'SKU009',
          name: 'Logitech MX Master 3S',
          quantity: 1,
          price: 699.00
        }
      ],
      createdAt: '2024-01-30 11:20:00',
      paidAt: '2024-01-30 11:25:00'
    },
    {
      id: 9,
      orderNo: 'ORD202401290001',
      platformOrderId: 'WM123456794',
      platform: 'Walmart',
      status: 'shipped',
      totalAmount: 8999.00,
      customerName: '冯十一',
      customerPhone: '13800138008',
      shippingAddress: {
        province: '山东省',
        city: '青岛市',
        district: '市南区',
        detail: '香港中路50号'
      },
      items: [
        {
          productId: 11,
          sku: 'SKU011',
          name: 'Microsoft Surface Pro 9',
          quantity: 1,
          price: 8999.00
        }
      ],
      createdAt: '2024-01-29 15:10:00',
      paidAt: '2024-01-29 15:15:00',
      shippedAt: '2024-01-30 08:30:00'
    },
    {
      id: 10,
      orderNo: 'ORD202401280001',
      platformOrderId: 'EB555666778',
      platform: 'eBay',
      status: 'completed',
      totalAmount: 16999.00,
      customerName: '陈十二',
      customerPhone: '13800138009',
      shippingAddress: {
        province: '福建省',
        city: '厦门市',
        district: '思明区',
        detail: '中山路300号'
      },
      items: [
        {
          productId: 12,
          sku: 'SKU012',
          name: 'Canon EOS R6 Mark II',
          quantity: 1,
          price: 16999.00
        }
      ],
      createdAt: '2024-01-28 10:30:00',
      paidAt: '2024-01-28 10:35:00',
      shippedAt: '2024-01-28 16:20:00',
      completedAt: '2024-01-30 14:45:00'
    }
  ],

  // 库存数据
  inventory: [
    {
      id: 1,
      sku: 'SKU001',
      productName: 'iPhone 15 Pro Max',
      totalStock: 50,
      availableStock: 45,
      reservedStock: 5,
      alertThreshold: 10,
      status: 'normal',
      lastUpdated: '2024-02-05 14:20:00'
    },
    {
      id: 2,
      sku: 'SKU002',
      productName: 'MacBook Pro 14英寸',
      totalStock: 25,
      availableStock: 20,
      reservedStock: 5,
      alertThreshold: 5,
      status: 'low',
      lastUpdated: '2024-02-05 13:15:00'
    },
    {
      id: 3,
      sku: 'SKU003',
      productName: 'AirPods Pro 2',
      totalStock: 8,
      availableStock: 3,
      reservedStock: 5,
      alertThreshold: 10,
      status: 'critical',
      lastUpdated: '2024-02-05 12:30:00'
    },
    {
      id: 4,
      sku: 'SKU004',
      productName: 'iPad Air',
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      alertThreshold: 5,
      status: 'out_of_stock',
      lastUpdated: '2024-02-04 18:45:00'
    }
  ],

  // 平台数据
  platforms: [
    {
      id: 1,
      name: 'Walmart Marketplace',
      type: 'walmart',
      status: 'connected',
      lastSyncTime: '2024-02-05 14:00:00',
      stores: [
        {
          id: 1,
          name: '主店铺',
          storeId: 'WM_STORE_001',
          status: 'active'
        }
      ]
    },
    {
      id: 2,
      name: 'Amazon',
      type: 'amazon',
      status: 'disconnected',
      lastSyncTime: '2024-02-04 18:30:00',
      stores: []
    },
    {
      id: 3,
      name: 'eBay',
      type: 'ebay',
      status: 'syncing',
      lastSyncTime: '2024-02-05 13:45:00',
      stores: [
        {
          id: 2,
          name: 'eBay Store',
          storeId: 'EBAY_001',
          status: 'active'
        }
      ]
    }
  ],

  // 物流数据
  logistics: [
    {
      id: 1,
      orderId: 1,
      orderNo: 'ORD202402050001',
      trackingNumber: 'YE123456789CN',
      carrier: 'YunExpress',
      status: 'shipped',
      shippingAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      createdAt: '2024-02-05 15:30:00',
      shippedAt: '2024-02-05 16:00:00'
    },
    {
      id: 2,
      orderId: 2,
      orderNo: 'ORD202402050002',
      trackingNumber: 'YE123456790CN',
      carrier: 'YunExpress',
      status: 'in_transit',
      shippingAddress: '北京市朝阳区建国门外大街1号',
      createdAt: '2024-02-04 16:45:00',
      shippedAt: '2024-02-05 09:30:00'
    },
    {
      id: 3,
      orderId: 3,
      orderNo: 'ORD202402040001',
      trackingNumber: 'YE123456791CN',
      carrier: 'YunExpress',
      status: 'delivered',
      shippingAddress: '上海市浦东新区陆家嘴环路1000号',
      createdAt: '2024-02-03 16:45:00',
      shippedAt: '2024-02-03 17:00:00',
      deliveredAt: '2024-02-04 14:30:00'
    }
  ],

  // 通知数据
  notifications: [
    {
      id: 1,
      title: '库存预警',
      content: 'SKU003 (AirPods Pro 2) 库存不足，当前库存：3件',
      type: 'warning',
      isRead: false,
      createdAt: '2024-02-05 14:30:00'
    },
    {
      id: 2,
      title: '新订单提醒',
      content: '收到新订单 ORD202402050001，金额：¥9,999.00',
      type: 'info',
      isRead: false,
      createdAt: '2024-02-05 10:30:00'
    },
    {
      id: 3,
      title: '商品缺货',
      content: 'SKU004 (iPad Air) 已缺货，请及时补充库存',
      type: 'error',
      isRead: true,
      createdAt: '2024-02-04 18:45:00'
    },
    {
      id: 4,
      title: '系统更新',
      content: '系统将于今晚22:00进行维护更新，预计耗时30分钟',
      type: 'system',
      isRead: true,
      createdAt: '2024-02-04 16:00:00'
    },
    {
      id: 5,
      title: '订单发货',
      content: '订单 ORD202402050002 已发货，运单号：YE123456790CN',
      type: 'success',
      isRead: true,
      createdAt: '2024-02-05 09:30:00'
    }
  ],

  // 仪表板统计数据
  dashboard: {
    stats: {
      todayOrders: 1234,
      todayOrdersChange: 12.5,
      todaySales: 156789.50,
      todaySalesChange: -3.2,
      totalProducts: 5678,
      totalProductsChange: 8.7,
      lowStockAlerts: 23,
      lowStockAlertsChange: 15.3
    },
    charts: {
      salesTrend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [120000, 135000, 148000, 162000, 175000, 189000]
      },
      orderStatus: {
        labels: ['待支付', '已支付', '已发货', '已完成', '已取消'],
        data: [45, 123, 89, 567, 23]
      },
      topProducts: [
        { name: 'iPhone 15 Pro Max', sales: 234, revenue: 2339766 },
        { name: 'MacBook Pro 14英寸', sales: 89, revenue: 1423911 },
        { name: 'AirPods Pro 2', sales: 156, revenue: 296244 },
        { name: 'iPad Air', sales: 67, revenue: 294733 },
        { name: 'Apple Watch', sales: 123, revenue: 369000 }
      ]
    }
  }
};

// 模拟API工具函数
const mockApi = {
  // 模拟API延迟
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 生成统一的API响应格式
  createResponse: (success, data = null, message = '', code = 200) => ({
    success,
    data,
    message,
    code,
    timestamp: new Date().toISOString()
  }),
  
  // 模拟网络错误
  simulateNetworkError: (errorRate = 0.05) => {
    if (Math.random() < errorRate) {
      throw new Error('网络连接异常，请稍后重试');
    }
  },
  
  // 验证分页参数
  validatePagination: (page, size) => {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validSize = Math.min(100, Math.max(1, parseInt(size) || 10));
    return { page: validPage, size: validSize };
  },
  
  // 通用分页处理
  paginate: (data, page, size) => {
    const { page: validPage, size: validSize } = mockApi.validatePagination(page, size);
    const start = (validPage - 1) * validSize;
    const end = start + validSize;
    
    return {
      records: data.slice(start, end),
      total: data.length,
      current: validPage,
      size: validSize,
      pages: Math.ceil(data.length / validSize)
    };
  },
  
  // 通用搜索过滤
  filterByKeyword: (data, keyword, fields) => {
    if (!keyword) return data;
    
    const lowerKeyword = keyword.toLowerCase();
    return data.filter(item => 
      fields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value && value.toString().toLowerCase().includes(lowerKeyword);
      })
    );
  },
  
  // 通用状态过滤
  filterByStatus: (data, status) => {
    if (!status) return data;
    return data.filter(item => item.status === status);
  },
  
  // 通用排序
  sortData: (data, sortField, sortOrder = 'asc') => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = sortField.split('.').reduce((obj, key) => obj?.[key], a);
      const bValue = sortField.split('.').reduce((obj, key) => obj?.[key], b);
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  // 模拟登录
  login: async (username, password) => {
    await mockApi.delay();
    // 登录时不模拟网络错误，确保演示稳定性
    // mockApi.simulateNetworkError();
    
    try {
      // 验证用户名和密码
      const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'operator', password: 'operator123' },
        { username: 'warehouse', password: 'warehouse123' },
        { username: 'demo', password: 'demo123' }
      ];
      
      const credential = validCredentials.find(c => c.username === username && c.password === password);
      
      if (credential) {
        const user = mockData.users.find(u => u.username === username);
        if (!user) {
          return mockApi.createResponse(false, null, '用户不存在', 404);
        }
        
        if (user.status !== 'active') {
          return mockApi.createResponse(false, null, '用户账户已被禁用', 403);
        }
        
        // 更新最后登录时间
        user.lastLogin = DataGenerator.generateDate(0);
        
        const loginData = {
          token: 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          refreshToken: 'refresh_token_' + Date.now(),
          user: user,
          expiresIn: 7200, // 2小时
          permissions: user.roles.flatMap(role => {
            const roleData = mockData.roles.find(r => r.name === role);
            return roleData ? roleData.permissions : [];
          })
        };
        
        return mockApi.createResponse(true, loginData, '登录成功');
      } else {
        return mockApi.createResponse(false, null, '用户名或密码错误', 401);
      }
    } catch (error) {
      return mockApi.createResponse(false, null, '登录失败：' + error.message, 500);
    }
  },
  
  // 刷新令牌
  refreshToken: async (refreshToken) => {
    await mockApi.delay(200);
    mockApi.simulateNetworkError();
    
    try {
      if (!refreshToken || !refreshToken.startsWith('refresh_token_')) {
        return mockApi.createResponse(false, null, '无效的刷新令牌', 401);
      }
      
      const newTokenData = {
        token: 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        refreshToken: 'refresh_token_' + Date.now(),
        expiresIn: 7200
      };
      
      return mockApi.createResponse(true, newTokenData, '令牌刷新成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '令牌刷新失败：' + error.message, 500);
    }
  },
  
  // 登出
  logout: async (token) => {
    await mockApi.delay(200);
    
    try {
      // 模拟令牌失效处理
      return mockApi.createResponse(true, null, '登出成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '登出失败：' + error.message, 500);
    }
  },
  
  // 验证令牌
  validateToken: async (token) => {
    await mockApi.delay(100);
    
    try {
      if (!token || !token.startsWith('mock_token_')) {
        return mockApi.createResponse(false, null, '无效的访问令牌', 401);
      }
      
      // 模拟令牌过期检查
      const tokenTimestamp = parseInt(token.split('_')[2]);
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (now - tokenTimestamp > twoHours) {
        return mockApi.createResponse(false, null, '访问令牌已过期', 401);
      }
      
      return mockApi.createResponse(true, { valid: true }, '令牌验证成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '令牌验证失败：' + error.message, 500);
    }
  },
  
  // 获取用户列表
  getUsers: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let users = [...mockData.users];
      
      // 搜索过滤
      users = mockApi.filterByKeyword(users, params.keyword, ['username', 'email', 'phone']);
      
      // 状态过滤
      users = mockApi.filterByStatus(users, params.status);
      
      // 角色过滤
      if (params.role) {
        users = users.filter(user => user.roles.includes(params.role));
      }
      
      // 排序
      users = mockApi.sortData(users, params.sortField, params.sortOrder);
      
      // 分页
      const paginatedData = mockApi.paginate(users, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取用户列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取用户列表失败：' + error.message, 500);
    }
  },
  
  // 获取商品列表
  getProducts: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let products = [...mockData.products];
      
      // 搜索过滤
      products = mockApi.filterByKeyword(products, params.keyword, ['name', 'sku', 'category']);
      
      // 状态过滤
      products = mockApi.filterByStatus(products, params.status);
      
      // 分类过滤
      if (params.category) {
        products = products.filter(product => product.category === params.category);
      }
      
      // 价格范围过滤
      if (params.minPrice) {
        products = products.filter(product => product.price >= parseFloat(params.minPrice));
      }
      if (params.maxPrice) {
        products = products.filter(product => product.price <= parseFloat(params.maxPrice));
      }
      
      // 库存过滤
      if (params.stockStatus) {
        switch (params.stockStatus) {
          case 'in_stock':
            products = products.filter(product => product.stock > 0);
            break;
          case 'low_stock':
            products = products.filter(product => product.stock > 0 && product.stock <= 10);
            break;
          case 'out_of_stock':
            products = products.filter(product => product.stock === 0);
            break;
        }
      }
      
      // 排序
      products = mockApi.sortData(products, params.sortField, params.sortOrder);
      
      // 分页
      const paginatedData = mockApi.paginate(products, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取商品列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取商品列表失败：' + error.message, 500);
    }
  },
  
  // 获取订单列表
  getOrders: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let orders = [...mockData.orders];
      
      // 搜索过滤
      orders = mockApi.filterByKeyword(orders, params.keyword, ['orderNo', 'customerName', 'customerPhone', 'platformOrderId']);
      
      // 状态过滤
      orders = mockApi.filterByStatus(orders, params.status);
      
      // 平台过滤
      if (params.platform) {
        orders = orders.filter(order => order.platform === params.platform);
      }
      
      // 日期范围过滤
      if (params.startDate) {
        orders = orders.filter(order => order.createdAt >= params.startDate);
      }
      if (params.endDate) {
        orders = orders.filter(order => order.createdAt <= params.endDate);
      }
      
      // 金额范围过滤
      if (params.minAmount) {
        orders = orders.filter(order => order.totalAmount >= parseFloat(params.minAmount));
      }
      if (params.maxAmount) {
        orders = orders.filter(order => order.totalAmount <= parseFloat(params.maxAmount));
      }
      
      // 排序（默认按创建时间倒序）
      orders = mockApi.sortData(orders, params.sortField || 'createdAt', params.sortOrder || 'desc');
      
      // 分页
      const paginatedData = mockApi.paginate(orders, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取订单列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取订单列表失败：' + error.message, 500);
    }
  },
  
  // 获取库存列表
  getInventory: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let inventory = [...mockData.inventory];
      
      // 搜索过滤
      inventory = mockApi.filterByKeyword(inventory, params.keyword, ['sku', 'productName']);
      
      // 状态过滤
      inventory = mockApi.filterByStatus(inventory, params.status);
      
      // 库存范围过滤
      if (params.minStock !== undefined) {
        inventory = inventory.filter(item => item.availableStock >= parseInt(params.minStock));
      }
      if (params.maxStock !== undefined) {
        inventory = inventory.filter(item => item.availableStock <= parseInt(params.maxStock));
      }
      
      // 预警过滤
      if (params.alertOnly === 'true') {
        inventory = inventory.filter(item => item.availableStock <= item.alertThreshold);
      }
      
      // 排序
      inventory = mockApi.sortData(inventory, params.sortField, params.sortOrder);
      
      // 分页
      const paginatedData = mockApi.paginate(inventory, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取库存列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取库存列表失败：' + error.message, 500);
    }
  },
  
  // 获取平台列表
  getPlatforms: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let platforms = [...mockPlatforms]; // 使用正确的数据源
      
      // 搜索过滤
      platforms = mockApi.filterByKeyword(platforms, params.keyword, ['name', 'type']);
      
      // 状态过滤
      platforms = mockApi.filterByStatus(platforms, params.status);
      
      // 类型过滤
      if (params.type) {
        platforms = platforms.filter(platform => platform.type === params.type);
      }
      
      // 排序
      platforms = mockApi.sortData(platforms, params.sortField, params.sortOrder);
      
      // 分页
      const paginatedData = mockApi.paginate(platforms, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取平台列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取平台列表失败：' + error.message, 500);
    }
  },
  
  // 获取物流列表
  getLogistics: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let logistics = [...mockData.logistics];
      
      // 搜索过滤
      logistics = mockApi.filterByKeyword(logistics, params.keyword, ['orderNo', 'trackingNumber', 'carrier']);
      
      // 状态过滤
      logistics = mockApi.filterByStatus(logistics, params.status);
      
      // 承运商过滤
      if (params.carrier) {
        logistics = logistics.filter(item => item.carrier === params.carrier);
      }
      
      // 订单过滤
      if (params.orderId) {
        logistics = logistics.filter(item => item.orderId === parseInt(params.orderId));
      }
      
      // 排序
      logistics = mockApi.sortData(logistics, params.sortField || 'createdAt', params.sortOrder || 'desc');
      
      // 分页
      const paginatedData = mockApi.paginate(logistics, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取物流列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取物流列表失败：' + error.message, 500);
    }
  },
  
  // 获取通知列表
  getNotifications: async (params = {}) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      let notifications = [...mockData.notifications];
      
      // 搜索过滤
      notifications = mockApi.filterByKeyword(notifications, params.keyword, ['title', 'content']);
      
      // 类型过滤
      if (params.type) {
        notifications = notifications.filter(item => item.type === params.type);
      }
      
      // 已读状态过滤
      if (params.isRead !== undefined) {
        notifications = notifications.filter(item => item.isRead === (params.isRead === 'true'));
      }
      
      // 日期范围过滤
      if (params.startDate) {
        notifications = notifications.filter(item => item.createdAt >= params.startDate);
      }
      if (params.endDate) {
        notifications = notifications.filter(item => item.createdAt <= params.endDate);
      }
      
      // 排序（默认按创建时间倒序）
      notifications = mockApi.sortData(notifications, params.sortField || 'createdAt', params.sortOrder || 'desc');
      
      // 分页
      const paginatedData = mockApi.paginate(notifications, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取通知列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取通知列表失败：' + error.message, 500);
    }
  },
  
  // 获取仪表板数据
  getDashboardData: async () => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      // 实时计算统计数据
      const stats = {
        todayOrders: mockData.orders.filter(o => {
          const today = new Date().toISOString().slice(0, 10);
          return o.createdAt.startsWith(today);
        }).length,
        todayOrdersChange: Math.random() * 20 - 10, // 模拟变化率
        todaySales: mockData.orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, order) => sum + order.totalAmount, 0),
        todaySalesChange: Math.random() * 15 - 7.5,
        totalProducts: mockData.products.filter(p => p.status === 'active').length,
        totalProductsChange: Math.random() * 10 - 5,
        lowStockAlerts: mockData.inventory.filter(i => i.status === 'low' || i.status === 'critical').length,
        lowStockAlertsChange: Math.random() * 25 - 12.5
      };
      
      const dashboardData = {
        ...mockData.dashboard,
        stats
      };
      
      return mockApi.createResponse(true, dashboardData, '获取仪表板数据成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取仪表板数据失败：' + error.message, 500);
    }
  },
  
  // 获取角色列表
  getRoles: async (params = {}) => {
    await mockApi.delay(300);
    mockApi.simulateNetworkError();
    
    try {
      let roles = [...mockData.roles];
      
      // 搜索过滤
      roles = mockApi.filterByKeyword(roles, params.keyword, ['name', 'code', 'description']);
      
      // 状态过滤
      roles = mockApi.filterByStatus(roles, params.status);
      
      // 排序
      roles = mockApi.sortData(roles, params.sortField, params.sortOrder);
      
      // 分页
      const paginatedData = mockApi.paginate(roles, params.page, params.size);
      
      return mockApi.createResponse(true, paginatedData, '获取角色列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取角色列表失败：' + error.message, 500);
    }
  },
  
  // 获取分类列表
  getCategories: async (params = {}) => {
    await mockApi.delay(300);
    mockApi.simulateNetworkError();
    
    try {
      let categories = [...mockData.categories];
      
      // 搜索过滤
      categories = mockApi.filterByKeyword(categories, params.keyword, ['name', 'code']);
      
      // 状态过滤
      categories = mockApi.filterByStatus(categories, params.status);
      
      // 层级过滤
      if (params.level) {
        categories = categories.filter(cat => cat.level === parseInt(params.level));
      }
      
      // 父级过滤
      if (params.parentId !== undefined) {
        categories = categories.filter(cat => cat.parentId === (params.parentId ? parseInt(params.parentId) : null));
      }
      
      // 排序
      categories = mockApi.sortData(categories, params.sortField || 'sort', params.sortOrder || 'asc');
      
      return mockApi.createResponse(true, categories, '获取分类列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取分类列表失败：' + error.message, 500);
    }
  },
  
  // 获取品牌列表
  getBrands: async (params = {}) => {
    await mockApi.delay(200);
    mockApi.simulateNetworkError();
    
    try {
      let brands = [...mockData.brands];
      
      // 搜索过滤
      brands = mockApi.filterByKeyword(brands, params.keyword, ['name']);
      
      // 状态过滤
      brands = mockApi.filterByStatus(brands, params.status);
      
      // 排序
      brands = mockApi.sortData(brands, params.sortField || 'name', params.sortOrder || 'asc');
      
      return mockApi.createResponse(true, brands, '获取品牌列表成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '获取品牌列表失败：' + error.message, 500);
    }
  },
  
  // 获取快捷操作数据
  getQuickActionsData: async () => {
    await mockApi.delay(300);
    
    return {
      success: true,
      data: {
        pendingOrders: Math.floor(Math.random() * 20) + 5,
        pendingProducts: Math.floor(Math.random() * 10) + 1,
        lowStockAlerts: Math.floor(Math.random() * 15) + 2,
        inTransitShipments: Math.floor(Math.random() * 25) + 5,
        pendingUsers: Math.floor(Math.random() * 5) + 1
      }
    };
  },
  
  // 获取待处理事项
  getPendingTasks: async () => {
    await mockApi.delay(400);
    
    const tasks = [
      {
        id: 'task-1',
        title: '处理退款申请',
        description: '订单 #ORD-2024-001 的退款申请需要审核',
        priority: 'high',
        time: '2小时前'
      },
      {
        id: 'task-2',
        title: '库存补货提醒',
        description: 'iPhone 15 Pro 库存不足，需要及时补货',
        priority: 'medium',
        time: '4小时前'
      },
      {
        id: 'task-3',
        title: '商品审核',
        description: '3个新商品等待审核上架',
        priority: 'low',
        time: '6小时前'
      },
      {
        id: 'task-4',
        title: '用户账户激活',
        description: '2个新用户账户等待激活',
        priority: 'low',
        time: '1天前'
      },
      {
        id: 'task-5',
        title: '平台同步异常',
        description: 'Walmart平台商品同步出现异常，需要处理',
        priority: 'high',
        time: '30分钟前'
      }
    ];
    
    return {
      success: true,
      data: tasks
    };
  },
  
  // 获取最近操作
  getRecentActivities: async () => {
    await mockApi.delay(350);
    
    const activities = [
      {
        id: 'activity-1',
        type: 'create',
        title: '创建订单',
        description: '创建了订单 #ORD-2024-015',
        time: '5分钟前'
      },
      {
        id: 'activity-2',
        type: 'update',
        title: '更新商品信息',
        description: '更新了商品"MacBook Pro 16寸"的价格',
        time: '15分钟前'
      },
      {
        id: 'activity-3',
        type: 'view',
        title: '查看库存报告',
        description: '查看了本月库存统计报告',
        time: '1小时前'
      },
      {
        id: 'activity-4',
        type: 'delete',
        title: '删除过期商品',
        description: '删除了3个过期的促销商品',
        time: '2小时前'
      },
      {
        id: 'activity-5',
        type: 'create',
        title: '添加新用户',
        description: '添加了新用户"张三"',
        time: '3小时前'
      },
      {
        id: 'activity-6',
        type: 'update',
        title: '更新订单状态',
        description: '将订单 #ORD-2024-012 状态更新为已发货',
        time: '4小时前'
      }
    ];
    
    return {
      success: true,
      data: activities
    };
  },
  
  // 获取系统通知
  getSystemNotifications: async () => {
    await mockApi.delay(300);
    
    const notifications = [
      {
        id: 'notif-1',
        type: 'warning',
        title: '库存预警',
        message: 'iPhone 15 Pro 256GB 库存不足，当前库存：5件',
        time: '10分钟前',
        read: false
      },
      {
        id: 'notif-2',
        type: 'info',
        title: '系统更新',
        message: '系统将于今晚23:00-01:00进行维护更新',
        time: '1小时前',
        read: false
      },
      {
        id: 'notif-3',
        type: 'success',
        title: '数据同步完成',
        message: 'Walmart平台商品数据同步已完成',
        time: '2小时前',
        read: true
      },
      {
        id: 'notif-4',
        type: 'error',
        title: '支付异常',
        message: '订单 #ORD-2024-013 支付处理失败',
        time: '3小时前',
        read: false
      },
      {
        id: 'notif-5',
        type: 'info',
        title: '新订单提醒',
        message: '收到5个新订单，请及时处理',
        time: '5小时前',
        read: true
      }
    ];
    
    return {
      success: true,
      data: notifications
    };
  },
  
  // 完成任务
  completeTask: async (taskId) => {
    await mockApi.delay(200);
    
    return {
      success: true,
      message: '任务已完成'
    };
  },
  
  // 标记通知为已读
  markNotificationAsRead: async (notificationId) => {
    await mockApi.delay(200);
    
    return {
      success: true,
      message: '通知已标记为已读'
    };
  },
  
  // 删除通知
  deleteNotification: async (notificationId) => {
    await mockApi.delay(200);
    
    return {
      success: true,
      message: '通知已删除'
    };
  },
  
  // 全部标记为已读
  markAllNotificationsAsRead: async () => {
    await mockApi.delay(300);
    
    return {
      success: true,
      message: '所有通知已标记为已读'
    };
  },

  // ==================== CRUD 操作 ====================
  
  // 用户管理 CRUD
  createUser: async (userData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const newUser = {
        id: DataGenerator.generateId(),
        username: userData.username,
        email: userData.email,
        phone: userData.phone || DataGenerator.generatePhone(),
        status: userData.status || 'active',
        roles: userData.roles || ['普通用户'],
        avatar: userData.avatar || 'assets/images/avatars/admin.svg',
        createdAt: DataGenerator.generateDate(0),
        lastLogin: null
      };
      
      mockData.users.push(newUser);
      
      return mockApi.createResponse(true, newUser, '用户创建成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '用户创建失败：' + error.message, 500);
    }
  },
  
  updateUser: async (userId, userData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const userIndex = mockData.users.findIndex(u => u.id === parseInt(userId));
      if (userIndex === -1) {
        return mockApi.createResponse(false, null, '用户不存在', 404);
      }
      
      const updatedUser = {
        ...mockData.users[userIndex],
        ...userData,
        updatedAt: DataGenerator.generateDate(0)
      };
      
      mockData.users[userIndex] = updatedUser;
      
      return mockApi.createResponse(true, updatedUser, '用户更新成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '用户更新失败：' + error.message, 500);
    }
  },
  
  deleteUser: async (userId) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const userIndex = mockData.users.findIndex(u => u.id === parseInt(userId));
      if (userIndex === -1) {
        return mockApi.createResponse(false, null, '用户不存在', 404);
      }
      
      const deletedUser = mockData.users.splice(userIndex, 1)[0];
      
      return mockApi.createResponse(true, deletedUser, '用户删除成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '用户删除失败：' + error.message, 500);
    }
  },
  
  getUserById: async (userId) => {
    await mockApi.delay(200);
    
    const user = mockData.users.find(u => u.id === parseInt(userId));
    if (!user) {
      return mockApi.createResponse(false, null, '用户不存在', 404);
    }
    
    return mockApi.createResponse(true, user, '获取用户信息成功');
  },
  
  // 商品管理 CRUD
  createProduct: async (productData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const newProduct = {
        id: DataGenerator.generateId(),
        sku: productData.sku || `SKU${Date.now()}`,
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price) || DataGenerator.generatePrice(),
        stock: parseInt(productData.stock) || DataGenerator.generateStock(),
        status: productData.status || 'active',
        images: productData.images || ['assets/images/products/placeholder.svg'],
        attributes: productData.attributes || {},
        createdAt: DataGenerator.generateDate(0)
      };
      
      mockData.products.push(newProduct);
      
      // 同步创建库存记录
      const inventoryItem = {
        id: DataGenerator.generateId(),
        sku: newProduct.sku,
        productName: newProduct.name,
        totalStock: newProduct.stock,
        availableStock: newProduct.stock,
        reservedStock: 0,
        alertThreshold: Math.max(5, Math.floor(newProduct.stock * 0.1)),
        status: newProduct.stock > 10 ? 'normal' : newProduct.stock > 0 ? 'low' : 'out_of_stock',
        lastUpdated: DataGenerator.generateDate(0)
      };
      
      mockData.inventory.push(inventoryItem);
      
      return mockApi.createResponse(true, newProduct, '商品创建成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '商品创建失败：' + error.message, 500);
    }
  },
  
  updateProduct: async (productId, productData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const productIndex = mockData.products.findIndex(p => p.id === parseInt(productId));
      if (productIndex === -1) {
        return mockApi.createResponse(false, null, '商品不存在', 404);
      }
      
      const updatedProduct = {
        ...mockData.products[productIndex],
        ...productData,
        updatedAt: DataGenerator.generateDate(0)
      };
      
      mockData.products[productIndex] = updatedProduct;
      
      // 同步更新库存记录
      const inventoryIndex = mockData.inventory.findIndex(i => i.sku === updatedProduct.sku);
      if (inventoryIndex !== -1) {
        mockData.inventory[inventoryIndex] = {
          ...mockData.inventory[inventoryIndex],
          productName: updatedProduct.name,
          totalStock: updatedProduct.stock,
          availableStock: updatedProduct.stock,
          lastUpdated: DataGenerator.generateDate(0)
        };
      }
      
      return mockApi.createResponse(true, updatedProduct, '商品更新成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '商品更新失败：' + error.message, 500);
    }
  },
  
  deleteProduct: async (productId) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const productIndex = mockData.products.findIndex(p => p.id === parseInt(productId));
      if (productIndex === -1) {
        return mockApi.createResponse(false, null, '商品不存在', 404);
      }
      
      const deletedProduct = mockData.products.splice(productIndex, 1)[0];
      
      // 同步删除库存记录
      const inventoryIndex = mockData.inventory.findIndex(i => i.sku === deletedProduct.sku);
      if (inventoryIndex !== -1) {
        mockData.inventory.splice(inventoryIndex, 1);
      }
      
      return mockApi.createResponse(true, deletedProduct, '商品删除成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '商品删除失败：' + error.message, 500);
    }
  },
  
  getProductById: async (productId) => {
    await mockApi.delay(200);
    
    const product = mockData.products.find(p => p.id === parseInt(productId));
    if (!product) {
      return mockApi.createResponse(false, null, '商品不存在', 404);
    }
    
    return mockApi.createResponse(true, product, '获取商品信息成功');
  },
  
  // 订单管理 CRUD
  createOrder: async (orderData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const newOrder = {
        id: DataGenerator.generateId(),
        orderNo: `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockData.orders.length + 1).padStart(4, '0')}`,
        platformOrderId: orderData.platformOrderId || `PF${Date.now()}`,
        platform: orderData.platform || 'Manual',
        status: orderData.status || 'pending',
        totalAmount: parseFloat(orderData.totalAmount) || 0,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone || DataGenerator.generatePhone(),
        shippingAddress: orderData.shippingAddress || DataGenerator.generateAddress(),
        items: orderData.items || [],
        createdAt: DataGenerator.generateDate(0)
      };
      
      mockData.orders.push(newOrder);
      
      return mockApi.createResponse(true, newOrder, '订单创建成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '订单创建失败：' + error.message, 500);
    }
  },
  
  updateOrder: async (orderId, orderData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const orderIndex = mockData.orders.findIndex(o => o.id === parseInt(orderId));
      if (orderIndex === -1) {
        return mockApi.createResponse(false, null, '订单不存在', 404);
      }
      
      const updatedOrder = {
        ...mockData.orders[orderIndex],
        ...orderData,
        updatedAt: DataGenerator.generateDate(0)
      };
      
      // 处理状态变更的时间戳
      if (orderData.status && orderData.status !== mockData.orders[orderIndex].status) {
        switch (orderData.status) {
          case 'paid':
            updatedOrder.paidAt = DataGenerator.generateDate(0);
            break;
          case 'shipped':
            updatedOrder.shippedAt = DataGenerator.generateDate(0);
            break;
          case 'completed':
            updatedOrder.completedAt = DataGenerator.generateDate(0);
            break;
          case 'cancelled':
            updatedOrder.cancelledAt = DataGenerator.generateDate(0);
            break;
        }
      }
      
      mockData.orders[orderIndex] = updatedOrder;
      
      return mockApi.createResponse(true, updatedOrder, '订单更新成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '订单更新失败：' + error.message, 500);
    }
  },
  
  deleteOrder: async (orderId) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const orderIndex = mockData.orders.findIndex(o => o.id === parseInt(orderId));
      if (orderIndex === -1) {
        return mockApi.createResponse(false, null, '订单不存在', 404);
      }
      
      const deletedOrder = mockData.orders.splice(orderIndex, 1)[0];
      
      return mockApi.createResponse(true, deletedOrder, '订单删除成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '订单删除失败：' + error.message, 500);
    }
  },
  
  getOrderById: async (orderId) => {
    await mockApi.delay(200);
    
    const order = mockData.orders.find(o => o.id === parseInt(orderId));
    if (!order) {
      return mockApi.createResponse(false, null, '订单不存在', 404);
    }
    
    return mockApi.createResponse(true, order, '获取订单信息成功');
  },
  
  // 库存管理 CRUD
  updateInventory: async (inventoryId, inventoryData) => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const inventoryIndex = mockData.inventory.findIndex(i => i.id === parseInt(inventoryId));
      if (inventoryIndex === -1) {
        return mockApi.createResponse(false, null, '库存记录不存在', 404);
      }
      
      const updatedInventory = {
        ...mockData.inventory[inventoryIndex],
        ...inventoryData,
        lastUpdated: DataGenerator.generateDate(0)
      };
      
      // 重新计算库存状态
      if (updatedInventory.availableStock <= 0) {
        updatedInventory.status = 'out_of_stock';
      } else if (updatedInventory.availableStock <= updatedInventory.alertThreshold) {
        updatedInventory.status = 'critical';
      } else if (updatedInventory.availableStock <= updatedInventory.alertThreshold * 2) {
        updatedInventory.status = 'low';
      } else {
        updatedInventory.status = 'normal';
      }
      
      mockData.inventory[inventoryIndex] = updatedInventory;
      
      return mockApi.createResponse(true, updatedInventory, '库存更新成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '库存更新失败：' + error.message, 500);
    }
  },
  
  adjustInventory: async (sku, adjustment, reason = '手动调整') => {
    await mockApi.delay();
    mockApi.simulateNetworkError();
    
    try {
      const inventoryIndex = mockData.inventory.findIndex(i => i.sku === sku);
      if (inventoryIndex === -1) {
        return mockApi.createResponse(false, null, '库存记录不存在', 404);
      }
      
      const inventory = mockData.inventory[inventoryIndex];
      const newStock = Math.max(0, inventory.availableStock + adjustment);
      
      inventory.availableStock = newStock;
      inventory.totalStock = newStock + inventory.reservedStock;
      inventory.lastUpdated = DataGenerator.generateDate(0);
      
      // 重新计算库存状态
      if (newStock <= 0) {
        inventory.status = 'out_of_stock';
      } else if (newStock <= inventory.alertThreshold) {
        inventory.status = 'critical';
      } else if (newStock <= inventory.alertThreshold * 2) {
        inventory.status = 'low';
      } else {
        inventory.status = 'normal';
      }
      
      // 记录库存调整日志
      const adjustmentLog = {
        id: DataGenerator.generateId(),
        sku: sku,
        productName: inventory.productName,
        type: adjustment > 0 ? 'increase' : 'decrease',
        quantity: Math.abs(adjustment),
        beforeStock: inventory.availableStock - adjustment,
        afterStock: inventory.availableStock,
        reason: reason,
        createdAt: DataGenerator.generateDate(0)
      };
      
      if (!mockData.inventoryLogs) {
        mockData.inventoryLogs = [];
      }
      mockData.inventoryLogs.push(adjustmentLog);
      
      return mockApi.createResponse(true, {
        inventory: inventory,
        log: adjustmentLog
      }, '库存调整成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '库存调整失败：' + error.message, 500);
    }
  },
  
  // 批量操作
  batchDeleteUsers: async (userIds) => {
    await mockApi.delay(800);
    mockApi.simulateNetworkError();
    
    try {
      const deletedUsers = [];
      userIds.forEach(id => {
        const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
        if (userIndex !== -1) {
          deletedUsers.push(mockData.users.splice(userIndex, 1)[0]);
        }
      });
      
      return mockApi.createResponse(true, deletedUsers, `成功删除 ${deletedUsers.length} 个用户`);
    } catch (error) {
      return mockApi.createResponse(false, null, '批量删除失败：' + error.message, 500);
    }
  },
  
  batchUpdateProductStatus: async (productIds, status) => {
    await mockApi.delay(600);
    mockApi.simulateNetworkError();
    
    try {
      const updatedProducts = [];
      productIds.forEach(id => {
        const productIndex = mockData.products.findIndex(p => p.id === parseInt(id));
        if (productIndex !== -1) {
          mockData.products[productIndex].status = status;
          mockData.products[productIndex].updatedAt = DataGenerator.generateDate(0);
          updatedProducts.push(mockData.products[productIndex]);
        }
      });
      
      return mockApi.createResponse(true, updatedProducts, `成功更新 ${updatedProducts.length} 个商品状态`);
    } catch (error) {
      return mockApi.createResponse(false, null, '批量更新失败：' + error.message, 500);
    }
  },
  
  batchUpdateOrderStatus: async (orderIds, status) => {
    await mockApi.delay(700);
    mockApi.simulateNetworkError();
    
    try {
      const updatedOrders = [];
      orderIds.forEach(id => {
        const orderIndex = mockData.orders.findIndex(o => o.id === parseInt(id));
        if (orderIndex !== -1) {
          mockData.orders[orderIndex].status = status;
          mockData.orders[orderIndex].updatedAt = DataGenerator.generateDate(0);
          
          // 处理状态变更的时间戳
          switch (status) {
            case 'paid':
              mockData.orders[orderIndex].paidAt = DataGenerator.generateDate(0);
              break;
            case 'shipped':
              mockData.orders[orderIndex].shippedAt = DataGenerator.generateDate(0);
              break;
            case 'completed':
              mockData.orders[orderIndex].completedAt = DataGenerator.generateDate(0);
              break;
            case 'cancelled':
              mockData.orders[orderIndex].cancelledAt = DataGenerator.generateDate(0);
              break;
          }
          
          updatedOrders.push(mockData.orders[orderIndex]);
        }
      });
      
      return mockApi.createResponse(true, updatedOrders, `成功更新 ${updatedOrders.length} 个订单状态`);
    } catch (error) {
      return mockApi.createResponse(false, null, '批量更新失败：' + error.message, 500);
    }
  },
  
  // 数据导出
  exportData: async (type, params = {}) => {
    await mockApi.delay(1000);
    mockApi.simulateNetworkError();
    
    try {
      let data = [];
      let filename = '';
      
      switch (type) {
        case 'users':
          data = mockData.users;
          filename = `用户数据_${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'products':
          data = mockData.products;
          filename = `商品数据_${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'orders':
          data = mockData.orders;
          filename = `订单数据_${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case 'inventory':
          data = mockData.inventory;
          filename = `库存数据_${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        default:
          return mockApi.createResponse(false, null, '不支持的导出类型', 400);
      }
      
      // 模拟生成下载链接
      const downloadUrl = `data:text/csv;charset=utf-8,${encodeURIComponent('模拟CSV数据')}`;
      
      return mockApi.createResponse(true, {
        downloadUrl: downloadUrl,
        filename: filename,
        recordCount: data.length
      }, '数据导出成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '数据导出失败：' + error.message, 500);
    }
  },
  
  // 数据统计
  getStatistics: async (type, dateRange = {}) => {
    await mockApi.delay(400);
    
    try {
      const stats = {};
      
      switch (type) {
        case 'overview':
          stats.totalUsers = mockData.users.length;
          stats.activeUsers = mockData.users.filter(u => u.status === 'active').length;
          stats.totalProducts = mockData.products.length;
          stats.activeProducts = mockData.products.filter(p => p.status === 'active').length;
          stats.totalOrders = mockData.orders.length;
          stats.pendingOrders = mockData.orders.filter(o => o.status === 'pending').length;
          stats.lowStockProducts = mockData.inventory.filter(i => i.status === 'low' || i.status === 'critical').length;
          break;
          
        case 'sales':
          const orders = mockData.orders.filter(o => o.status !== 'cancelled');
          stats.totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          stats.averageOrderValue = stats.totalSales / orders.length || 0;
          stats.ordersByStatus = {
            pending: orders.filter(o => o.status === 'pending').length,
            paid: orders.filter(o => o.status === 'paid').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            completed: orders.filter(o => o.status === 'completed').length
          };
          break;
          
        case 'inventory':
          stats.totalProducts = mockData.inventory.length;
          stats.totalStock = mockData.inventory.reduce((sum, item) => sum + item.totalStock, 0);
          stats.availableStock = mockData.inventory.reduce((sum, item) => sum + item.availableStock, 0);
          stats.reservedStock = mockData.inventory.reduce((sum, item) => sum + item.reservedStock, 0);
          stats.stockByStatus = {
            normal: mockData.inventory.filter(i => i.status === 'normal').length,
            low: mockData.inventory.filter(i => i.status === 'low').length,
            critical: mockData.inventory.filter(i => i.status === 'critical').length,
            out_of_stock: mockData.inventory.filter(i => i.status === 'out_of_stock').length
          };
          break;
      }
      
      return mockApi.createResponse(true, stats, '统计数据获取成功');
    } catch (error) {
      return mockApi.createResponse(false, null, '统计数据获取失败：' + error.message, 500);
    }
  }
};

// 导出数据和API
window.mockData = mockData;
window.mockApi = mockApi;
