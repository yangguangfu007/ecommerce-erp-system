package com.erp.platform.repository;

import com.erp.platform.entity.StorePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 店铺权限仓储接口
 *
 * @author ERP System
 */
@Repository
public interface StorePermissionRepository extends JpaRepository<StorePermission, Long> {
    
    /**
     * 根据用户ID查找权限
     */
    List<StorePermission> findByUserId(Long userId);
    
    /**
     * 根据店铺ID查找权限
     */
    List<StorePermission> findByStoreId(Long storeId);
    
    /**
     * 根据用户ID和店铺ID查找权限
     */
    Optional<StorePermission> findByUserIdAndStoreId(Long userId, Long storeId);
    
    /**
     * 查找用户有权限的店铺ID列表
     */
    @Query("SELECT sp.storeId FROM StorePermission sp WHERE sp.userId = :userId")
    List<Long> findStoreIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 查找用户有特定权限的店铺ID列表
     */
    @Query("SELECT sp.storeId FROM StorePermission sp WHERE sp.userId = :userId AND " +
           "(:canRead IS NULL OR sp.canRead = :canRead) AND " +
           "(:canWrite IS NULL OR sp.canWrite = :canWrite) AND " +
           "(:canDelete IS NULL OR sp.canDelete = :canDelete) AND " +
           "(:canManage IS NULL OR sp.canManage = :canManage)")
    List<Long> findStoreIdsByUserIdAndPermissions(
            @Param("userId") Long userId,
            @Param("canRead") Boolean canRead,
            @Param("canWrite") Boolean canWrite,
            @Param("canDelete") Boolean canDelete,
            @Param("canManage") Boolean canManage);
    
    /**
     * 检查用户是否有店铺的特定权限
     */
    @Query("SELECT COUNT(sp) > 0 FROM StorePermission sp WHERE sp.userId = :userId AND sp.storeId = :storeId AND " +
           "(:canRead IS NULL OR sp.canRead = :canRead) AND " +
           "(:canWrite IS NULL OR sp.canWrite = :canWrite) AND " +
           "(:canDelete IS NULL OR sp.canDelete = :canDelete) AND " +
           "(:canManage IS NULL OR sp.canManage = :canManage)")
    boolean hasPermission(
            @Param("userId") Long userId,
            @Param("storeId") Long storeId,
            @Param("canRead") Boolean canRead,
            @Param("canWrite") Boolean canWrite,
            @Param("canDelete") Boolean canDelete,
            @Param("canManage") Boolean canManage);
    
    /**
     * 删除用户的店铺权限
     */
    void deleteByUserIdAndStoreId(Long userId, Long storeId);
    
    /**
     * 删除店铺的所有权限
     */
    void deleteByStoreId(Long storeId);
}