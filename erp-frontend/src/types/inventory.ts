export interface Inventory {
  id: string
  sku: string
  productId: string
  productName: string
  productImage?: string
  storeId: string
  storeName: string
  availableQuantity: number
  reservedQuantity: number
  totalQuantity: number
  safetyStock: number
  maxStock?: number
  status: InventoryStatus
  warehouseLocation?: string
  cost: number
  totalValue: number
  lastUpdated: string
  recentTransactions?: InventoryTransaction[]
  createTime: string
  updateTime: string
}

export interface InventoryTransaction {
  id: string
  inventoryId: string
  type: 'IN' | 'OUT'
  quantity: number
  reason: string
  note?: string
  referenceNumber?: string
  operatorId: string
  operatorName: string
  createdAt: string
}

export type InventoryStatus = 
  | 'NORMAL'      // 正常
  | 'LOW_STOCK'   // 低库存
  | 'OUT_OF_STOCK' // 缺货
  | 'OVERSTOCK'   // 超库存

export interface InventorySearchParams {
  sku?: string
  productName?: string
  storeId?: string
  status?: InventoryStatus | ''
  lowStock?: boolean
  warehouseLocation?: string
  minQuantity?: number
  maxQuantity?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InventoryAdjustment {
  type: 'IN' | 'OUT'
  quantity: number
  reason: 'PURCHASE' | 'RETURN' | 'SALE' | 'DAMAGE' | 'TRANSFER' | 'STOCKTAKING' | 'OTHER'
  note?: string
  referenceNumber?: string
}

export interface InventoryHistory {
  id: string
  inventoryId: string
  sku: string
  productName: string
  type: 'IN' | 'OUT'
  quantity: number
  beforeQuantity: number
  afterQuantity: number
  reason: string
  note?: string
  referenceNumber?: string
  operatorId: string
  operatorName: string
  createdAt: string
}

export interface InventoryAlert {
  id: string
  inventoryId: string
  sku: string
  productName: string
  storeId: string
  storeName: string
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  currentQuantity: number
  safetyStock: number
  maxStock?: number
  alertTime: string
  isRead: boolean
  isHandled: boolean
}

export interface InventoryTransfer {
  id: string
  transferNumber: string
  fromStoreId: string
  fromStoreName: string
  toStoreId: string
  toStoreName: string
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  items: InventoryTransferItem[]
  reason: string
  note?: string
  operatorId: string
  operatorName: string
  createdAt: string
  completedAt?: string
}

export interface InventoryTransferItem {
  id: string
  transferId: string
  sku: string
  productName: string
  quantity: number
  transferredQuantity: number
  status: 'PENDING' | 'COMPLETED'
}

export interface StockTaking {
  id: string
  name: string
  description?: string
  storeId: string
  storeName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  itemCount: number
  completedCount: number
  discrepancyCount: number
  warehouseLocation?: string
  operatorId: string
  operatorName: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  items?: StockTakingItem[]
}

export interface StockTakingItem {
  id: string
  stockTakingId: string
  sku: string
  productName: string
  systemQuantity: number
  actualQuantity?: number
  discrepancy?: number
  note?: string
  status: 'PENDING' | 'COMPLETED'
  operatorId?: string
  operatorName?: string
  updatedAt?: string
}

export interface InventoryStatistics {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  overstockItems: number
  normalItems: number
  turnoverRate: number
  averageCost: number
  topSellingItems: Array<{
    sku: string
    productName: string
    quantity: number
    value: number
  }>
  slowMovingItems: Array<{
    sku: string
    productName: string
    quantity: number
    lastSaleDate?: string
  }>
}

export interface InventoryTrend {
  date: string
  quantity: number
  inQuantity: number
  outQuantity: number
  value: number
}

export interface CreateInventoryData {
  sku: string
  productId: string
  storeId: string
  initialQuantity: number
  safetyStock: number
  maxStock?: number
  cost: number
  warehouseLocation?: string
}

export interface UpdateInventoryData {
  safetyStock?: number
  maxStock?: number
  warehouseLocation?: string
  cost?: number
}

export interface InventoryImportResult {
  total: number
  success: number
  failed: number
  errors: Array<{
    row: number
    sku: string
    error: string
  }>
}