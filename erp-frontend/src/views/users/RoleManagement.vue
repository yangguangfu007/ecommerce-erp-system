<template>
  <div class="role-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
      <div class="page-actions">
        <el-button @click="refreshRoleList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleAddRole">
          <el-icon><Plus /></el-icon>
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">系统角色</h3>
        <div class="card-actions">
          <span class="role-count">共 {{ roleList.length }} 个角色</span>
        </div>
      </div>
      
      <div class="card-body">
        <div v-loading="loading" class="role-grid">
          <div
            v-for="role in roleList"
            :key="role.id"
            class="role-card"
            :class="{ 'role-inactive': role.status === 0 }"
          >
            <div class="role-header">
              <h4 class="role-name">{{ role.roleName }}</h4>
              <span class="role-code">{{ role.roleCode }}</span>
            </div>
            
            <div class="role-description">
              {{ role.description || '暂无描述' }}
            </div>
            
            <div class="role-permissions">
              <div class="permission-count">
                权限数量: {{ role.permissions?.length || 0 }}
              </div>
              <div class="permission-list">
                <span
                  v-for="(permission, index) in role.permissions?.slice(0, 3)"
                  :key="permission.id"
                  class="permission-tag"
                >
                  {{ permission.permissionName }}
                </span>
                <span
                  v-if="(role.permissions?.length || 0) > 3"
                  class="permission-more"
                >
                  +{{ (role.permissions?.length || 0) - 3 }}
                </span>
              </div>
            </div>
            
            <div class="role-status">
              <el-tag
                :type="role.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ role.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
            
            <div class="role-actions">
              <el-button
                size="small"
                type="primary"
                @click="handleEditRole(role)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                @click="handleViewPermissions(role)"
              >
                权限
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteRole(role)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && roleList.length === 0" class="empty-state">
          <el-empty description="暂无角色数据">
            <el-button type="primary" @click="handleAddRole">
              添加第一个角色
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="isEditMode ? '编辑角色' : '添加角色'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="roleForm.roleName"
            placeholder="请输入角色名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="角色代码" prop="roleCode">
          <el-input
            v-model="roleForm.roleCode"
            placeholder="请输入角色代码"
            maxlength="50"
            show-word-limit
            :disabled="isEditMode"
          />
        </el-form-item>
        
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmitRole"
          >
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限配置"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="permission-config">
        <div class="permission-header">
          <h4>为角色 "{{ currentRole?.roleName }}" 配置权限</h4>
          <div class="permission-stats">
            <span>已选择 {{ selectedPermissions.length }} 个权限</span>
          </div>
        </div>
        
        <div class="permission-tree-container">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="selectedPermissions"
            @check="handlePermissionCheck"
          >
            <template #default="{ node, data }">
              <div class="permission-node">
                <span class="permission-name">{{ data.permissionName }}</span>
                <span class="permission-code">{{ data.permissionCode }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmitPermissions"
          >
            保存权限
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type TreeInstance } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'
import type { Role, Permission } from '@/types'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const roleList = ref<Role[]>([])
const permissionTree = ref<Permission[]>([])
const selectedPermissions = ref<number[]>([])

// 对话框状态
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEditMode = ref(false)
const currentRole = ref<Role | null>(null)

// 表单引用
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref<TreeInstance>()

// 角色表单数据
const roleForm = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  status: 1 as number // 1-启用，0-禁用（后端数字类型）
})

// 表单验证规则
const roleFormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色代码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 权限树配置
const treeProps = {
  children: 'children',
  label: 'permissionName'
}

/**
 * 加载角色列表
 */
const loadRoleList = async () => {
  try {
    loading.value = true
    const response = await userApi.getRoles()
    // 处理分页响应数据
    roleList.value = response.data?.records || response.data?.content || []
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载权限树
 */
const loadPermissionTree = async () => {
  try {
    const response = await userApi.getPermissionTree()
    permissionTree.value = response.data || []
  } catch (error) {
    console.error('加载权限树失败:', error)
    ElMessage.error('加载权限树失败')
  }
}

/**
 * 刷新角色列表
 */
const refreshRoleList = () => {
  ElMessage.info('正在刷新角色列表...')
  loadRoleList()
}

/**
 * 重置角色表单
 */
const resetRoleForm = () => {
  roleForm.roleName = ''
  roleForm.roleCode = ''
  roleForm.description = ''
  roleForm.status = 1
  roleFormRef.value?.clearValidate()
}

/**
 * 处理添加角色
 */
const handleAddRole = () => {
  isEditMode.value = false
  resetRoleForm()
  roleDialogVisible.value = true
}

/**
 * 处理编辑角色
 */
const handleEditRole = (role: Role) => {
  isEditMode.value = true
  currentRole.value = role
  roleForm.roleName = role.roleName
  roleForm.roleCode = role.roleCode
  roleForm.description = role.description || ''
  roleForm.status = role.status
  roleDialogVisible.value = true
}

/**
 * 处理提交角色
 */
const handleSubmitRole = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    submitting.value = true
    
    if (isEditMode.value && currentRole.value) {
      // 更新角色
      await userApi.updateRole(currentRole.value.id, roleForm)
      ElMessage.success('角色更新成功')
    } else {
      // 创建角色
      await userApi.createRole(roleForm)
      ElMessage.success('角色创建成功')
    }
    
    roleDialogVisible.value = false
    await loadRoleList()
  } catch (error) {
    console.error('提交角色失败:', error)
    ElMessage.error(isEditMode.value ? '角色更新失败' : '角色创建失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理查看权限
 */
const handleViewPermissions = async (role: Role) => {
  try {
    currentRole.value = role
    
    // 加载权限树（如果还没有加载）
    if (permissionTree.value.length === 0) {
      await loadPermissionTree()
    }
    
    // 获取角色的权限
    const response = await userApi.getRolePermissions(role.id)
    selectedPermissions.value = response.data?.map(p => p.id) || []
    
    permissionDialogVisible.value = true
  } catch (error) {
    console.error('加载角色权限失败:', error)
    ElMessage.error('加载角色权限失败')
  }
}

/**
 * 处理权限选择
 */
const handlePermissionCheck = (data: Permission, checked: any) => {
  // 更新选中的权限列表
  selectedPermissions.value = checked.checkedKeys
}

/**
 * 处理提交权限
 */
const handleSubmitPermissions = async () => {
  if (!currentRole.value) return
  
  try {
    submitting.value = true
    await userApi.assignRolePermissions(currentRole.value.id, selectedPermissions.value)
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
    await loadRoleList()
  } catch (error) {
    console.error('权限配置失败:', error)
    ElMessage.error('权限配置失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理删除角色
 */
const handleDeleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.roleName}" 吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userApi.deleteRole(role.id)
    ElMessage.success('角色删除成功')
    await loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoleList()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.card-body {
  padding: 24px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.role-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.role-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.role-card.role-inactive {
  opacity: 0.7;
  background: var(--el-bg-color-page);
}

.role-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.role-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.role-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 42px;
}

.role-permissions {
  margin-bottom: 16px;
}

.permission-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.permission-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.permission-more {
  display: inline-block;
  padding: 2px 8px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border-radius: 12px;
  font-size: 12px;
}

.role-status {
  margin-bottom: 16px;
}

.role-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.permission-config {
  max-height: 500px;
}

.permission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.permission-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.permission-stats {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.permission-tree-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
}

.permission-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.permission-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.permission-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Courier New', monospace;
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 3px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .role-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .role-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>