<template>
  <div class="inventory-test">
    <h2>库存管理测试页面</h2>
    
    <div style="margin: 20px 0;">
      <el-button @click="loadData" :loading="loading">加载数据</el-button>
      <span style="margin-left: 20px;">
        数据状态: {{ loading ? '加载中' : '已完成' }}
      </span>
    </div>
    
    <div style="margin: 20px 0;">
      <p>API响应: {{ apiResponse ? '有数据' : '无数据' }}</p>
      <p>Store数据: {{ storeData.length }} 条</p>
      <p>计算属性: {{ inventoryList.length }} 条</p>
    </div>
    
    <div v-if="apiResponse">
      <h3>原始API数据 (前3条):</h3>
      <pre>{{ JSON.stringify(apiResponse.slice(0, 3), null, 2) }}</pre>
    </div>
    
    <div v-if="storeData.length > 0">
      <h3>Store处理后数据 (前3条):</h3>
      <pre>{{ JSON.stringify(storeData.slice(0, 3), null, 2) }}</pre>
    </div>
    
    <div style="margin: 20px 0;">
      <h3>表格测试:</h3>
      <el-table :data="inventoryList" style="width: 100%" border>
        <el-table-column prop="sku" label="SKU" width="150"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="200"></el-table-column>
        <el-table-column prop="totalQuantity" label="总库存" width="100"></el-table-column>
        <el-table-column prop="availableQuantity" label="可用库存" width="100"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { inventoryApi } from '@/api/modules/inventory'

const inventoryStore = useInventoryStore()
const loading = ref(false)
const apiResponse = ref<any[]>([])

const storeData = computed(() => inventoryStore.state.inventories)
const inventoryList = computed(() => inventoryStore.inventoryList)

const loadData = async () => {
  loading.value = true
  try {
    console.log('测试页面: 开始加载数据')
    
    // 直接调用API
    const directApiResponse = await inventoryApi.getInventoryList({ page: 1, size: 10 })
    console.log('测试页面: 直接API调用结果:', directApiResponse)
    apiResponse.value = directApiResponse.data || []
    
    // 通过Store调用
    const storeResponse = await inventoryStore.getInventoryList({ page: 1, size: 10 })
    console.log('测试页面: Store调用结果:', storeResponse)
    
    console.log('测试页面: Store状态:', inventoryStore.state)
    console.log('测试页面: 计算属性值:', inventoryList.value)
    
  } catch (error) {
    console.error('测试页面: 加载失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.inventory-test {
  padding: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>