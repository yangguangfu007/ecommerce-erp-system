<template>
  <div class="user-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">用户列表</h2>
      <div class="page-actions">
        <el-button type="primary" @click="handleAddUser" data-test="add-user-btn">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button @click="handleRefresh" data-test="refresh-btn">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 数据表格容器 -->
    <div class="data-table-container">
      <!-- 表格头部 -->
      <div class="table-header">
        <div class="table-title">
          <h3>用户信息</h3>
          <span class="table-count">共 <strong>{{ pagination.total }}</strong> 条记录</span>
        </div>
        <div class="table-actions">
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDelete"
            data-test="batch-delete-btn"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格筛选 -->
      <div class="table-filters">
        <div class="filter-group">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名或邮箱..."
            class="filter-input"
            clearable
            @keyup.enter="handleSearch"
            data-test="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            class="filter-select"
            clearable
            data-test="status-select"
          >
            <el-option label="全部状态" value="" />
            <el-option label="启用" value="ACTIVE" />
            <el-option label="禁用" value="INACTIVE" />
          </el-select>
          <el-button @click="handleResetFilters" data-test="reset-btn">重置</el-button>
          <el-button type="primary" @click="handleSearch" data-test="search-btn">搜索</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="userList"
          class="data-table"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" sortable="custom" data-test="sort-id" />
          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :src="row.avatar" 
                  class="user-avatar-small"
                  :alt="row.username"
                >
                  {{ row.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ row.realName || row.username }}</div>
                  <div class="user-email">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'ACTIVE' ? 'success' : 'danger'"
                class="status-badge"
              >
                {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="角色" min-width="150">
            <template #default="{ row }">
              <div class="user-roles">
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  size="small"
                  class="role-tag"
                >
                  {{ role.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column 
            prop="createdAt" 
            label="创建时间" 
            width="180" 
            sortable="custom"
            data-test="sort-created-at"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  size="small" 
                  @click="handleViewUser(row)"
                  title="查看详情"
                  :data-test="`view-user-${row.id}`"
                >
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="handleEditUser(row)"
                  title="编辑"
                  :data-test="`edit-user-${row.id}`"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
                  @click="handleToggleStatus(row)"
                  :title="row.status === 'ACTIVE' ? '禁用' : '启用'"
                  :data-test="`toggle-status-${row.id}`"
                >
                  <el-icon>
                    <component :is="row.status === 'ACTIVE' ? 'CircleClose' : 'CircleCheck'" />
                  </el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="handleDeleteUser(row)"
                  title="删除"
                  :data-test="`delete-user-${row.id}`"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="table-pagination">
        <div class="pagination-info">
          显示第 {{ (pagination.page - 1) * pagination.size + 1 }}-{{ Math.min(pagination.page * pagination.size, pagination.total) }} 条，共 {{ pagination.total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      class="user-dialog"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        label-width="100px"
        class="user-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="userForm.username" 
                  placeholder="请输入用户名（3-20个字符）"
                  :disabled="isEdit"
                  data-test="username-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="userForm.email" 
                  placeholder="请输入邮箱地址"
                  data-test="email-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="昵称" prop="nickname">
                <el-input 
                  v-model="userForm.nickname" 
                  placeholder="请输入昵称"
                  data-test="nickname-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="userForm.status" placeholder="请选择状态">
                  <el-option label="启用" value="ACTIVE" />
                  <el-option label="禁用" value="INACTIVE" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="!isEdit" :gutter="20">
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="userForm.password" 
                  type="password" 
                  placeholder="请输入密码（6-20位）"
                  show-password
                  data-test="password-input"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="userForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入密码"
                  show-password
                  data-test="confirm-password-input"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <h4 class="section-title">角色权限</h4>
          <el-form-item label="用户角色" prop="roleIds">
            <el-checkbox-group v-model="userForm.roleIds" class="role-checkbox-group">
              <el-checkbox 
                v-for="role in roleList" 
                :key="role.id" 
                :label="role.id"
                class="role-checkbox"
                :data-test="`role-checkbox-${role.id}`"
              >
                {{ role.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="权限预览">
            <div class="permission-preview">
              <div v-if="selectedPermissions.length === 0" class="permission-placeholder">
                请选择角色以查看对应权限
              </div>
              <div v-else class="permission-list">
                <el-tag
                  v-for="permission in selectedPermissions"
                  :key="permission"
                  size="small"
                  class="permission-tag"
                >
                  {{ permission }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit" data-test="submit-btn">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
      class="user-detail-dialog"
    >
      <div v-if="currentUser" class="user-detail-content">
        <div class="user-avatar-section">
          <el-avatar 
            :src="currentUser.avatar" 
            :size="80"
            class="user-avatar-large"
          >
            {{ currentUser.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="user-basic-info">
            <h4>{{ currentUser.username }}</h4>
            <p>{{ currentUser.email }}</p>
            <el-tag 
              :type="currentUser.status === 'ACTIVE' ? 'success' : 'danger'"
              class="status-badge"
            >
              {{ currentUser.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>

        <div class="user-detail-info">
          <div class="info-row">
            <label>用户ID：</label>
            <span>{{ currentUser.id }}</span>
          </div>
          <div class="info-row">
            <label>昵称：</label>
            <span>{{ currentUser.nickname || '-' }}</span>
          </div>
          <div class="info-row">
            <label>角色：</label>
            <div class="user-roles">
              <el-tag
                v-for="role in currentUser.roles"
                :key="role.id"
                size="small"
                class="role-tag"
              >
                {{ role.name }}
              </el-tag>
            </div>
          </div>
          <div class="info-row">
            <label>创建时间：</label>
            <span>{{ formatDateTime(currentUser.createdAt) }}</span>
          </div>
          <div class="info-row">
            <label>最后登录：</label>
            <span>{{ formatDateTime(currentUser.lastLoginTime) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEditFromDetail">编辑</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Plus, 
  Refresh, 
  Download, 
  Delete, 
  Search, 
  View, 
  Edit, 
  CircleClose, 
  CircleCheck 
} from '@element-plus/icons-vue'
import { userApi, type UserQuery, type CreateUserForm, type UpdateUserForm } from '@/api/modules/user'
import type { User, Role, PageResponse } from '@/types'
import { formatDateTime } from '@/utils'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const userList = ref<User[]>([])
const roleList = ref<Role[]>([])
const selectedUsers = ref<User[]>([])
const currentUser = ref<User | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive<Partial<UserQuery>>({
  keyword: '',
  status: ''
})

// 排序数据
const sortData = reactive({
  prop: '',
  order: ''
})

// 对话框状态
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)

// 用户表单
const userForm = reactive<CreateUserForm & { id?: number }>({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  roleIds: [],
  status: 'ACTIVE'
})

// 表单引用
const formRef = ref<FormInstance>()
const tableRef = ref()

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

const selectedPermissions = computed(() => {
  const permissions = new Set<string>()
  userForm.roleIds.forEach(roleId => {
    const role = roleList.value.find(r => r.id === roleId)
    if (role) {
      role.permissions.forEach(permission => {
        permissions.add(permission.name)
      })
    }
  })
  return Array.from(permissions)
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应在2-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20位之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  roleIds: [
    { required: true, message: '请至少选择一个角色', trigger: 'change' }
  ]
}

// 方法
const fetchUsers = async () => {
  loading.value = true
  try {
    const query: UserQuery = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    
    if (sortData.prop) {
      query.sort = sortData.prop
      query.order = sortData.order === 'ascending' ? 'asc' : 'desc'
    }

    const response = await userApi.getUsers(query)
    userList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await userApi.getRoles()
    roleList.value = response.data
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

const handleAddUser = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEditUser = (user: User) => {
  isEdit.value = true
  currentUser.value = user
  Object.assign(userForm, {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    status: user.status,
    roleIds: user.roles.map(role => role.id),
    password: '',
    confirmPassword: ''
  })
  dialogVisible.value = true
}

const handleViewUser = (user: User) => {
  currentUser.value = user
  detailDialogVisible.value = true
}

const handleEditFromDetail = () => {
  detailDialogVisible.value = false
  if (currentUser.value) {
    handleEditUser(currentUser.value)
  }
}

const handleDeleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？删除后无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userApi.deleteUser(user.id)
    ElMessage.success('删除成功')
    await fetchUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleStatus = async (user: User) => {
  const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const statusText = newStatus === 'ACTIVE' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}用户 "${user.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (newStatus === 'ACTIVE') {
      await userApi.activateUser(user.id)
    } else {
      await userApi.deactivateUser(user.id)
    }
    
    ElMessage.success(`${statusText}成功`)
    await fetchUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败`)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？删除后无法恢复。`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const userIds = selectedUsers.value.map(user => user.id)
    await userApi.batchOperateUsers({
      userIds,
      operation: 'delete'
    })
    
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
    await fetchUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      const { password, confirmPassword, ...updateData } = userForm
      await userApi.updateUser(updateData as UpdateUserForm)
      ElMessage.success('更新成功')
    } else {
      await userApi.createUser(userForm as CreateUserForm)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await fetchUsers()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handleResetFilters = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: ''
  })
  pagination.page = 1
  fetchUsers()
}

const handleRefresh = () => {
  fetchUsers()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handleSortChange = ({ prop, order }: any) => {
  sortData.prop = prop
  sortData.order = order
  fetchUsers()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchUsers()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchUsers()
}

const resetForm = () => {
  Object.assign(userForm, {
    id: undefined,
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    roleIds: [],
    status: 'ACTIVE'
  })
  formRef.value?.clearValidate()
}

// 监听角色变化，更新权限预览
watch(() => userForm.roleIds, () => {
  // 权限预览会自动更新，因为使用了计算属性
}, { deep: true })

// 生命周期
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<style scoped>
/* 页面头部样式 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

/* 数据表格容器样式 */
.data-table-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.table-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px;
}

.table-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.table-count strong {
  color: var(--el-color-primary);
}

.table-actions {
  display: flex;
  gap: 12px;
}

/* 表格筛选样式 */
.table-filters {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-input {
  width: 240px;
}

.filter-select {
  width: 120px;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
}

.data-table :deep(.el-table__header-wrapper) {
  background: var(--el-bg-color-page);
}

.data-table :deep(.el-table__row:hover) {
  background: var(--el-bg-color-page);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border: 2px solid var(--el-border-color-light);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-tag {
  font-size: 12px;
}

.status-badge {
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 分页样式 */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.pagination-info {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 对话框样式 */
.user-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.user-form {
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.role-checkbox {
  margin-right: 0;
}

.permission-preview {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 16px;
  min-height: 80px;
}

.permission-placeholder {
  color: var(--el-text-color-secondary);
  font-style: italic;
  text-align: center;
  padding: 16px 0;
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  font-size: 12px;
}

/* 用户详情样式 */
.user-detail-content {
  padding: 20px 0;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.user-avatar-large {
  border: 3px solid var(--el-border-color-light);
}

.user-basic-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.user-basic-info p {
  margin: 0 0 12px 0;
  color: var(--el-text-color-secondary);
}

.user-detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-row label {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 80px;
}

.info-row span {
  color: var(--el-text-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .page-actions {
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .table-pagination {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .user-avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>