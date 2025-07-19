package com.erp.platform.repository;

import com.erp.platform.entity.PlatformStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 平台店铺仓储接口
 *
 * @author ERP System
 */
@Repository
public interface PlatformStoreRepository extends JpaRepository<PlatformStore, Long> {
    
    /**
     * 根据平台类型查找店铺
     */
    List<PlatformStore> findByPlatformTypeAndStatus(String platformType, PlatformStore.StoreStatus status);
    
    /**
     * 根据状态查找店铺
     */
    List<PlatformStore> findByStatus(PlatformStore.StoreStatus status);
    
    /**
     * 根据店铺名称查找
     */
    Optional<PlatformStore> findByStoreNameAndStatus(String storeName, PlatformStore.StoreStatus status);
    
    /**
     * 根据平台店铺ID查找
     */
    Optional<PlatformStore> findByPlatformStoreIdAndStatus(String platformStoreId, PlatformStore.StoreStatus status);
    
    /**
     * 查询需要检查连接状态的店铺
     */
    @Query("SELECT p FROM PlatformStore p WHERE p.status = 'ACTIVE' AND " +
           "(p.lastConnectionCheck IS NULL OR p.lastConnectionCheck < :checkTime)")
    List<PlatformStore> findStoresNeedConnectionCheck(@Param("checkTime") java.time.LocalDateTime checkTime);
}