<template>
  <div class="notification-template-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">通知模板管理</h1>
        <div class="stats-summary">
          <el-tag type="info" size="small">
            总计: {{ pagination.total }}
          </el-tag>
          <el-tag type="success" size="small">
            激活: {{ activeTemplates.length }}
          </el-tag>
          <el-tag type="warning" size="small">
            草稿: {{ draftTemplates.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          @click="handleCreateTemplate"
          :loading="loading"
        >
          新建模板
        </el-button>
        <el-button 
          type="danger" 
          plain
          @click="handleBatchDelete"
          :disabled="selectedTemplates.length === 0"
          :loading="loading"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <el-card shadow="never" class="filter-card">
        <div class="filter-row">
          <div class="filter-group">
            <label>模板名称:</label>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索模板名称或标题..."
              prefix-icon="Search"
              clearable
              @input="handleSearch"
              style="width: 250px;"
            />
          </div>
          
          <div class="filter-group">
            <label>类型:</label>
            <el-select 
              v-model="currentFilter.type" 
              placeholder="全部类型"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="邮件" value="email" />
              <el-option label="短信" value="sms" />
              <el-option label="系统" value="system" />
              <el-option label="推送" value="push" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>分类:</label>
            <el-select 
              v-model="currentFilter.category" 
              placeholder="全部分类"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="系统" value="system" />
              <el-option label="订单" value="order" />
              <el-option label="库存" value="inventory" />
              <el-option label="物流" value="logistics" />
              <el-option label="平台" value="platform" />
            </el-select>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>